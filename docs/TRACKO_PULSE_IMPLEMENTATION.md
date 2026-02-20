# 🚀 Tracko-Pulse — AI Financial Coach
### Implementation Plan for BudgetTracko Ecosystem

> **Target Users:** Students & Young Professionals
> **AI Stack:** Gemini 1.5 Flash (Primary) + Groq / LLaMA 3 (Fallback)
> **Purpose:** An intelligent AI layer that sits on top of existing BudgetTracko transaction data and gives human-like financial advice.

---

## 📌 Overview

Tracko-Pulse is not a standalone app. It is an extension of BudgetTracko — it reads the transaction and budget data that already exists and passes it through an AI layer to generate advice, analysis, and smart nudges. The three core pillars are the Ask Tracko chat, the Pulse Analysis monthly dashboard, and the Smart Notification system.

---

## 🔑 API Strategy

### Primary — Google Gemini 1.5 Flash
Gemini is the main AI provider. It is free via Google AI Studio with a limit of 15 requests per minute and 1 million tokens per day, which is more than sufficient for a student-scale app. Its large context window makes it ideal for passing full monthly summaries. Get your key at aistudio.google.com.

### Fallback — Groq (LLaMA 3 8B)
Groq is the automatic backup. If Gemini takes longer than 5 seconds or throws any error, the system silently switches to Groq and completes the request. Groq is free, extremely fast due to its custom hardware, and allows 30 requests per minute with 14,400 requests per day. Get your key at console.groq.com. Users will never know a switch happened.

### Why Two Providers?
Relying on a single free-tier API is risky. Rate limits, outages, or key expiry can break the entire feature. The fallback costs nothing extra and makes the product feel reliable even on a zero-budget infrastructure.

---

## ⚠️ Critical Architecture Rule — The Summarizer

**Never send raw transaction data directly to the AI.** Raw transaction arrays can contain hundreds of entries, which wastes tokens, slows down responses, and burns through the free tier quickly.

Before any AI call, transaction data must be pre-processed into a compact summary that includes only what the AI needs: total budget, total spent, remaining balance, top 3 spending categories with percentages, upcoming bills in the next 7 days, and the current month name. This reduces token usage by roughly 80% and keeps every response fast and within free limits.

This summarizer runs on the backend before every single AI request, for all three modules.

---

## 🧠 Module 1 — Ask Tracko (Interactive Chat)

### What It Does
A real-time chat interface where users ask financial questions in plain language and get direct, personalised answers based on their actual spending data.

### Core Use Cases

**Trip Planner** — User asks if they can afford a trip of a specific amount. The AI checks their current balance against upcoming bills and gives a clear yes, no, or "here's what you need to cut first" answer.

**Micro Decisions** — User asks about a small purchase like a coffee or a movie ticket. The AI checks the health of the relevant spending category (dining, entertainment) and responds accordingly.

**Savings Goals** — User names a goal, a target amount, and a deadline. The AI calculates the required daily or weekly saving and tells them whether it's realistic given their current balance.

### How It Works
The user types a question on the frontend. The backend summarizes their current transaction data, combines it with the question into a structured prompt, and sends it to Gemini (or Groq as fallback). The response comes back in 2–4 short sentences and is displayed in the chat UI.

### Prompt Structure (What Gets Sent to the AI)
Every prompt includes the following in this exact order: a persona instruction telling the AI to be direct and slightly witty, the user's financial snapshot (budget, spent, balance, top categories, upcoming bills), and then the user's actual question. The AI is instructed to answer in 2–4 sentences using only the data provided.

---

## 📊 Module 2 — Pulse Analysis (Monthly Deep-Dive)

### What It Does
A dedicated dashboard page that generates a full AI-written analysis of the user's month. It is triggered manually by the user at any point during or after the month.

### Four Output Sections

**The Roast** — One punchy, funny sentence that calls out the biggest overspend by name with real numbers. Example tone: "You spent 40% of your budget on Swiggy — that's roughly 12 hours of freelancing just to cover noodles." This section is intentionally shareable and designed to be the viral hook of the feature.

**The Praise** — One sentence acknowledging something the user did well this month. This keeps the tone balanced and prevents the Roast from feeling discouraging.

**The Hustle Tip** — One specific side hustle idea directly connected to the user's top spending category. If they spend a lot on design assets, suggest freelancing on Fiverr. If they spend on food delivery, suggest a meal-prep side business. The tip must feel personalised, not generic.

**The Investment Tip** — One beginner-friendly suggestion for what to do with any remaining balance. Should reference real platforms the target audience knows — Jar for spare change investing, Groww for mutual funds, etc. This section must always be framed as a suggestion, never as financial advice.

### How It Works
The user clicks "Generate My Pulse" on the dashboard. The backend summarizes the full month's transactions, sends a structured prompt to the AI asking for all four sections in JSON format, and the frontend maps each JSON field to its own card on the dashboard. The JSON format is required so the frontend can style each section differently rather than rendering a wall of text.

