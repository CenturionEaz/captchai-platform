"use client";

import { Suspense } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, Github, Mail, Lock, ArrowRight, Loader2, Shield, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"github" | "google" | null>(null);
  const [error, setError] = useState("");

  const supabase = createClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    router.push(next);
    router.refresh();
  };

  const handleOAuth = async (provider: "github" | "google") => {
    setOauthLoading(provider);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (authError) {
      setError(authError.message);
      setOauthLoading(null);
    }
  };

  return (
    <div className="glass-card p-8 space-y-5">
      <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-400/5 border border-amber-400/20 text-xs text-amber-400">
        <Shield className="w-3.5 h-3.5 shrink-0" />
        For authorized research use only. See{" "}
        <Link href="/ethics" className="underline ml-1">ETHICS.md</Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => handleOAuth("github")} disabled={!!oauthLoading}
          className="btn-secondary justify-center text-sm py-2.5 gap-2 disabled:opacity-60">
          {oauthLoading === "github" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
          GitHub
        </button>
        <button onClick={() => handleOAuth("google")} disabled={!!oauthLoading}
          className="btn-secondary justify-center text-sm py-2.5 gap-2 disabled:opacity-60">
          {oauthLoading === "google" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Google
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/[0.06]" />
        <span className="text-xs text-slate-600">or continue with email</span>
        <div className="flex-1 h-px bg-white/[0.06]" />
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-lg bg-red-400/10 border border-red-400/20 text-xs text-red-400">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
        </motion.div>
      )}

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="researcher@lab.edu" className="input-field pl-10" autoComplete="email" />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-slate-400">Password</label>
            <Link href="/forgot-password" className="text-xs text-cyan-400 hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••" className="input-field pl-10" autoComplete="current-password" />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full btn-primary justify-center py-3 text-sm disabled:opacity-60">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : <>Sign in <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#020617] cyber-grid flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-white text-xl">CaptchaIQ</span>
          </Link>
          <h1 className="text-2xl font-black text-white mb-2">Welcome back</h1>
          <p className="text-slate-400 text-sm">Sign in to your research dashboard</p>
        </div>
        {/* Suspense boundary required for useSearchParams() in Next.js 15 */}
        <Suspense fallback={<div className="glass-card p-8 text-center text-slate-500 text-sm">Loading...</div>}>
          <LoginForm />
        </Suspense>
        <p className="text-center text-sm text-slate-500 mt-6">
          No account?{" "}
          <Link href="/signup" className="text-cyan-400 hover:underline font-medium">Create one</Link>
        </p>
      </motion.div>
    </div>
  );
}
