# PromptForge 🔥

> A mobile-first, full-stack AI prompt template library built with Next.js 14 + TypeScript + Tailwind CSS.

---

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open in browser
open http://localhost:3000
```

---

## Project Structure

```
promptforge/
├── src/
│   ├── app/
│   │   ├── layout.tsx        ← Root layout + metadata
│   │   ├── page.tsx          ← App shell + state management
│   │   └── globals.css       ← Tailwind base + CSS vars + animations
│   │
│   ├── components/
│   │   ├── Sidebar.tsx       ← Nav, search, category list + mobile drawer
│   │   ├── TopBar.tsx        ← Sticky header + mobile menu toggle
│   │   ├── TemplateCard.tsx  ← Individual template display card
│   │   ├── CategoryBadge.tsx ← Colored category label
│   │   ├── CopyButton.tsx    ← Clipboard copy with feedback state
│   │   └── EmptyState.tsx    ← Empty search/filter result state
│   │
│   ├── data/
│   │   ├── categories.ts     ← All category definitions + helpers
│   │   └── templates.ts      ← All 23 templates + filter utility
│   │
│   ├── hooks/
│   │   └── useFavorites.ts   ← localStorage favorites, SSR-safe
│   │
│   └── types/
│       └── index.ts          ← Template, Category, FilterState types
│
├── tailwind.config.ts        ← Custom design tokens (colors, fonts, animations)
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## Adding a New Template

Open `src/data/templates.ts` and push a new object to the `TEMPLATES` array:

```ts
{
  id: "t24",              // Must be unique
  cat: "sequence",        // Must match a Category.id
  title: "My new template",
  desc: "One or two sentences describing when to use this.",
  code: `Your prompt template text here.
Use [brackets] for fill-in-the-blank sections.`,
  tip: "<strong>Use when:</strong> ..."  // Optional — HTML supported
}
```

That's it. The sidebar count, search, and category filter update automatically.

---

## Adding a New Category

Open `src/data/categories.ts` and add to the `CATEGORIES` array:

```ts
{ id: "mycat", label: "My Category", color: "#ff6b6b" }
```

---

## Design Tokens

Custom colors are defined in `tailwind.config.ts` under `theme.extend.colors`.
Key tokens:

| Token | Value | Usage |
|---|---|---|
| `bg-bg-base` | `#090a0e` | Page background |
| `bg-bg-surface` | `#0f1117` | Sidebar, cards |
| `bg-bg-raised` | `#161920` | Code blocks, inputs |
| `text-text-primary` | `#dde1ec` | Headings, labels |
| `text-text-secondary` | `#7c8196` | Body text |
| `text-text-muted` | `#4a4f62` | Placeholders, hints |
| `accent-amber` | `#e5993a` | Logo accent, favorites |
| `accent-green` | `#4ecba5` | Copy success state |

---

## Planned Features (Ideas)

- [ ] Template detail page (`/template/[id]`) with full metadata
- [ ] User-created custom templates (localStorage or DB)
- [ ] Tag system (in addition to categories)
- [ ] Export favorites as a markdown file
- [ ] "Remix this template" — opens editor pre-filled
- [ ] Supabase backend for saved templates across devices
- [ ] Auth (NextAuth.js) for user accounts
- [ ] Dark/light theme toggle
- [ ] Template ratings / community voting

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Fonts | DM Serif Display · JetBrains Mono · Outfit |
| Persistence | localStorage (favorites) |
| Deployment | Vercel (zero config) |
