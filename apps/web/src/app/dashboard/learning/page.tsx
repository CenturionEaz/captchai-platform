"use client";

import { motion } from "framer-motion";
import { Brain, TrendingUp, RefreshCw, Database, Cpu, CheckCircle2, AlertCircle, ArrowRight, BarChart2 } from "lucide-react";
import { LineChart, Line, AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, Cell } from "recharts";

const accuracyTrend = [
  { day: "Mon", acc: 0.81, loss: 0.42 }, { day: "Tue", acc: 0.83, loss: 0.38 },
  { day: "Wed", acc: 0.86, loss: 0.34 }, { day: "Thu", acc: 0.87, loss: 0.31 },
  { day: "Fri", acc: 0.89, loss: 0.26 }, { day: "Sat", acc: 0.91, loss: 0.22 },
  { day: "Sun", acc: 0.93, loss: 0.18 },
];

const mistakeClusters = [
  { cluster: "Distorted L/I", count: 48, reduced: true },
  { cluster: "Low-contrast images", count: 31, reduced: false },
  { cluster: "Overlapping chars", count: 27, reduced: true },
  { cluster: "Rotated glyphs", count: 19, reduced: true },
  { cluster: "Audio noise", count: 14, reduced: false },
];

const retainingSamples = [
  { label: "Correctly solved", value: 1847, color: "#10b981" },
  { label: "Corrected by user", value: 342, color: "#f59e0b" },
  { label: "Failed — pending", value: 89, color: "#ef4444" },
];

const learningEvents = [
  { time: "14:32", event: "Retraining cycle completed — accuracy +0.8%", type: "success" },
  { time: "13:17", event: "142 corrected samples ingested into training set", type: "info" },
  { time: "11:55", event: "Mistake cluster 'Distorted L/I' reduced by 31%", type: "success" },
  { time: "10:40", event: "New challenge pattern detected — flagged for labeling", type: "warning" },
  { time: "09:21", event: "Vector embeddings re-indexed — 2,841 vectors", type: "info" },
  { time: "07:05", event: "Scheduled weekly retraining pipeline started", type: "info" },
];

export default function LearningPage() {
  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Learning Engine</h1>
        <p className="text-sm text-slate-500 mt-0.5">AI self-improvement loop · Mistake memory · Retraining pipeline</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Training Cycles", value: "1,284", sub: "+47 this week", icon: RefreshCw, c: "cyan" },
          { label: "Samples Learned", value: "24,891", sub: "+2,341 this week", icon: Database, c: "purple" },
          { label: "Model Accuracy", value: "93.1%", sub: "↑ 12.1% from baseline", icon: Brain, c: "green" },
          { label: "Error Clusters", value: "5", sub: "2 actively reducing", icon: AlertCircle, c: "orange" },
        ].map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass-card p-5">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs text-slate-500">{k.label}</span>
              <k.icon className={`w-4 h-4 ${k.c === "cyan" ? "text-cyan-400" : k.c === "purple" ? "text-violet-400" : k.c === "green" ? "text-emerald-400" : "text-amber-400"}`} />
            </div>
            <div className="text-2xl font-black text-white">{k.value}</div>
            <div className="text-xs text-slate-500 mt-1">{k.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Accuracy Trend */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-white mb-1">Accuracy Trend</h2>
          <p className="text-xs text-slate-500 mb-5">7-day model performance evolution</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={accuracyTrend}>
              <defs>
                <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis domain={[0.7, 1]} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              <Area type="monotone" dataKey="acc" stroke="#10b981" strokeWidth={2} fill="url(#accGrad)" name="Accuracy" />
              <Line type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={1.5} dot={false} name="Loss" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Training Set Breakdown */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-white mb-1">Training Set Composition</h2>
          <p className="text-xs text-slate-500 mb-5">Sample quality breakdown</p>
          <div className="space-y-4">
            {retainingSamples.map((s) => {
              const total = retainingSamples.reduce((a, b) => a + b.value, 0);
              return (
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400">{s.label}</span>
                    <span className="text-slate-300 font-medium">{s.value.toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.04]">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: s.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(s.value / total) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
            <div className="text-xs text-slate-500">Total labeled samples</div>
            <div className="text-xl font-black text-white mt-0.5">
              {retainingSamples.reduce((a, b) => a + b.value, 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Mistake Clusters */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-white">Mistake Clusters</h2>
            <p className="text-xs text-slate-500 mt-0.5">Common failure patterns being actively learned</p>
          </div>
          <button className="btn-secondary text-xs py-1.5 px-3"><RefreshCw className="w-3 h-3" /> Retrain Now</button>
        </div>
        <div className="space-y-3">
          {mistakeClusters.map((c, i) => (
            <motion.div key={c.cluster} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }} className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <div className={`w-1.5 h-1.5 rounded-full ${c.reduced ? "bg-emerald-400" : "bg-amber-400"}`} />
              <span className="text-sm text-slate-300 flex-1">{c.cluster}</span>
              <span className="text-xs text-slate-500">{c.count} samples</span>
              {c.reduced ? (
                <span className="badge-green text-[10px]">IMPROVING</span>
              ) : (
                <span className="badge-orange text-[10px]">PERSISTENT</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Learning Events Timeline */}
      <div className="glass-card p-6">
        <h2 className="text-sm font-semibold text-white mb-5">Learning Event Log</h2>
        <div className="space-y-3">
          {learningEvents.map((e, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-[10px] text-slate-600 w-10 shrink-0 mt-0.5 font-mono">{e.time}</span>
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${e.type === "success" ? "bg-emerald-400" : e.type === "warning" ? "bg-amber-400" : "bg-cyan-400"}`} />
              <span className="text-xs text-slate-400">{e.event}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
