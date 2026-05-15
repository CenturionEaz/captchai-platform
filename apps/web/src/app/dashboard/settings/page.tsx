"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, User, Bell, Shield, Key, Palette, Monitor, Moon, Sun, Laptop, Save, Copy, RefreshCw, Trash2, Eye, EyeOff, Check } from "lucide-react";

type Tab = "profile" | "appearance" | "notifications" | "apikeys" | "security";

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("profile");
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const saveChanges = async () => {
    await new Promise((r) => setTimeout(r, 600));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const tabs: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: "profile", icon: User, label: "Profile" },
    { id: "appearance", icon: Palette, label: "Appearance" },
    { id: "notifications", icon: Bell, label: "Notifications" },
    { id: "apikeys", icon: Key, label: "API Keys" },
    { id: "security", icon: Shield, label: "Security" },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <Settings className="w-6 h-6 text-slate-400" /> Settings
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your account, appearance, and research preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-44 shrink-0 space-y-1">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${tab === t.id ? "bg-cyan-400/10 text-cyan-400 border-l-2 border-cyan-400" : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"}`}>
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Profile */}
          {tab === "profile" && (
            <div className="glass-card p-6 space-y-5">
              <h2 className="text-sm font-semibold text-white">Profile Information</h2>
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center text-white text-2xl font-black">R</div>
                <div>
                  <button className="btn-secondary text-xs py-2 px-3">Change Avatar</button>
                  <p className="text-[10px] text-slate-600 mt-1">JPG, PNG, WebP — max 2MB</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 block mb-1.5">Display Name</label>
                  <input defaultValue="Researcher" className="input-field" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1.5">Username</label>
                  <input defaultValue="@researcher" className="input-field" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-500 block mb-1.5">Email</label>
                  <input defaultValue="researcher@lab.edu" type="email" className="input-field" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-slate-500 block mb-1.5">Research Bio</label>
                  <textarea defaultValue="AI security researcher specializing in adversarial ML and CAPTCHA robustness analysis." rows={3} className="input-field resize-none" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1.5">Institution</label>
                  <input placeholder="University / Lab" className="input-field" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1.5">Role</label>
                  <select className="input-field">
                    <option>Researcher</option>
                    <option>PhD Student</option>
                    <option>Engineer</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <button onClick={saveChanges} className={`btn-primary text-sm py-2.5 px-5 ${saved ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : ""}`}>
                {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>
          )}

          {/* Appearance */}
          {tab === "appearance" && (
            <div className="glass-card p-6 space-y-6">
              <h2 className="text-sm font-semibold text-white">Appearance</h2>
              <div>
                <p className="text-xs text-slate-500 mb-3">Theme</p>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { id: "dark", icon: Moon, label: "Dark" },
                    { id: "light", icon: Sun, label: "Light" },
                    { id: "system", icon: Laptop, label: "System" },
                  ] as const).map((t) => (
                    <button key={t.id} onClick={() => setTheme(t.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${theme === t.id ? "border-cyan-400/40 bg-cyan-400/5 text-cyan-400" : "border-white/[0.06] text-slate-400 hover:border-white/[0.1]"}`}>
                      <t.icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-3">Accent Color</p>
                <div className="flex gap-3">
                  {[["#00d4ff", "Cyan"], ["#8b5cf6", "Violet"], ["#10b981", "Emerald"], ["#f59e0b", "Amber"], ["#ef4444", "Red"]].map(([c, n]) => (
                    <button key={c} title={n} className="w-8 h-8 rounded-full border-2 border-transparent hover:border-white/30 transition-all"
                      style={{ background: c }} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-3">Sidebar Position</p>
                <div className="flex gap-2">
                  {["Left", "Right"].map((p) => (
                    <button key={p} className={`flex-1 py-2 rounded-lg border text-xs font-medium ${p === "Left" ? "border-cyan-400/30 bg-cyan-400/5 text-cyan-400" : "border-white/[0.06] text-slate-400 hover:border-white/[0.1]"}`}>{p}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {tab === "notifications" && (
            <div className="glass-card p-6 space-y-4">
              <h2 className="text-sm font-semibold text-white">Notification Preferences</h2>
              {[
                { label: "Analysis complete", desc: "When an AI analysis finishes", defaultOn: true },
                { label: "Training complete", desc: "When a training job completes", defaultOn: true },
                { label: "Model updates", desc: "New model versions available", defaultOn: false },
                { label: "Confidence alerts", desc: "When confidence drops below threshold", defaultOn: true },
                { label: "Weekly digest", desc: "Weekly research summary email", defaultOn: false },
                { label: "Security alerts", desc: "Account activity and login notifications", defaultOn: true },
              ].map((n) => (
                <div key={n.label} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <div>
                    <div className="text-sm text-white">{n.label}</div>
                    <div className="text-xs text-slate-500">{n.desc}</div>
                  </div>
                  <button className={`relative w-10 h-5 rounded-full transition-colors ${n.defaultOn ? "bg-cyan-400" : "bg-white/[0.1]"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow ${n.defaultOn ? "right-0.5" : "left-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* API Keys */}
          {tab === "apikeys" && (
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">API Keys</h2>
                <button className="btn-primary text-xs py-2 px-3"><RefreshCw className="w-3.5 h-3.5" /> Generate New Key</button>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm text-white font-medium">Research Key #1</div>
                    <div className="text-xs text-slate-500">Created 2024-01-15 · Last used 2h ago · 4,821 requests</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowKey(!showKey)} className="btn-ghost text-xs py-1 px-2">
                      {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button className="btn-ghost text-xs py-1 px-2"><Copy className="w-3.5 h-3.5" /></button>
                    <button className="btn-ghost text-xs py-1 px-2 text-red-400 hover:bg-red-400/10"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="font-mono text-xs bg-black/30 rounded-lg p-3 text-slate-400">
                  {showKey ? "ciq_live_sk_1234567890abcdef1234567890abcdef" : "ciq_live_sk_" + "•".repeat(32)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-amber-400/5 border border-amber-400/20 text-xs text-amber-400">
                Keep your API key secret. Do not commit it to version control or share it publicly.
              </div>
            </div>
          )}

          {/* Security */}
          {tab === "security" && (
            <div className="space-y-4">
              <div className="glass-card p-6 space-y-4">
                <h2 className="text-sm font-semibold text-white">Password</h2>
                <div className="space-y-3">
                  {["Current Password", "New Password", "Confirm New Password"].map((l) => (
                    <div key={l}>
                      <label className="text-xs text-slate-500 block mb-1.5">{l}</label>
                      <input type="password" className="input-field" placeholder="••••••••••" />
                    </div>
                  ))}
                  <button className="btn-primary text-sm py-2.5 px-5"><Shield className="w-4 h-4" /> Update Password</button>
                </div>
              </div>
              <div className="glass-card p-6 space-y-4">
                <h2 className="text-sm font-semibold text-white">Two-Factor Authentication</h2>
                <p className="text-xs text-slate-500">Add an extra layer of security to your account with 2FA.</p>
                <button className="btn-secondary text-sm py-2.5 px-5"><Shield className="w-4 h-4" /> Enable 2FA</button>
              </div>
              <div className="glass-card p-6 space-y-3">
                <h2 className="text-sm font-semibold text-white">Active Sessions</h2>
                {[
                  { device: "Chrome on Windows", ip: "192.168.0.1", time: "Current session" },
                  { device: "Firefox on macOS", ip: "10.0.0.5", time: "3 days ago" },
                ].map((s) => (
                  <div key={s.device} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <div>
                      <div className="text-sm text-white">{s.device}</div>
                      <div className="text-xs text-slate-500">{s.ip} · {s.time}</div>
                    </div>
                    {s.time !== "Current session" && (
                      <button className="text-xs text-red-400 hover:underline">Revoke</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
