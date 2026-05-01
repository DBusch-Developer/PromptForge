import type { Template } from "@/types";

export const TEMPLATES: Template[] = [

  // ── ANATOMY ────────────────────────────────────────────────────────────
  {
    id: "t01",
    cat: "anatomy",
    title: "Full anatomy master template",
    desc: "The complete 8-block skeleton for any prompt. Include only the blocks your task requires — not every prompt needs all eight.",
    code: `ROLE: You are [expert role] with [specific expertise].

CONTEXT: [Relevant background. Who is the audience?
What constraints exist? What has already been done?]

TASK: [One clear, specific ask using an action verb.]

STEPS:
1. [First action]
2. [Second action]
3. [Third action — reference prior step if needed]

IF/ELSE: If [condition], then [approach A].
         Otherwise, [approach B].

EXAMPLES:
  Input:  [example input]
  Output: [example output]

ITERATE: After drafting, review your output and fix any
         [specific quality criteria]. Output improved version only.

FORMAT: [Length. Structure. Tone. What to exclude.]`,
    tip: "<strong>Pro tip:</strong> Always include at minimum TASK + FORMAT. Every other block is optional — add them only when complexity demands it.",
  },

  // ── SEQUENCE ───────────────────────────────────────────────────────────
  {
    id: "t02",
    cat: "sequence",
    title: "Numbered step sequence",
    desc: "Explicit ordering prevents the model from collapsing steps or reordering logic. Best for multi-stage analysis or transformations.",
    code: `Complete the following steps in exact order.
Do not skip or reorder any step.

Step 1 — [Action verb]:
  [What to do and why it comes first]

Step 2 — [Action verb]:
  [What to do, using output from Step 1]

Step 3 — [Action verb]:
  [Transform or synthesize Step 2's output]

Step 4 — Output:
  Return only the result of Step 3.
  Format it as [format spec].`,
    tip: "<strong>Use when:</strong> multi-stage analysis, research → outline → draft pipelines, or any task where order changes the result.",
  },
  {
    id: "t03",
    cat: "sequence",
    title: "Extract → filter → transform pipeline",
    desc: "Each step feeds explicitly into the next. Great for data transformation, content processing, or multi-layer reasoning.",
    code: `--- INPUT ---
[Your raw input here]

--- PIPELINE ---
Step 1 → Extract:   Identify all [X] from the input.
Step 2 → Filter:    Remove any [X] that [fail condition].
Step 3 → Transform: Convert remaining [X] into [target format].
Step 4 → Rank:      Order by [criteria], highest first.
Step 5 → Output:    Return the top [N] results as [structure].

Show only the Step 5 output.`,
    tip: "<strong>Use when:</strong> processing raw data, competitive analysis, summarization pipelines, code refactoring workflows.",
  },
  {
    id: "t04",
    cat: "sequence",
    title: "Gated progression with quality checks",
    desc: "Each stage must be completed before the next begins. Forces depth and prevents surface-level first-draft answers.",
    code: `Work through this in gated stages.
Do not advance until the current stage is complete.

Stage 1 — Understand:
  Restate the problem in your own words.
  Identify any ambiguities before moving on.

Stage 2 — Explore:
  List at least [N] possible approaches.
  Do not evaluate yet. Just enumerate.

Stage 3 — Evaluate:
  Score each approach on:
    · [Criterion 1]  · [Criterion 2]  · [Criterion 3]
  Eliminate any that fail [minimum threshold].

Stage 4 — Execute:
  Implement the highest-scored approach in full.

Stage 5 — Verify:
  Test your output against the original problem.
  Flag any gaps or edge cases not covered.`,
    tip: "<strong>Use when:</strong> architecture decisions, strategy work, or any problem where rushing to an answer is costly.",
  },

  // ── SELECTION ──────────────────────────────────────────────────────────
  {
    id: "t05",
    cat: "selection",
    title: "If / else conditional branch",
    desc: "Prevents the model from defaulting to a middle-ground answer that satisfies neither case. Explicit forks for explicit conditions.",
    code: `Analyze [input / situation].

If [Condition A is true]:
  → [Specific action or output for Case A]
  → [Additional instruction specific to Case A]

Else if [Condition B is true]:
  → [Specific action or output for Case B]

Else (neither condition applies):
  → [Default fallback action]
  → Ask me: "[the clarifying question you need]"`,
    tip: "<strong>Use when:</strong> triage prompts, classifiers, audience-adaptive writing, routing logic between two distinct approaches.",
  },
  {
    id: "t06",
    cat: "selection",
    title: "Multi-case switch statement",
    desc: "Handles more than two cases cleanly. One case per branch, no fallthrough. Works exactly like a switch() in code.",
    code: `Read the [input] and detect which case applies.
Apply ONLY the matching case. Do not blend cases.

Case 1 — [Label]:
  Trigger: [What identifies this case in the input]
  Action:  [Exactly what to do and what to output]

Case 2 — [Label]:
  Trigger: [What identifies this case]
  Action:  [Exactly what to do]

Case 3 — [Label]:
  Trigger: [What identifies this case]
  Action:  [Exactly what to do]

Default — No match found:
  Action:  [Fallback behavior — ask, or apply safest default]`,
    tip: "<strong>Use when:</strong> intent detection, error type handling, tone selection, generating different outputs based on input classification.",
  },
  {
    id: "t07",
    cat: "selection",
    title: "Confidence-gated decision tree",
    desc: "Forces the model to assess certainty before acting. The most powerful single pattern for preventing confident hallucination.",
    code: `Before answering, internally rate your confidence (0–100%).

If confidence ≥ 90%:
  → Provide a direct, complete answer. No hedging.

If confidence is 60–89%:
  → Provide your best answer AND clearly flag the
    specific parts you are uncertain about.
  → Explain WHY you are uncertain (missing data,
    conflicting sources, edge cases, etc.)

If confidence < 60%:
  → Do NOT guess or fabricate.
  → State exactly what you do know for certain.
  → List the specific information you would need
    to give a reliable answer.
  → Suggest how I could obtain that information.

Now answer: [your question]`,
    tip: "<strong>Use when:</strong> factual research, technical debugging, legal/medical questions — any domain where wrong = costly.",
  },

  // ── ITERATION ──────────────────────────────────────────────────────────
  {
    id: "t08",
    cat: "iteration",
    title: "Draft → critique → revise cycle",
    desc: "Forces a built-in revision cycle. The model critiques its own output before you ever see it. Only the final pass is shown.",
    code: `Complete this task in three passes.

--- PASS 1 — Draft ---
Write an initial version of: [task description]

--- PASS 2 — Critique ---
Review your Pass 1 draft. Score it 1–10 on:
  · [Quality criterion 1, e.g. clarity]
  · [Quality criterion 2, e.g. accuracy]
  · [Quality criterion 3, e.g. concision]
List every weakness you find. Be ruthless.

--- PASS 3 — Revise ---
Rewrite the draft, fixing every weakness from Pass 2.
Do not leave known problems unfixed.

Output ONLY Pass 3. Do not show Pass 1 or Pass 2.`,
    tip: "<strong>Use when:</strong> writing, code generation, argument construction — any creative or analytical task where first drafts are never good enough.",
  },
  {
    id: "t09",
    cat: "iteration",
    title: "Focused N-round refinement loop",
    desc: "Each pass has exactly one job. Separating the concerns prevents 'make it better' from meaning nothing.",
    code: `Generate [output type], then refine through 3 focused rounds.

Round 0 — Generate:
  Produce the initial [output]. No constraints yet.

Round 1 — Clarity pass:
  Rewrite for maximum clarity.
  Remove jargon. Fix every ambiguous phrase.

Round 2 — Concision pass:
  Cut everything that does not add meaning.
  Target [X]% fewer words without losing substance.

Round 3 — Impact pass:
  Strengthen the weakest section.
  Make the opening sentence impossible to ignore.

Output ONLY Round 3.
Include a 1-line note on the biggest change in each round.`,
    tip: "<strong>Use when:</strong> content creation, documentation, pitch writing. Separating passes makes each one intentional.",
  },
  {
    id: "t10",
    cat: "iteration",
    title: "Red team loop — argue against yourself",
    desc: "The model attacks its own answer, then defends or improves it. Finds holes before they find you.",
    code: `Task: [Your task here]

Step 1 — Produce:
  Generate your best complete answer.

Step 2 — Red Team:
  Switch roles. You are now a skeptical senior expert
  who disagrees. Attack your Step 1 output on:
    · What assumptions are incorrect or unverified?
    · What critical edge cases are missing?
    · What would cause this to fail in a real scenario?
    · What has been oversimplified or glossed over?
  List at least [N] critiques. Be adversarial.

Step 3 — Defend + Improve:
  For each critique, either:
    (a) Fix the output to address the concern, OR
    (b) Explain clearly why it is not a real concern.

Step 4 — Final Output:
  Present the improved answer.
  Note which critiques materially changed the answer.`,
    tip: "<strong>Use when:</strong> architecture decisions, business plans, security review — any answer that will face a skeptical audience.",
  },

  // ── ROLE + CONTEXT ─────────────────────────────────────────────────────
  {
    id: "t11",
    cat: "role",
    title: "Expert persona with communication style",
    desc: "Specificity beats generic. Defining the sub-domain, experience type, and communication style unlocks calibrated depth.",
    code: `You are a [senior / lead / principal] [job title]
with [N]+ years specializing in [specific sub-domain].

Your background includes:
  · Deep expertise in [technology / methodology A]
  · Direct experience with [real-world scenario or system]
  · Strong opinions formed by [type of past experience]

Your communication style:
  · [Concise / Direct / Socratic / Detail-oriented]
  · You explain complex things without over-simplifying
  · You do not [hedge excessively / re-explain basics /
    add unsolicited caveats]

Given this background: [your actual task]`,
    tip: '<strong>Tip:</strong> "Senior backend engineer who has debugged distributed systems at scale" unlocks far more than "software engineer."',
  },
  {
    id: "t12",
    cat: "role",
    title: "Audience + stakes context frame",
    desc: "Telling the model who reads this and what is at risk calibrates depth, tone, and how conservative the advice will be.",
    code: `Context for this task:

AUDIENCE:    [Who will read or use this output?
              What is their technical expertise level?
              What do they already know / not know?]

STAKES:      [What happens if this is wrong or unclear?
              What is the cost of a mistake here?]

SITUATION:   [What triggered this need?
              What decisions depend on this output?]

PRIOR STATE: [What has already been tried or decided?
              What approaches were ruled out, and why?]

CONSTRAINTS: [Word count / tools / budget / legal limits /
              technical stack / timeline / tone rules]

Given all of the above: [your task]`,
    tip: "<strong>Use when:</strong> writing for executives, customer-facing docs, code going to production. Higher stakes = more context needed.",
  },

  // ── OUTPUT FORMAT ──────────────────────────────────────────────────────
  {
    id: "t13",
    cat: "format",
    title: "Explicit output specification",
    desc: "The single fastest quality improvement for most prompts. Define structure, length, tone, and what to omit before the AI starts.",
    code: `[Your task here]

--- OUTPUT FORMAT ---
Structure:  [Markdown / plain text / JSON / bullets / table]
Length:     [Under N words / exactly N bullets / 1 paragraph]
Sections:   [List required sections and their order]
Tone:       [Formal / conversational / technical / blunt]
Language:   [Avoid jargon / define all acronyms / active voice]

--- DO NOT INCLUDE ---
  · Preamble ("Great question!", restating the prompt)
  · Unsolicited caveats or disclaimers
  · Transitional summaries ("In conclusion", "To summarize")
  · Padding to appear more thorough
  · Closing pleasantries ("I hope this helps!")

START your response with: [exact first line or heading]`,
    tip: "<strong>Note:</strong> The DO NOT INCLUDE section is often more valuable than the format spec itself. AI tics are predictable — blocking them works.",
  },
  {
    id: "t14",
    cat: "format",
    title: "Strict JSON schema output",
    desc: "Forces machine-readable output with an explicit schema. No prose, no fences. Every key present, null if unknown.",
    code: `[Your task here]

Return ONLY valid JSON matching this exact schema.
No prose before or after.
No markdown code fences or backticks.
If you cannot determine a value, use null.
Never omit a key.

{
  "primary_output": "string — [what goes here]",
  "items": [
    {
      "name":     "string",
      "value":    "string or number",
      "category": "string"
    }
  ],
  "metadata": {
    "confidence":  "high | medium | low",
    "assumptions": ["array of strings"],
    "flags":       ["array of warnings or caveats"]
  }
}`,
    tip: "<strong>Use when:</strong> feeding output into another system, building datasets, automations. Describe each field so the model understands intent.",
  },

  // ── FEW-SHOT ───────────────────────────────────────────────────────────
  {
    id: "t15",
    cat: "fewshot",
    title: "Input → output example pairs",
    desc: "2–5 concrete examples beat any amount of abstract description. The fastest way to specify tone, format, and scope simultaneously.",
    code: `Transform each input using the pattern shown below.
Study all examples before producing your output.

--- EXAMPLES ---

Input:  [example input 1]
Output: [expected output 1]

Input:  [example input 2]
Output: [expected output 2]

Input:  [example input 3]
Output: [expected output 3]

--- NOW APPLY ---

Input:  [your actual input]
Output:`,
    tip: "<strong>Tip:</strong> Choose examples that cover the range of your inputs — easy, medium, and an edge case. The model generalizes from the pattern.",
  },
  {
    id: "t16",
    cat: "fewshot",
    title: "Positive + negative example contrast",
    desc: "Showing what NOT to do is often more instructive than showing what to do. Forces the model to understand the quality boundary.",
    code: `Write [output type] following these quality standards.

--- GOOD EXAMPLE (do this) ---
"[Example of the quality, tone, and structure you want]"
Why it works: [1 sentence — the specific quality it shows]

--- BAD EXAMPLE (never do this) ---
"[Example of what you do not want — common AI failure mode]"
Why it fails: [1 sentence — the specific flaw it shows]

--- ANOTHER BAD EXAMPLE (avoid this too) ---
"[Second failure mode, if relevant]"
Why it fails: [1 sentence]

Now write: [your actual task]
Match the good example. Avoid every flaw shown above.`,
    tip: "<strong>Best for:</strong> eliminating hollow AI openers, removing hedging language, enforcing a specific tone or voice style.",
  },

  // ── CHAIN OF THOUGHT ───────────────────────────────────────────────────
  {
    id: "t17",
    cat: "cot",
    title: "Think-then-answer with visible reasoning",
    desc: "Separates reasoning from the final answer. Dramatically reduces errors on logic, math, and multi-step problems.",
    code: `[Your question or problem here]

Before finalizing your answer:
  1. Break this problem into its sub-problems.
  2. Reason through each sub-problem step by step.
  3. Check your logic — identify any weak assumptions.
  4. Only then produce your final answer.

Format your response exactly as:

<thinking>
[Full reasoning — show every step, visible to me]
</thinking>

<answer>
[Clean final answer only — no reasoning, no hedging]
</answer>`,
    tip: "<strong>Use when:</strong> math, logic, debugging, multi-step analysis. Visible reasoning lets you spot exactly where the model goes wrong.",
  },
  {
    id: "t18",
    cat: "cot",
    title: "Socratic decomposition — answer sub-questions first",
    desc: "Forces the model to resolve upstream uncertainties before tackling the main question. Builds answers from first principles.",
    code: `Main question: [Your primary question here]

To answer this well, you must first answer:

Sub-question 1: [Foundational — must know this first]
Sub-question 2: [Builds on answer to #1]
Sub-question 3: [Narrows toward the main answer]
Sub-question 4: [Addresses the most common wrong assumption]

Work through each sub-question explicitly.
Show your answer to each before moving to the next.

Then use those four answers to derive your final,
well-grounded response to the main question.`,
    tip: "<strong>Use when:</strong> strategic questions, root cause analysis, 'why' questions, or problems where upstream assumptions matter.",
  },

  // ── NEGATIVE PROMPTING ─────────────────────────────────────────────────
  {
    id: "t19",
    cat: "negative",
    title: "AI-tic elimination block",
    desc: "Kills the filler patterns that inflate AI responses. Paste into any high-quality prompt. Works best paired with a FORMAT spec.",
    code: `STRICT OUTPUT RULES — violating any rule invalidates
your response. No exceptions.

DO NOT:
  · Open with "Great question!", "Certainly!", "Of course!",
    "Absolutely!", "I'd be happy to", or any variation
  · Restate or paraphrase the question before answering
  · Use anywhere: "It is important to note", "As an AI",
    "I should mention that", "It's worth noting"
  · Add disclaimers or caveats unless they are critical
    and directly affect how the answer should be used
  · Use hollow transitions: "In conclusion", "To summarize",
    "As we can see", "Moving on to", "In summary"
  · Pad the response to appear more thorough
  · End with "I hope this helps!", "Let me know if you
    have questions", or any closing pleasantry

DO:
  · Start your response with the first word of the answer
  · Be direct — short and correct beats long and vague
  · If uncertain, state it once, briefly, then answer anyway`,
    tip: "<strong>Note:</strong> This block + an explicit FORMAT spec accounts for ~80% of quality improvements in most prompts.",
  },
  {
    id: "t20",
    cat: "negative",
    title: "Scope boundary constraint",
    desc: "Prevents scope creep — the model adding tangential content, unsolicited next steps, or alternatives you did not ask for.",
    code: `[Your task here]

SCOPE — INCLUDE ONLY:
  · [Specific topic 1]
  · [Specific topic 2]
  · [Specific topic 3]

SCOPE — DO NOT INCLUDE:
  · [Excluded topic A — even if relevant to the main topic]
  · [Excluded topic B — e.g. historical background]
  · [Excluded topic C — e.g. alternative approaches]
  · Unsolicited recommendations or next steps
  · Related topics I did not ask about

If the answer requires going out of scope, say:
  "This requires [X] — do you want me to cover it?"
Then stop. Do not proceed until confirmed.`,
    tip: "<strong>Use when:</strong> targeted code reviews, focused research, or any prompt where the model habitually over-delivers noise.",
  },

  // ── META-PROMPTING ─────────────────────────────────────────────────────
  {
    id: "t21",
    cat: "meta",
    title: "Prompt improver — diagnose and rewrite",
    desc: "Give a rough prompt, get a production-quality version back. Use when you know what you want but not how to say it.",
    code: `You are a prompt engineering expert.
Improve the prompt I give you below.

MY ROUGH PROMPT:
"""
[Paste your rough prompt here]
"""

Analyze it for these failure modes:
  1. Ambiguity       — what could be misinterpreted?
  2. Missing context — what does the model need to know?
  3. Missing format  — how should the output look?
  4. Missing limits  — what should be explicitly excluded?
  5. Missing role    — would a persona improve results?
  6. Missing review  — should it self-critique before output?

Output exactly this structure — nothing else:

<diagnosis>
Top 3 weaknesses of my prompt, ranked by impact
</diagnosis>

<improved_prompt>
Full rewritten prompt, complete and ready to use
</improved_prompt>`,
    tip: "<strong>Tip:</strong> Run this on any prompt you have iterated on more than twice. The diagnosis alone is usually worth it.",
  },
  {
    id: "t22",
    cat: "meta",
    title: "Prompt generator — plain language to production",
    desc: "Describe your goal in plain language and get a fully engineered prompt back. Fastest path from idea to ready-to-use template.",
    code: `I need an AI prompt that accomplishes this goal:
[Describe your goal in plain language — be specific]

About my use case:
  I am:               [your role]
  Output will be for: [end use / where it goes]
  Audience:           [who reads or uses the output]
  Biggest risk:       [what could go wrong / what to avoid]
  Constraints:        [format, length, stack, tone, etc.]

Generate a complete, production-ready prompt that:
  1. Assigns the right expert role and persona
  2. Includes necessary context and background framing
  3. Sequences the task into clear, ordered steps
  4. Handles edge cases with if/else branching logic
  5. Includes an iteration or self-review pass
  6. Specifies the output format precisely
  7. Prohibits the most common AI failure modes

Output ONLY the finished prompt. No explanation.`,
    tip: "<strong>Best for:</strong> starting new workflows, building prompt libraries for a project, or when you need a high-quality prompt fast.",
  },
  {
    id: "t23",
    cat: "meta",
    title: "Clarification-first — surface assumptions before starting",
    desc: "Forces the model to name hidden assumptions and ask one key question before executing. Eliminates wasted effort on wrong interpretations.",
    code: `I am about to ask you to: [brief task description]

Before you begin — do these three things:

1. List the top 3 assumptions you are making about
   what I want and what a good response looks like.

2. List any information gaps that, if filled, would
   significantly change your approach or your output.

3. Ask me the single most important clarifying question.
   The one question that, if answered, most improves
   your output.

Wait for my response. Do not start the task yet.
Ask only one question.`,
    tip: "<strong>Use when:</strong> complex, high-stakes, or ambiguous tasks. A 30-second clarification round eliminates far more waste than any revision cycle.",
  },

  // ── DEV WORKFLOW ───────────────────────────────────────────────────────
  {
    id: "t24",
    cat: "devflow",
    title: "Feature spec → implementation prompt",
    desc: "Converts a plain-English feature request into a precise implementation prompt. Covers stack, constraints, edge cases, and acceptance criteria so the AI builds exactly what you need.",
    code: `You are a senior [React / Next.js / Node / full-stack] developer.
Implement the following feature exactly as specified.

FEATURE: [Feature name]
DESCRIPTION: [What it does and why it exists]

STACK CONTEXT:
  Framework:  [Next.js 14 / React 18 / etc.]
  Language:   TypeScript (strict mode)
  Styling:    [Tailwind / CSS Modules / styled-components]
  State:      [useState / Zustand / Redux]
  Data:       [Supabase / Prisma / REST API / localStorage]

REQUIREMENTS:
  1. [Specific requirement — be concrete]
  2. [Specific requirement]
  3. [Specific requirement]

EDGE CASES TO HANDLE:
  · [e.g. empty state, loading state, error state]
  · [e.g. mobile layout, keyboard accessibility]
  · [e.g. what happens if the API call fails]

ACCEPTANCE CRITERIA:
  ✓ [What "done" looks like — observable, testable]
  ✓ [Second criterion]
  ✓ [Third criterion]

DO NOT:
  · Add features not listed above
  · Change files outside the scope of this feature
  · Use libraries not already in package.json

Output all files that need to be created or modified.
For each file: show the full path and full file contents.`,
    tip: "<strong>Pro tip:</strong> The more specific your stack context and acceptance criteria, the less back-and-forth you need. This template front-loads everything the AI needs to get it right on the first pass.",
  },
  {
    id: "t25",
    cat: "devflow",
    title: "Systematic debugging prompt",
    desc: "Structured debugging approach that forces hypothesis-driven investigation instead of random guessing. Works for any error type.",
    code: `You are an expert debugger. Help me find and fix this bug.

THE BUG:
  What I expected: [expected behavior]
  What actually happens: [actual behavior]
  When it happens: [always / on specific input / intermittently]

ERROR OUTPUT (if any):
\`\`\`
[Paste the full error message and stack trace here]
\`\`\`

RELEVANT CODE:
\`\`\`[language]
[Paste the code where the bug occurs]
\`\`\`

CONTEXT:
  · Stack: [framework, runtime, key dependencies + versions]
  · Environment: [dev / staging / prod — does it differ?]
  · Recent changes: [what changed before this bug appeared?]
  · Already tried: [what debugging steps have you taken?]

APPROACH:
  Step 1 — Diagnose: Identify the most likely root cause.
            Explain your reasoning.
  Step 2 — Hypotheses: List 2–3 alternative causes, ranked
            by likelihood.
  Step 3 — Fix: Provide the exact code change that fixes it.
  Step 4 — Verify: Tell me how to confirm the fix worked.
  Step 5 — Prevention: What change would prevent this class
            of bug in the future?`,
    tip: "<strong>Key insight:</strong> Always include 'what I already tried' — it prevents the AI from suggesting the same dead ends and forces it deeper.",
  },
  {
    id: "t26",
    cat: "devflow",
    title: "Code review request",
    desc: "Get a thorough, structured code review covering correctness, performance, security, readability, and edge cases — not just style nits.",
    code: `Review the following code as a senior [language/framework] engineer.
Be direct. Prioritize issues by severity.

CODE TO REVIEW:
\`\`\`[language]
[Paste your code here]
\`\`\`

CONTEXT:
  Purpose: [What this code does]
  Used by: [Who/what calls this code]
  Scale:   [Expected load, data size, concurrency]

REVIEW CRITERIA — check all of these:
  🔴 CRITICAL   — Bugs, security holes, data loss risks
  🟠 IMPORTANT  — Performance problems, bad error handling,
                  memory leaks, race conditions
  🟡 SUGGESTED  — Readability, naming, code duplication,
                  missing edge cases
  🔵 MINOR      — Style, minor naming improvements

FORMAT:
  For each issue:
    Severity: [🔴/🟠/🟡/🔵]
    Location: [line number or function name]
    Problem:  [What is wrong and why it matters]
    Fix:      [Exact corrected code]

After all issues: give a 2-sentence overall assessment.
Score the code 1–10 for production-readiness.`,
    tip: "<strong>Use when:</strong> before merging a PR, submitting to a client, or any time you want a second set of eyes without waiting for a team member.",
  },
  {
    id: "t27",
    cat: "devflow",
    title: "Refactor for readability and performance",
    desc: "Produces a clean refactored version with a clear explanation of every change made and why. No silent rewrites.",
    code: `Refactor the following code. Prioritize in this order:
  1. Correctness — do not change behavior
  2. Readability — future-you should understand this instantly
  3. Performance — only optimize what is measurably slow

ORIGINAL CODE:
\`\`\`[language]
[Paste your code here]
\`\`\`

REFACTOR GOALS (mark which apply):
  [ ] Extract repeated logic into reusable functions
  [ ] Improve variable / function naming
  [ ] Reduce nesting and complexity
  [ ] Replace imperative loops with declarative methods
  [ ] Add TypeScript types where missing
  [ ] Improve error handling
  [ ] Reduce bundle size / remove unused imports
  [ ] Performance: [specific bottleneck if known]

OUTPUT FORMAT:
  1. Refactored code — complete, ready to drop in
  2. Change log — bullet list of every change made + why
  3. Behavior check — confirm all original behavior is preserved
  4. Any trade-offs I should be aware of`,
    tip: "<strong>Important:</strong> Always mark the specific goals. 'Make it better' produces unfocused rewrites. Specific goals produce surgical improvements.",
  },
  {
    id: "t28",
    cat: "devflow",
    title: "React / UI component generation",
    desc: "Generates a production-ready, typed, accessible React component from a description. Mobile-first, Tailwind-compatible.",
    code: `Build a production-ready React component with TypeScript.

COMPONENT: [Component name]
PURPOSE:   [What it does — 1 sentence]

PROPS INTERFACE:
  [propName]:  [type] — [what it controls]
  [propName]:  [type] — [what it controls]
  [propName]?: [type] — [optional prop, default: value]

BEHAVIOR:
  · [Interactive behavior — hover, click, keyboard, etc.]
  · [State it manages internally, if any]
  · [API calls or data fetching, if any]

DESIGN:
  Styling:     [Tailwind CSS / CSS Modules / inline]
  Responsive:  Mobile-first. Breakpoints: [sm / md / lg]
  Theme:       [dark / light / system]
  Animate:     [Yes — describe / No]

REQUIREMENTS:
  · Fully typed props with JSDoc comments
  · Accessible — ARIA labels, keyboard navigation, focus rings
  · Handle loading, error, and empty states
  · No hardcoded strings — accept via props
  · Export as default AND named export

STACK: React 18, TypeScript strict, [Next.js / Vite], Tailwind

Output: complete component file, ready to import.`,
    tip: "<strong>Tip:</strong> Define your props interface explicitly — it's the clearest specification you can give an AI for UI work. Every prop defined = one less assumption made.",
  },
  {
    id: "t29",
    cat: "devflow",
    title: "API endpoint design prompt",
    desc: "Design a REST or tRPC endpoint with route, method, request/response shapes, auth, validation, and error handling fully specified.",
    code: `Design and implement an API endpoint for the following:

ENDPOINT PURPOSE: [What this endpoint does]

ROUTE DESIGN:
  Method:   [GET / POST / PUT / PATCH / DELETE]
  Path:     [e.g. /api/v1/users/:id/posts]
  Auth:     [Public / JWT required / API key / Session]

REQUEST:
  Params:   [URL params and their types]
  Query:    [Query string params and their types]
  Body:     [Request body shape — JSON schema or TypeScript type]

RESPONSE:
  Success (2xx):
    [Response body shape]
  Error cases:
    400 — [when and what to return]
    401 — [when and what to return]
    404 — [when and what to return]
    500 — [when and what to return]

BUSINESS LOGIC:
  1. [Step 1 of what the endpoint does]
  2. [Step 2]
  3. [Step 3]

VALIDATION:
  · [Field X must be...]
  · [Field Y cannot exceed...]

STACK: [Next.js API routes / Express / tRPC / Hono / Fastify]
DB:    [Supabase / Prisma + PostgreSQL / MongoDB]

Output:
  1. Full endpoint implementation
  2. TypeScript request/response types
  3. Example curl command to test it`,
    tip: "<strong>Use when:</strong> starting a new endpoint from scratch. Defining the contract before implementation catches design mistakes before they're baked in.",
  },
  {
    id: "t30",
    cat: "devflow",
    title: "Write tests for existing code",
    desc: "Generates a full test suite for your existing code — unit tests, edge cases, and mocks — without you having to write them from scratch.",
    code: `Write a comprehensive test suite for the following code.

CODE UNDER TEST:
\`\`\`[language]
[Paste your function, component, or module here]
\`\`\`

TESTING CONTEXT:
  Framework:  [Jest / Vitest / Playwright / React Testing Library]
  Style:      [Unit / Integration / E2E]
  Coverage:   Aim for all branches — happy path AND edge cases

TEST CASES TO COVER:
  Happy path:
    · [Normal input → expected output]
    · [Another valid scenario]
  Edge cases:
    · [Empty input / null / undefined]
    · [Boundary values — min, max, zero]
    · [Invalid types or formats]
  Error handling:
    · [What happens when [dependency] throws]
    · [Network failure / timeout scenario]

MOCKING:
  Mock these dependencies:
    · [Module or function to mock] → [mock behavior]
    · [External API] → [mock response]

OUTPUT:
  1. Full test file, ready to run
  2. Any setup/teardown needed
  3. Comment on any behavior that was ambiguous
     from the code alone`,
    tip: "<strong>Productivity unlock:</strong> Paste your function, run this prompt, drop in the test file. In most cases you get 80%+ coverage immediately. Tweak the remaining edge cases manually.",
  },
  {
    id: "t31",
    cat: "devflow",
    title: "Generate documentation for a module",
    desc: "Produces JSDoc, README sections, or API reference documentation from your existing code. Saves hours on docs you keep putting off.",
    code: `Generate documentation for the following code.

CODE:
\`\`\`[language]
[Paste your function, module, class, or component here]
\`\`\`

DOCUMENTATION TYPE (choose one or more):
  [ ] JSDoc / TSDoc comments — inline, above each function
  [ ] README section — markdown, for the project repo
  [ ] API reference — parameters, return types, examples
  [ ] Usage guide — how to use this, with code examples

AUDIENCE:
  [Other developers on my team / open source users /
   junior devs who are new to this codebase]

INCLUDE:
  · Purpose — what this does and why it exists
  · Parameters — name, type, description, required/optional
  · Return value — type and shape
  · Throws / errors — what can go wrong
  · Usage examples — at least 2, covering common cases
  · Edge cases or gotchas worth calling out

TONE: [Technical and precise / Friendly and approachable]

DO NOT invent behavior not present in the code.
If something is ambiguous, flag it with [UNCLEAR: ...]`,
    tip: "<strong>Tip:</strong> Run this after finishing a module, before moving on. Documenting immediately while the code is fresh produces far better docs than writing them weeks later.",
  },

  // ── CLIENT WORK ────────────────────────────────────────────────────────
  {
    id: "t32",
    cat: "client",
    title: "Extract requirements from a client conversation",
    desc: "Turns a messy client email, meeting notes, or chat transcript into a clean, structured requirements list you can actually build from.",
    code: `You are a senior developer and product analyst.
Extract structured requirements from the client input below.

CLIENT INPUT:
"""
[Paste the email, meeting notes, or chat transcript here]
"""

EXTRACT AND ORGANIZE:

1. CORE OBJECTIVE
   What is the client ultimately trying to achieve?
   (1–2 sentences, in plain terms)

2. EXPLICIT REQUIREMENTS
   Things the client directly stated they want.
   Format: [Priority: Must / Should / Nice-to-have]
     · [Requirement — specific, testable]

3. IMPLICIT REQUIREMENTS
   Things the client implied but did not explicitly say.
   (infer from context — flag each as "inferred")
     · [Implied requirement] — inferred from: "[quote]"

4. AMBIGUITIES TO RESOLVE
   Questions you must ask before starting.
   Format: each as a direct question to the client.
     · [Question]?

5. OUT OF SCOPE (suggested)
   Things that are NOT being asked for (based on the input).

6. SUCCESS CRITERIA
   How will the client know the project is done well?

Output this as a clean document I can share with the client
to confirm before development begins.`,
    tip: "<strong>Workflow:</strong> Run this prompt, then send the output to the client for sign-off. This single step prevents the most common source of scope creep.",
  },
  {
    id: "t33",
    cat: "client",
    title: "Translate technical explanation to plain English",
    desc: "Takes your technical explanation and rewrites it for a non-technical client — accurate, clear, and without condescension.",
    code: `Rewrite the following technical explanation for a non-technical
client who is smart but has no software development background.

TECHNICAL EXPLANATION:
"""
[Paste your technical explanation here]
"""

CLIENT CONTEXT:
  They understand: [basic computer use / spreadsheets / etc.]
  They do NOT know: [APIs / databases / frameworks / etc.]
  Their concern is: [cost / timeline / reliability / security]

REWRITE RULES:
  · No acronyms without explanation
  · Use analogies to familiar business concepts
  · Explain WHY it matters to them, not just WHAT it is
  · Never talk down to them — they are smart, not technical
  · Keep it under [150 / 250] words

STRUCTURE:
  1. What we are doing (1 sentence)
  2. Why it matters to you (1–2 sentences)
  3. What to expect (timeline / what you will see)
  4. What I need from you, if anything

After rewriting, flag any part where you had to simplify
something in a way that slightly loses technical accuracy.`,
    tip: "<strong>Use when:</strong> explaining architecture decisions, delays, technical debt, or any situation where 'it's complicated' isn't good enough for a client conversation.",
  },
  {
    id: "t34",
    cat: "client",
    title: "Project scope definition document",
    desc: "Generates a formal scope document from your notes — what's included, what's not, timeline, deliverables, and change request policy.",
    code: `You are a project manager and senior developer.
Create a professional project scope document from my notes.

MY NOTES:
"""
[Paste your rough project notes, client emails, or conversation
summary here — does not need to be clean]
"""

PROJECT CONTEXT:
  Client:      [Client name / type of business]
  Project:     [What we are building]
  Timeline:    [Estimated duration]
  Budget:      [Fixed price / hourly — optional to include]
  My stack:    [Technologies I will use]

SCOPE DOCUMENT SECTIONS:

1. PROJECT OVERVIEW
   Brief description of what is being built and why.

2. IN SCOPE — DELIVERABLES
   Specific, numbered list of exactly what will be delivered.
   Each item must be concrete and testable.

3. OUT OF SCOPE
   Explicit list of what is NOT included.
   (prevents scope creep arguments later)

4. TECHNICAL SPECIFICATIONS
   Stack, hosting, browser/device support, performance targets.

5. TIMELINE & MILESTONES
   Phase → Deliverable → Estimated date

6. REVISION POLICY
   How many rounds of revisions are included.
   What constitutes a change request vs. a revision.

7. CLIENT RESPONSIBILITIES
   What you need from them and by when.

Tone: professional but plain. This goes to the client.`,
    tip: "<strong>Always do this:</strong> A signed scope document is the single most important protection against unpaid work and relationship damage. Generate it, clean it up, send it before writing a line of code.",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────

export function getTemplatesByCategory(catId: string): Template[] {
  return TEMPLATES.filter((t) => t.cat === catId);
}

export function getTemplateById(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function filterTemplates(
  query: string,
  category: string,
  favoriteIds: Set<string>,
  customTemplates: Template[] = []
): Template[] {
  const all = [...TEMPLATES, ...customTemplates];
  return all.filter((t) => {
    const matchCat =
      category === "all"
        ? true
        : category === "favorites"
        ? favoriteIds.has(t.id)
        : category === "custom"
        ? customTemplates.some((c) => c.id === t.id)
        : t.cat === category;

    const q = query.toLowerCase().trim();
    const matchQuery = q
      ? [t.title, t.desc, t.code, t.cat].join(" ").toLowerCase().includes(q)
      : true;

    return matchCat && matchQuery;
  });
}
