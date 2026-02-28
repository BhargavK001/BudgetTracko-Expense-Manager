require('dotenv').config({ path: '../.env' }); // Load from parent dir
const aiClient = require('../src/tracko-pulse/api/ai-client');
const { askTrackoTemplate } = require('../src/tracko-pulse/api/prompt-builder');

async function testAskTracko() {
    console.log("=== Tracko Pulse Diagnostics ===");
    console.log(`Gemini Key Configured: ${process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_key'}`);
    console.log(`Groq Key Configured: ${process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_key'}`);
    console.log(`OpenRouter Key Configured: ${process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'your_openrouter_key'}`);
    console.log("================================\n");

    const mockSummary = {
        month: "October 2026",
        totalBudget: 15000,
        totalSpent: 12500,
        remainingBalance: 2500,
        topCategories: [
            { name: "Food", amount: 6000, percentage: 48 },
            { name: "Transport", amount: 2000, percentage: 16 }
        ],
        upcomingBillsNext7Days: "No upcoming bills in the next 7 days"
    };

    const question = "Can I afford to buy a new gaming mouse for 3000 rs?";

    console.log(`User Question: "${question}"\n`);
    const prompt = askTrackoTemplate(mockSummary, question);

    try {
        console.log("Triggering tracko-pulse AI Client...");
        const result = await aiClient.generateResponse(prompt);
        console.log("\n✅ AI Response Success!");
        console.log("Provider Used:", result.provider);
        console.log("Answer:\n", result.text);
        console.log("\nTrace History:\n", result.trace.join('\n'));
    } catch (error) {
        console.error("\n❌ Core Error:", error.message);
    }
}

testAskTracko();
