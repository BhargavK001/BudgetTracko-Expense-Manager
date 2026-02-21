// src/tracko-pulse/api/ai-client.js
require('dotenv').config();
const AppConfig = require('../../models/AppConfig');

class AIClient {
    constructor() {
        // We no longer rely on statically assigning this during class init.
        // Credentials will be fetched dynamically per-request.
    }

    /**
     * Dynamically fetches AI credentials from MongoDB AppConfig.
     * Falls back to tightly-coupled .env variables if DB values are empty or missing.
     */
    async getCredentials() {
        try {
            const configs = await AppConfig.find({
                key: { $in: ['gemini_api_key', 'groq_api_key', 'openrouter_api_key'] }
            });

            const dbKeys = configs.reduce((acc, item) => {
                acc[item.key] = item.value;
                return acc;
            }, {});

            return {
                gemini: dbKeys.gemini_api_key || process.env.GEMINI_API_KEY,
                groq: dbKeys.groq_api_key || process.env.GROQ_API_KEY,
                openRouter: dbKeys.openrouter_api_key || process.env.OPENROUTER_API_KEY
            };
        } catch (error) {
            console.error("Tracko-Pulse: Failed to query DB for API keys. Falling back completely to .env", error);
            return {
                gemini: process.env.GEMINI_API_KEY,
                groq: process.env.GROQ_API_KEY,
                openRouter: process.env.OPENROUTER_API_KEY
            };
        }
    }

    async generateResponse(prompt) {
        let trace = [];
        const { gemini, groq, openRouter } = await this.getCredentials();

        // 1. Try Gemini
        try {
            console.log("Tracko-Pulse: Attempting Primary (Gemini)");
            const start = Date.now();
            const response = await this.fetchGemini(prompt, gemini);
            trace.push(`Gemini succeeded in ${Date.now() - start}ms`);
            return {
                text: response,
                provider: "Gemini",
                trace
            };
        } catch (error) {
            console.error(`Tracko-Pulse: Gemini Failed - ${error.message}`);
            trace.push(`Gemini failed: ${error.message}`);
        }

        // 2. Try Groq Fallback
        try {
            console.log("Tracko-Pulse: Attempting Fallback 1 (Groq)");
            const start = Date.now();
            const response = await this.fetchGroq(prompt, groq);
            trace.push(`Groq succeeded in ${Date.now() - start}ms`);
            return {
                text: response,
                provider: "Groq",
                trace
            };
        } catch (error) {
            console.error(`Tracko-Pulse: Groq Failed - ${error.message}`);
            trace.push(`Groq failed: ${error.message}`);
        }

        // 3. Try OpenRouter Final Fallback
        try {
            console.log("Tracko-Pulse: Attempting Fallback 2 (OpenRouter)");
            const start = Date.now();
            const response = await this.fetchOpenRouter(prompt, openRouter);
            trace.push(`OpenRouter succeeded in ${Date.now() - start}ms`);
            return {
                text: response,
                provider: "OpenRouter",
                trace
            };
        } catch (error) {
            console.error(`Tracko-Pulse: OpenRouter Failed - ${error.message}`);
            trace.push(`OpenRouter failed: ${error.message}`);
            throw new Error(`All AI Providers Failed. Trace: ${JSON.stringify(trace)}`);
        }
    }

    async fetchGemini(prompt, apiKey) {
        if (!apiKey || apiKey === 'your_gemini_key') throw new Error("Missing Gemini Key");
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        // Timeout AbortController to fallback quickly if it hangs (e.g. 10s)
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            }),
            signal: controller.signal
        });
        clearTimeout(timeout);
        await this.handleResponseError(res, "Gemini");
        const data = await res.json();
        return data.candidates[0].content.parts[0].text;
    }

    async fetchGroq(prompt, apiKey) {
        if (!apiKey || apiKey === 'your_groq_key') throw new Error("Missing Groq Key");
        const url = `https://api.groq.com/openai/v1/chat/completions`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }],
                stream: false,
                max_tokens: 800
            }),
            signal: controller.signal
        });
        clearTimeout(timeout);
        await this.handleResponseError(res, "Groq");
        const data = await res.json();
        return data.choices[0].message.content;
    }

    async fetchOpenRouter(prompt, apiKey) {
        if (!apiKey || apiKey === 'your_openrouter_key') throw new Error("Missing OpenRouter Key");
        const url = `https://openrouter.ai/api/v1/chat/completions`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': process.env.BACKEND_URL || 'http://localhost:5000',
                'X-Title': 'BudgetTracko Pulse'
            },
            body: JSON.stringify({
                model: "openrouter/free",
                messages: [{ role: "user", content: prompt }],
                stream: false,
                max_tokens: 800
            }),
            signal: controller.signal
        });
        clearTimeout(timeout);
        await this.handleResponseError(res, "OpenRouter");
        const data = await res.json();
        return data.choices[0].message.content;
    }

    async handleResponseError(res, provider) {
        if (!res.ok) {
            let errMsg = `HTTP Status ${res.status}`;
            try {
                const errData = await res.json();
                errMsg = JSON.stringify(errData);
            } catch (e) {
                // If json parsing fails, ignore as body might be text
            }
            throw new Error(`Provider API Error (${provider}): ${res.status} - ${errMsg}`);
        }
    }
}

module.exports = new AIClient();
