import Groq from "groq-sdk";
import { ApiError } from "../utils/ApiError.js";

let client = null;

const getClient = () => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new ApiError(
            503,
            "Groq API Key is not Configured. Add Key to .env File"
        );
    }

    if (!client) client = new Groq({ apiKey });
    return client;
};

const MODEL = () => process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
export const isAIConfigured = () => Boolean(process.env.GROQ_API_KEY);

// Groq has no responseSchema like Gemini — we ask for JSON via response_format
// and describe the required shape inside the prompt itself.
const generateJSON = async (prompt, schemaDescription) => {
    const ai = getClient();
    try {
        const response = await ai.chat.completions.create({
            model: MODEL(),
            messages: [
                {
                    role: "system",
                    content: `You must respond with valid JSON only, matching this shape:\n${schemaDescription}`,
                },
                { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
            temperature: 0.6,
        });
        return JSON.parse(response.choices[0].message.content);
    } catch (err) {
        console.error("Groq Json Error:", err?.message || err);
        throw new ApiError(502, "AI Request Failed. Please try again in a moment.");
    }
};

const generateText = async (prompt, temperature = 0.7) => {
    const ai = getClient();
    try {
        const response = await ai.chat.completions.create({
            model: MODEL(),
            messages: [{ role: "user", content: prompt }],
            temperature,
        });

        return response.choices[0].message.content.trim();
    } catch (err) {
        console.error("Groq text error", err?.message || err);
        throw new ApiError(502, "AI request failed. Please try again in a moment.");
    }
};

export const generateLeadSummary = async (lead) => {
    const prompt = `You are an expert B2B sales analyst for a CRM called Atlass CRM.
Analyse the following sales lead and produce a concise assessment.

Lead details:
- Name: ${lead.name || "N/A"}
- Company: ${lead.company || "N/A"}
- Email: ${lead.email || "N/A"}
- Current pipeline stage: ${lead.status || "New"}
- Potential deal value: $${lead.value || 0}
- Source: ${lead.source || "Unknown"}
- Notes: ${lead.notes || "None"}

Return JSON Only.`;

    const schemaDescription = `{
  "summary": string (2-3 sentence executive summary of the lead),
  "riskScore": integer (0 = safe, 100 = high risk),
  "suggestedPriority": "Low" | "Medium" | "High",
  "nextBestAction": string (one concrete recommended next step)
}`;

    return generateJSON(prompt, schemaDescription);
};

export const generateEmail = async ({ lead, purpose, tone, sender }) => {
    const prompt = `You are a senior sales rep writing on behalf of ${
        sender?.name || "our team"
    }${sender?.company ? ` at ${sender.company}` : ""}.

Write a professional sales email.
Purpose: ${purpose || "follow-up"}
Desired tone: ${tone || "friendly and professional"}

Recipient (lead) details:
- Name: ${lead?.name || "there"}
- Company: ${lead?.company || "N/A"}
- Pipeline stage: ${lead?.status || "New"}
- Context / notes: ${lead?.notes || "None"}

Return JSON only with a compelling subject line and a complete email body.
Use line breaks (\\n) in the body. Keep it under 180 words. Sign off as ${
        sender?.name || "the Atlass CRM team"
    }.`;

    const schemaDescription = `{
  "subject": string,
  "body": string
}`;

    return generateJSON(prompt, schemaDescription);
};

export const generateSalesInsights = async (pipelineStats) => {
    const prompt = `You are a revenue-operations advisor. Given this snapshot of a sales pipeline, identify what is working, what is at risk, and concrete actions to improve conversion.

Pipeline snapshot (JSON):
${JSON.stringify(pipelineStats, null, 2)}

Return JSON only.`;

    const schemaDescription = `{
  "headline": string (one-sentence summary of pipeline health),
  "insights": string[] (3-5 specific, data-driven observations),
  "recommendations": string[] (3-5 prioritized, actionable recommendations),
  "healthScore": integer (0-100)
}`;

    return generateJSON(prompt, schemaDescription);
};

export { generateText };