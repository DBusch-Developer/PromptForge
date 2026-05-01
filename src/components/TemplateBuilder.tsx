"use client";

import { useState, useEffect } from "react";
import type { Template } from "@/types";
import type { CustomTemplateInput } from "@/hooks/useCustomTemplates";
import { CATEGORIES } from "@/data/categories";
import { getCategoryColor } from "@/data/categories";
import CategoryBadge from "./CategoryBadge";
import CopyButton from "./CopyButton";

// ─── Anatomy hints shown in the sidebar of the builder ───────────────────
const ANATOMY_HINTS = [
  { key: "ROLE:",      hint: "Expert persona + communication style" },
  { key: "CONTEXT:",   hint: "Background, audience, constraints" },
  { key: "TASK:",      hint: "One clear ask with an action verb" },
  { key: "STEPS:",     hint: "Ordered actions 1, 2, 3..." },
  { key: "IF/ELSE:",   hint: "Conditional branches for edge cases" },
  { key: "EXAMPLES:",  hint: "Input/output pairs to show the pattern" },
  { key: "ITERATE:",   hint: "Self-review pass before final output" },
  { key: "FORMAT:",    hint: "Structure, length, tone, exclusions" },
];

// ─── Blank form state ─────────────────────────────────────────────────────
const BLANK: CustomTemplateInput = {
  title: "",
  cat: "devflow",
  desc: "",
  code: "",
  tip: "",
};

interface TemplateBuilderProps {
  editingTemplate?: Template | null;
  initialCode?: string;           // pre-fill code from tester "Save as Template"
  onSave: (input: CustomTemplateInput) => void;
  onUpdate: (id: string, input: CustomTemplateInput) => void;
  onCancel: () => void;
}

