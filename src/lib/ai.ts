import OpenAI from "openai";
import { getSystemPrompt } from "@/lib/system-prompt";

const FALLBACK_MESSAGE = "Sorry, I couldn't generate a response.";

function getOpenAI() {
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "Nashik Real Estate WhatsApp Bot",
    },
  });
}

function sanitizeHistory(
  messages: { role: "user" | "assistant"; content: string }[]
) {
  return messages.filter((m) => {
    const text = m.content?.trim();
    if (!text) return false;
    if (m.role === "assistant" && text === FALLBACK_MESSAGE) return false;
    return true;
  });
}

async function callModel(
  messages: { role: "user" | "assistant"; content: string }[]
) {
  const model = process.env.AI_MODEL || "google/gemini-2.0-flash-001";
  const completion = await getOpenAI().chat.completions.create({
    model,
    messages: [{ role: "system", content: getSystemPrompt() }, ...messages],
    max_tokens: 500,
  });
  return {
    model,
    content: completion.choices[0]?.message?.content?.trim() || "",
    choice: completion.choices[0],
  };
}

export async function getAIResponse(
  messages: { role: "user" | "assistant"; content: string }[]
) {
  const history = sanitizeHistory(messages);

  let result = await callModel(history);
  if (!result.content && history.length > 1) {
    const lastUser = [...history].reverse().find((m) => m.role === "user");
    if (lastUser) {
      result = await callModel([lastUser]);
    }
  }

  if (!result.content) {
    console.error("AI empty response:", {
      model: result.model,
      finishReason: result.choice?.finish_reason,
      historyLength: history.length,
    });
  }

  return result.content || FALLBACK_MESSAGE;
}
