"use client";

import { useState, useCallback } from "react";

type Tab = "signin" | "signup";
type AuthMode = "password" | "magic";

interface AuthModalProps {
  isOpen:      boolean;
  onClose:     () => void;
  onSignIn:    (email: string, password: string) => Promise<string | null>;
  onSignUp:    (email: string, password: string) => Promise<string | null>;
  onMagicLink: (email: string)                  => Promise<string | null>;
}

export default function AuthModal({
  isOpen,
  onClose,
  onSignIn,
  onSignUp,
  onMagicLink,
}: AuthModalProps) {
  const [tab, setTab]         = useState<Tab>("signin");
  const [mode, setMode]       = useState<AuthMode>("password");
  const [email, setEmail]     = useState("");
  const [password, setPass]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const reset = () => {
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = useCallback(async () => {
    if (!email.trim()) { setError("Email is required"); return; }
    if (mode === "password" && !password) { setError("Password is required"); return; }

    setLoading(true);
    setError(null);
    setSuccess(null);

    let err: string | null = null;

    if (mode === "magic") {
      err = await onMagicLink(email.trim());
      if (!err) {
        setSuccess("Magic link sent! Check your email to sign in.");
        setLoading(false);
        return;
      }
    } else if (tab === "signin") {
      err = await onSignIn(email.trim(), password);
    } else {
      err = await onSignUp(email.trim(), password);
      if (!err) {
        setSuccess("Account created! Check your email to confirm, then sign in.");
        setLoading(false);
        return;
      }
    }

    if (err) {
      setError(err);
    } else {
      onClose(); // success — session will update via onAuthStateChange
    }
    setLoading(false);
  }, [tab, mode, email, password, onSignIn, onSignUp, onMagicLink, onClose]);

  if (!isOpen) return null;

  const inputClass =
    "w-full bg-bg-raised border border-border-subtle rounded-md px-3 py-2.5 " +
    "text-[13px] text-text-primary placeholder:text-text-muted outline-none " +
    "focus:border-border-muted transition-colors font-sans";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[400px] bg-bg-surface border border-border-subtle rounded-[12px] overflow-hidden shadow-2xl animate-rise">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between mb-4">
            <div className="font-serif-display text-[20px] text-text-primary">
              Prompt<span className="text-accent-amber">Forge</span>
            </div>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary text-[20px] leading-none transition-colors"
            >
              ×
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-bg-raised rounded-lg p-1">
            {(["signin", "signup"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); reset(); }}
                className={`flex-1 py-1.5 rounded-md text-[13px] font-medium transition-colors
                  ${tab === t
                    ? "bg-bg-overlay text-text-primary"
                    : "text-text-muted hover:text-text-primary"
                  }`}
              >
                {t === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">

          {/* Success message */}
          {success && (
            <div className="px-4 py-3 bg-accent-green/10 border border-accent-green/30 rounded-lg
                            text-[12px] text-accent-green leading-relaxed">
              {success}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg
                            text-[12px] text-red-300 leading-relaxed">
              {error}
            </div>
          )}

          {/* Auth mode toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setMode("password"); reset(); }}
              className={`font-code text-[11px] tracking-wider transition-colors
                ${mode === "password" ? "text-accent-amber" : "text-text-muted hover:text-text-primary"}`}
            >
              Password
            </button>
            <span className="text-text-muted text-[11px]">·</span>
            <button
              onClick={() => { setMode("magic"); reset(); }}
              className={`font-code text-[11px] tracking-wider transition-colors
                ${mode === "magic" ? "text-accent-amber" : "text-text-muted hover:text-text-primary"}`}
            >
              Magic Link
            </button>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-text-secondary">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              onKeyDown={(e) => e.key === "Enter" && !loading && handleSubmit()}
              placeholder="you@example.com"
              autoComplete="email"
              className={inputClass}
            />
          </div>

          {/* Password (hidden in magic link mode) */}
          {mode === "password" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-text-secondary">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPass(e.target.value); setError(null); }}
                onKeyDown={(e) => e.key === "Enter" && !loading && handleSubmit()}
                placeholder={tab === "signup" ? "At least 6 characters" : "Your password"}
                autoComplete={tab === "signin" ? "current-password" : "new-password"}
                className={inputClass}
              />
            </div>
          )}

          {/* Hint text */}
          <p className="text-[11px] text-text-muted leading-relaxed -mt-1">
            {mode === "magic"
              ? "We'll email you a secure link — no password needed."
              : tab === "signup"
              ? "Your data stays private. We only store what you create."
              : "Sign in to sync templates, favorites, and history across devices."}
          </p>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-2.5 rounded-md bg-accent-amber text-bg-base
                       font-medium text-[13px] hover:opacity-90
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all active:scale-[0.98]"
          >
            {loading
              ? "..."
              : mode === "magic"
              ? "Send Magic Link"
              : tab === "signin"
              ? "Sign In"
              : "Create Account"}
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 text-center">
          <p className="text-[11px] text-text-muted">
            {tab === "signin" ? "No account? " : "Already have one? "}
            <button
              onClick={() => { setTab(tab === "signin" ? "signup" : "signin"); reset(); }}
              className="text-text-secondary hover:text-text-primary underline underline-offset-2 transition-colors"
            >
              {tab === "signin" ? "Create one" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
