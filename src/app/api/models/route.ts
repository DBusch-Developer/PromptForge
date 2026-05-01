import { NextResponse } from "next/server";

export const runtime = "edge";

// Models to exclude — non-chat models that would 400 on /generate
const EXCLUDE_PATTERNS = [
  "whisper",
  "distil-whisper",
  "guard",
  "tool-use",
  "preview",    // remove if you want preview models
];

// Friendly labels for known models — fallback to the raw ID if unknown
const MODEL_LABELS: Record<string, { label: string; desc: string; badge?: string }> = {
  "llama-3.3-70b-versatile":          { label: "Llama 3.3 70B",       desc: "Best overall · great at code and reasoning",        badge: "Recommended" },
  "llama-3.1-70b-versatile":          { label: "Llama 3.1 70B",       desc: "Solid all-around · large context" },
  "llama-3.1-8b-instant":             { label: "Llama 3.1 8B",        desc: "Fastest response · good for quick tasks",           badge: "Fastest" },
  "llama3-70b-8192":                  { label: "Llama 3 70B",         desc: "Reliable workhorse · 8k context" },
  "llama3-8b-8192":                   { label: "Llama 3 8B",          desc: "Lightweight · fast responses" },
  "mixtral-8x7b-32768":               { label: "Mixtral 8x7B",        desc: "Long context · strong instruction following" },
  "gemma2-9b-it":                     { label: "Gemma 2 9B",          desc: "Google · efficient, solid at code" },
  "gemma-7b-it":                      { label: "Gemma 7B",            desc: "Google · lightweight" },
  "deepseek-r1-distill-llama-70b":    { label: "DeepSeek R1 70B",     desc: "Strong reasoning + code",                           badge: "Best for logic" },
  "deepseek-r1-distill-qwen-32b":     { label: "DeepSeek R1 32B",     desc: "Reasoning focused · mid-size" },
  "qwen-qwq-32b":                     { label: "Qwen QwQ 32B",        desc: "Strong at math and reasoning" },
  "llama-3.2-90b-vision-preview":     { label: "Llama 3.2 90B Vision", desc: "Multimodal · vision capable" },
  "llama-3.2-11b-vision-preview":     { label: "Llama 3.2 11B Vision", desc: "Lightweight vision model" },
};

export async function GET() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "GROQ_API_KEY not set" }, { status: 500 });
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Groq API error ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    const models = (data.data as { id: string; active?: boolean; context_window?: number }[])
      .filter((m) => {
        // Only active models
        if (m.active === false) return false;
        // Exclude non-chat models
        if (EXCLUDE_PATTERNS.some((p) => m.id.toLowerCase().includes(p))) return false;
        return true;
      })
      .map((m) => {
        const known = MODEL_LABELS[m.id];
        return {
          id: m.id,
          label:  known?.label  ?? formatRawId(m.id),
          desc:   known?.desc   ?? `Context: ${m.context_window ? (m.context_window / 1000).toFixed(0) + "k tokens" : "unknown"}`,
          badge:  known?.badge,
        };
      })
      // Sort: recommended first, then alphabetically
      .sort((a, b) => {
        if (a.badge === "Recommended") return -1;
        if (b.badge === "Recommended") return  1;
        if (a.badge === "Fastest")     return  1;
        if (b.badge === "Fastest")     return -1;
        return a.label.localeCompare(b.label);
      });

    return NextResponse.json({ models });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function formatRawId(id: string): string {
  return id
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
