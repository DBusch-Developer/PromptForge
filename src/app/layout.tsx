import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PromptForge — AI Prompt Template Library",
  description:
    "A curated library of 23 production-ready AI prompt templates covering sequence, selection, iteration, chain-of-thought, few-shot, and meta-prompting patterns.",
  keywords: ["prompt engineering", "AI prompts", "LLM", "ChatGPT", "Claude"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=JetBrains+Mono:wght@400;500&family=Outfit:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full bg-bg-base text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
