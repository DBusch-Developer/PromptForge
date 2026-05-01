"use client";

import { useState, useCallback } from "react";

interface CopyButtonProps {
  text: string;
}

export default function CopyButton({ text }: CopyButtonProps) {
  const [state, setState] = useState<"idle" | "copied">("idle");

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
      setTimeout(() => setState("idle"), 1800);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setState("copied");
      setTimeout(() => setState("idle"), 1800);
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      aria-label="Copy template to clipboard"
      className={`
        absolute top-2 right-2 z-10
        font-code text-[10px] tracking-wider
        px-2.5 py-1 rounded border
        transition-all duration-150
        ${
          state === "copied"
            ? "text-accent-green border-accent-green bg-bg-overlay"
            : "text-text-secondary border-border-muted bg-bg-overlay hover:text-text-primary hover:border-border-subtle"
        }
      `}
    >
      {state === "copied" ? "✓ copied" : "copy"}
    </button>
  );
}
