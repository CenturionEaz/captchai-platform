"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, Mail, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    setDone(true);
  };

  return (
    <div className="min-h-screen bg-[#020617] cyber-grid flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-white text-xl">CaptchaIQ</span>
          </Link>
          <h1 className="text-2xl font-black text-white mb-2">Reset your password</h1>
          <p className="text-slate-400 text-sm">We&apos;ll send a secure link to your email</p>
        </div>

        <div className="glass-card p-8">
          {done ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-white font-semibold">Check your email</p>
              <p className="text-sm text-slate-400">Password reset link sent to <span className="text-white">{email}</span></p>
              <Link href="/login" className="btn-secondary text-sm w-full justify-center block mt-4">Back to sign in</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-400/10 border border-red-400/20 text-xs text-red-400">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="researcher@lab.edu" className="input-field pl-10" autoComplete="email" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full btn-primary justify-center py-3 text-sm disabled:opacity-60">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <>Send reset link <ArrowRight className="w-4 h-4" /></>}
              </button>
              <Link href="/login" className="block text-center text-xs text-slate-500 hover:text-slate-300 transition-colors">← Back to sign in</Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