export default function TemplateBuilder({
  editingTemplate,
  initialCode,
  onSave,
  onUpdate,
  onCancel,
}: TemplateBuilderProps) {
  const isEditing = !!editingTemplate;

  const [form, setForm] = useState<CustomTemplateInput>(
    editingTemplate
      ? {
          title: editingTemplate.title,
          cat: editingTemplate.cat,
          desc: editingTemplate.desc,
          code: editingTemplate.code,
          tip: editingTemplate.tip ?? "",
        }
      : { ...BLANK, code: initialCode ?? "" }
  );

  const [errors, setErrors] = useState<Partial<Record<keyof CustomTemplateInput, string>>>({});
  const [saved, setSaved] = useState(false);

  // Reset form when editingTemplate or initialCode changes
  useEffect(() => {
    if (editingTemplate) {
      setForm({
        title: editingTemplate.title,
        cat: editingTemplate.cat,
        desc: editingTemplate.desc,
        code: editingTemplate.code,
        tip: editingTemplate.tip ?? "",
      });
    } else {
      setForm({ ...BLANK, code: initialCode ?? "" });
    }
    setErrors({});
    setSaved(false);
  }, [editingTemplate, initialCode]);

  const set = (key: keyof CustomTemplateInput, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.title.trim())   e.title = "Title is required";
    if (!form.desc.trim())    e.desc  = "Description is required";
    if (!form.code.trim())    e.code  = "Template code is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (isEditing && editingTemplate) {
      onUpdate(editingTemplate.id, form);
    } else {
      onSave(form);
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      if (!isEditing) setForm(BLANK);
    }, 1200);
  };

  // Live preview template object
  const preview: Template = {
    id: editingTemplate?.id ?? "preview",
    ...form,
    title: form.title || "Your template title",
    desc:  form.desc  || "Your template description will appear here.",
    code:  form.code  || "Your prompt template code will appear here...",
  };

  const color = getCategoryColor(form.cat);

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-9 py-6 pb-16">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-[18px] font-medium text-text-primary">
            {isEditing ? "Edit Template" : "Build a Template"}
          </h1>
          <p className="text-[12px] text-text-secondary mt-0.5">
            {isEditing
              ? "Update your custom template below."
              : "Create a reusable prompt template and save it to your library."}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-[13px] text-text-secondary hover:text-text-primary
                     border border-border-subtle hover:border-border-muted
                     px-3 py-1.5 rounded-md transition-colors font-code"
        >
          ← Back to library
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">

        {/* ── Left: Form ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Title */}
          <Field label="Template Title" error={errors.title} required>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Database schema design prompt"
              className={inputClass(!!errors.title)}
            />
          </Field>

          {/* Category + Description row */}
          <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-4">
            <Field label="Category" required>
              <select
                value={form.cat}
                onChange={(e) => set("cat", e.target.value)}
                className={inputClass(false) + " cursor-pointer"}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Description (shown on card)" error={errors.desc} required>
              <input
                type="text"
                value={form.desc}
                onChange={(e) => set("desc", e.target.value)}
                placeholder="1–2 sentences: what this template does and when to use it"
                className={inputClass(!!errors.desc)}
              />
            </Field>
          </div>

          {/* Code */}
          <Field
            label="Prompt Template"
            error={errors.code}
            required
            hint="Use [brackets] for fill-in-the-blank. Use ANATOMY BLOCKS below for structure."
          >
            <textarea
              value={form.code}
              onChange={(e) => set("code", e.target.value)}
              placeholder={`ROLE: You are a [expert role]...\n\nTASK: [What you want the AI to do]\n\nFORMAT: [How output should look]`}
              rows={16}
              className={
                inputClass(!!errors.code) +
                " font-code text-[11.5px] leading-[1.85] resize-y min-h-[220px]"
              }
            />
          </Field>

          {/* Tip */}
          <Field
            label="Usage Tip"
            hint='Optional. Shown at the bottom of the card. HTML ok: <strong>Use when:</strong> ...'
          >
            <input
              type="text"
              value={form.tip}
              onChange={(e) => set("tip", e.target.value)}
              placeholder="<strong>Use when:</strong> debugging with a known error message..."
              className={inputClass(false)}
            />
          </Field>

          {/* Anatomy reference */}
          <div className="bg-bg-surface border border-border-subtle rounded-[10px] overflow-hidden">
            <div className="px-4 py-3 border-b border-border-subtle">
              <span className="font-code text-[10px] tracking-widest uppercase text-text-muted">
                Anatomy Quick Reference
              </span>
            </div>
            <div className="divide-y divide-border-subtle">
              {ANATOMY_HINTS.map(({ key, hint }) => (
                <div key={key} className="flex items-baseline gap-3 px-4 py-2.5">
                  <span className="font-code text-[11px] text-accent-amber min-w-[80px]">{key}</span>
                  <span className="text-[12px] text-text-secondary">{hint}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Save / Cancel */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              className={`
                px-5 py-2 rounded-md text-[13px] font-medium transition-all duration-150
                ${saved
                  ? "bg-accent-green text-bg-base"
                  : "bg-accent-amber text-bg-base hover:opacity-90 active:scale-[0.98]"
                }
              `}
            >
              {saved
                ? "✓ Saved!"
                : isEditing
                ? "Update Template"
                : "Save to Library"}
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-md text-[13px] text-text-secondary
                         border border-border-subtle hover:border-border-muted
                         hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* ── Right: Live Preview ─────────────────────────────────────── */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="font-code text-[10px] tracking-widest uppercase text-text-muted mb-3">
            Live Preview
          </div>

          {/* Card preview */}
          <article className="bg-bg-surface border border-border-subtle rounded-[10px] overflow-hidden">
            <div className="h-[2px] w-full" style={{ background: color }} />

            <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-2.5">
              <div className="flex flex-col gap-2 min-w-0">
                <CategoryBadge catId={form.cat} />
                <h2 className="text-[14.5px] font-medium text-text-primary leading-snug">
                  {preview.title}
                </h2>
              </div>
              <span className="text-text-muted text-lg mt-0.5">★</span>
            </div>

            <p className="px-4 pb-3 text-[13px] text-text-secondary leading-relaxed">
              {preview.desc}
            </p>

            <div className="mx-4 mb-3 border border-border-subtle rounded-lg overflow-hidden relative">
              <pre className="code-scroll bg-bg-raised px-4 py-3 font-code text-[11.5px]
                              leading-[1.85] text-[#b8c4e0] overflow-x-auto max-h-52 overflow-y-auto
                              whitespace-pre">
                {preview.code}
              </pre>
              <CopyButton text={preview.code} />
            </div>

            {form.tip && (
              <div
                className="mx-4 mb-4 px-3 py-2 bg-bg-raised border-l-2 rounded-r-md
                           text-[12px] text-text-secondary leading-relaxed"
                style={{ borderColor: color + "66" }}
                dangerouslySetInnerHTML={{ __html: form.tip }}
              />
            )}

            {/* Custom template badge */}
            <div className="mx-4 mb-4 flex items-center gap-1.5">
              <span className="font-code text-[9px] tracking-widest uppercase
                               text-accent-amber border border-accent-amber/30
                               bg-accent-amber/10 px-2 py-0.5 rounded">
                ✦ Custom
              </span>
              <span className="text-[11px] text-text-muted">
                Your template
              </span>
            </div>
          </article>

          <p className="text-[11px] text-text-muted mt-3 leading-relaxed">
            This preview updates live as you type. Your saved templates
            appear in the main library alongside built-in ones.
          </p>
        </div>

      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────

function Field({
  label,
  children,
  error,
  hint,
  required,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-medium text-text-secondary tracking-wide">
        {label}
        {required && <span className="text-accent-amber ml-1">*</span>}
      </label>
      {children}
      {hint && !error && (
        <span className="text-[11px] text-text-muted">{hint}</span>
      )}
      {error && (
        <span className="text-[11px] text-red-400">{error}</span>
      )}
    </div>
  );
}

function inputClass(hasError: boolean): string {
  return `
    w-full bg-bg-raised border rounded-md
    px-3 py-2 text-[13px] text-text-primary
    placeholder:text-text-muted outline-none font-sans
    transition-colors
    ${hasError
      ? "border-red-500/60 focus:border-red-500"
      : "border-border-subtle focus:border-border-muted"
    }
  `;
}
