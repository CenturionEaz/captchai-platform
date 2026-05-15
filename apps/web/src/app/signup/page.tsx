"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, Github, Mail, Lock, User, ArrowRight, Loader2, Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const passwordStrength = (pw: string) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};

const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-cyan-400", "bg-emerald-400"];

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"github" | "google" | null>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);

  const supabase = createClient();
  const strength = passwordStrength(password);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { setError("You must agree to the ethical use policy."); return; }
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    setDone(true);
  };

  const handleOAuth = async (provider: "github" | "google") => {
    if (!agreed) { setError("You must agree to the ethical use policy first."); return; }
    setOauthLoading(provider);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (authError) { setError(authError.message); setOauthLoading(null); }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-black text-white mb-2">Check your email</h2>
          <p className="text-slate-400 text-sm mb-6">
            We sent a verification link to <span className="text-white font-medium">{email}</span>.<br />
            Click it to activate your research account.
          </p>
          <Link href="/login" className="btn-primary w-full justify-center">Back to sign in</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] cyber-grid flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-white text-xl">CaptchaIQ</span>
          </Link>
          <h1 className="text-2xl font-black text-white mb-2">Create research account</h1>
          <p className="text-slate-400 text-sm">Join the AI CAPTCHA research platform</p>
        </div>

        <div className="glass-card p-8 space-y-5">
          {error && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-lg bg-red-400/10 border border-red-400/20 text-xs text-red-400">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
            </motion.div>
          )}

          {/* OAuth */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleOAuth("github")} disabled={!!oauthLoading}
              className="btn-secondary justify-center text-sm py-2.5 gap-2 disabled:opacity-60">
              {oauthLoading === "github" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
              GitHub
            </button>
            <button onClick={() => handleOAuth("google")} disabled={!!oauthLoading}
              className="btn-secondary justify-center text-sm py-2.5 gap-2 disabled:opacity-60">
              {oauthLoading === "google" ? <Loader2 className="w-4 h-4 animate-spin" /> : (
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
            <span className="text-xs text-slate-600">or with email</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Display Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Ada Lovelace" className="input-field pl-10" autoComplete="name" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="researcher@lab.edu" className="input-field pl-10" autoComplete="email" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••" className="input-field pl-10" autoComplete="new-password" minLength={8} />
              </div>
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor[strength] : "bg-white/[0.06]"}`} />
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500">{strengthLabel[strength]} password</p>
                </div>
              )}
            </div>

            {/* Ethics checkbox */}
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative mt-0.5">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="sr-only" />
                <div className={`w-4 h-4 rounded border transition-all ${agreed ? "bg-cyan-400 border-cyan-400" : "border-white/20 bg-white/[0.04]"} flex items-center justify-center`}>
                  {agreed && <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
              </div>
              <span className="text-xs text-slate-400 leading-relaxed">
                I agree to use this platform for authorized research only and have read the{" "}
                <Link href="/ethics" className="text-cyan-400 hover:underline">Ethical Use Policy</Link> and{" "}
                <Link href="/acceptable-use" className="text-cyan-400 hover:underline">Acceptable Use Policy</Link>.
              </span>
            </label>

            <button type="submit" disabled={loading || !agreed}
              className="w-full btn-primary justify-center py-3 text-sm disabled:opacity-60">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : <>Create account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-cyan-400 hover:underline font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