### Important Note on JSON Parsing
The AI occasionally adds extra text around the JSON response. The backend must always wrap the parse in error handling and have a graceful fallback UI in case parsing fails — for example, displaying the raw text in a single card rather than crashing the page.

---

## 🔔 Module 3 — Smart Notifications (The Nudge)

### What It Does
A background scheduler that sends proactive notifications to users without them having to ask. Three types of nudges run on fixed schedules.

### Friday Evening Nudge
Runs every Friday at 6 PM. The AI looks at the user's current balance and generates a single short notification (under 20 words) warning them about weekend spending. The tone is casual and friendly, not preachy. Example: "₹1,200 left and it's Friday. Maybe skip the third round tonight?"

### Subscription Guardian
Runs every Monday at 9 AM. The system scans for recurring payments marked as subscriptions where the user has not made any related usage transaction in over 14 days — a signal the subscription may be going unused. It sends an alert naming the subscription, the amount being charged, and how many days since it was last used. No AI call is needed for this one — it is entirely rule-based logic.

### Streak Alert
Runs every evening at 8 PM. If the user has not logged a transaction that day, they receive a friendly reminder to keep their tracking streak alive. This is a gamification mechanic to build the daily habit of using BudgetTracko. The streak counter resets if the user misses a day.

### Activation Rules
The Friday Nudge should only activate after the user has at least 2–3 weeks of transaction history so the predictions are meaningful. New users should see a prompt to add more data instead of receiving a nudge with no context.

---

## 📁 File & Folder Structure

```
tracko-pulse/
├── api/
│   ├── ai-client              — Primary + fallback AI handler
│   ├── prompt-builder         — All prompt templates live here
│   └── routes/
│       ├── ask-tracko         — Chat and savings goal endpoints
│       └── pulse-analysis     — Monthly deep-dive endpoint
├── services/
│   ├── transaction-summarizer — Compresses raw data before AI calls
│   ├── notification-scheduler — Cron jobs for all three nudges
│   └── subscription-detector  — Rule-based unused subscription scanner
└── .env                       — API keys (never commit this file)
```

---

## 🗺️ Implementation Roadmap

### Phase 1 — Foundation (Week 1–2)
Set up both API keys and confirm they work independently. Build the transaction summarizer and test it against real sample data. Build the AI client with fallback logic and verify that Groq actually triggers when Gemini is blocked or slow. Build all prompt templates and test each one manually using a tool like Postman before connecting any frontend.

### Phase 2 — Ask Tracko Chat (Week 3)
Build the chat API routes for general questions and savings goals separately. Connect both to the frontend chat UI. Test edge cases including zero balance, no upcoming bills, and first-time users with very few transactions to make sure the AI response still makes sense.

### Phase 3 — Pulse Analysis Dashboard (Week 4)
Build the monthly analysis API route. Build the frontend dashboard page with four separate cards for the Roast, Praise, Hustle Tip, and Investment Tip. Add a loading state while the AI generates and a fallback UI for JSON parse failures so the page never crashes.

### Phase 4 — Smart Notifications (Week 5)
Implement the cron scheduler for all three nudge types. Build and test the unused subscription detector logic independently before plugging it into the scheduler. Connect everything to whatever push notification or email system BudgetTracko already uses. Test the Friday nudge and Monday subscription scan in a staging environment before going live.

### Phase 5 — Polish & Launch (Week 6)
Add proper error messages on the frontend for when the AI service is unavailable. Add logging on the backend to record which provider handled each request so you can monitor if Groq is being triggered more than expected — that would signal a Gemini issue. Write unit tests for the summarizer since it is the most critical piece of the entire pipeline. Final review, QA pass, and deploy.

---

## 📋 Developer Checklist

- [ ] Gemini API key added to `.env` and tested
- [ ] Groq API key added to `.env` and tested
- [ ] Fallback confirmed — Groq fires when Gemini times out or errors
- [ ] Transaction summarizer tested with real sample data
- [ ] All prompt templates reviewed and approved by the team
- [ ] Ask Tracko general chat working end-to-end
- [ ] Savings goal calculator working end-to-end
- [ ] Pulse Analysis JSON response parsing with fallback working
- [ ] Friday evening nudge cron job tested
- [ ] Subscription guardian logic tested
- [ ] Streak alert cron job tested
- [ ] `.env` confirmed in `.gitignore` — keys never committed
- [ ] Confirmed via logs that raw transaction arrays are never sent directly to AI
- [ ] Loading states and error states present on all AI-powered UI components

---

## ⚠️ Rules for Every Developer on This Feature

Never send raw transaction arrays to the AI. Always run data through the summarizer first without exception. Never hardcode API keys anywhere in the codebase — use environment variables only. Always handle the case where the AI returns an unexpected response format, especially for Pulse Analysis which expects JSON. Frame all investment and hustle suggestions as ideas, never as financial advice. If you add a new prompt template, add it to the prompt-builder file — never write prompts inline inside route handlers, as that makes them impossible to maintain or update consistently.

---

*Built for BudgetTracko · AI Intelligence Layer by Tracko-Pulse*
