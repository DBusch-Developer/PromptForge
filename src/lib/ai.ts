// ─── Available Groq models ────────────────────────────────────────────────
export interface AIModel {
  id: string;
  label: string;
  desc: string;
  badge?: string;
}

export const GROQ_MODELS: AIModel[] = [
  {
    id: "llama-3.3-70b-versatile",
    label: "Llama 3.3 70B",
    desc: "Best overall · great at code and reasoning",
    badge: "Recommended",
  },
  {
    id: "deepseek-r1-distill-llama-70b",
    label: "DeepSeek R1 70B",
    desc: "Strong chain-of-thought reasoning + code",
    badge: "Best for logic",
  },
  {
    id: "mixtral-8x7b-32768",
    label: "Mixtral 8x7B",
    desc: "32k context window · great instruction following",
  },
  {
    id: "llama-3.1-8b-instant",
    label: "Llama 3.1 8B",
    desc: "Fastest response · good for quick tasks",
    badge: "Fastest",
  },
  {
    id: "gemma2-9b-it",
    label: "Gemma 2 9B",
    desc: "Efficient · solid at code generation",
  },
];

export const DEFAULT_MODEL = GROQ_MODELS[0].id;

// ─── Streaming generate (hits our Next.js API route) ─────────────────────
export interface GenerateOptions {
  prompt: string;
  model: string;
  temperature?: number;
  signal?: AbortSignal;
}

export async function* streamGenerate(
  options: GenerateOptions
): AsyncGenerator<string, void, unknown> {
  const { prompt, model, temperature = 0.7, signal } = options;

  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, model, temperature }),
    signal,
  });

  if (!res.ok) {
    // Try to parse error JSON from our API route
    try {
      const err = await res.json();
      throw new Error(err.error ?? `API error ${res.status}`);
    } catch {
      throw new Error(`API error ${res.status}`);
    }
  }

  if (!res.body) throw new Error("No response body");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === "data: [DONE]") continue;
        if (!trimmed.startsWith("data: ")) continue;

        try {
          const json = JSON.parse(trimmed.slice(6)); // strip "data: "
          const content = json.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch {
          // Skip malformed chunks
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ─── Variable extraction ──────────────────────────────────────────────────
export function extractVariables(text: string): string[] {
  const regex = /\[([^\]\n]{1,60})\]/g;
  const seen = new Set<string>();
  const results: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    const key = match[1].trim();
    if (!seen.has(key) && !/^\d+$/.test(key)) {
      seen.add(key);
      results.push(key);
    }
  }
  return results;
}

export function fillVariables(
  text: string,
  values: Record<string, string>
): string {
  return text.replace(/\[([^\]\n]{1,60})\]/g, (match, key) => {
    return values[key.trim()] || match;
  });
}

// ─── Improve-prompt meta-prompt ───────────────────────────────────────────
export function buildImprovePrompt(original: string): string {
  return `You are an expert prompt engineer. Improve the prompt below.

ORIGINAL PROMPT:
"""
${original}
"""

Produce a strictly better version by:
1. Clarifying any ambiguous instructions
2. Adding a precise output FORMAT block if missing
3. Adding a ROLE/persona if it would meaningfully help
4. Tightening step sequences — replace vague verbs with precise ones
5. Adding explicit DO NOT rules for the most common AI failure modes
6. Preserving all [placeholder] tokens exactly as written

Return ONLY the improved prompt.
No explanation, no preamble, no markdown fences.
Start immediately with the first line of the improved prompt.`;
}
