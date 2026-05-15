"use client";

import { motion } from "framer-motion";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { Brain, Zap, Target, TrendingUp, Activity, RefreshCw, ArrowUpRight, ArrowDownRight, ChevronRight, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

// Mock data
const solveRateData = [
  { time: "00:00", rate: 71, confidence: 0.68 },
  { time: "04:00", rate: 74, confidence: 0.72 },
  { time: "08:00", rate: 78, confidence: 0.76 },
  { time: "12:00", rate: 82, confidence: 0.80 },
  { time: "16:00", rate: 85, confidence: 0.83 },
  { time: "20:00", rate: 88, confidence: 0.87 },
  { time: "Now", rate: 91, confidence: 0.90 },
];

const challengeDistrib = [
  { name: "Image Select", value: 38, color: "#00d4ff" },
  { name: "Text OCR", value: 27, color: "#8b5cf6" },
  { name: "Audio", value: 14, color: "#10b981" },
  { name: "Slider", value: 13, color: "#f59e0b" },
  { name: "Behavioral", value: 8, color: "#ec4899" },
];

const learningData = [
  { epoch: "E1", loss: 0.82, acc: 0.61 },
  { epoch: "E2", loss: 0.71, acc: 0.70 },
  { epoch: "E3", loss: 0.58, acc: 0.76 },
  { epoch: "E4", loss: 0.44, acc: 0.82 },
  { epoch: "E5", loss: 0.33, acc: 0.87 },
  { epoch: "E6", loss: 0.24, acc: 0.91 },
  { epoch: "E7", loss: 0.18, acc: 0.93 },
];

const latencyData = [
  { time: "1h", avg: 2.4 }, { time: "2h", avg: 1.9 },
  { time: "3h", avg: 3.1 }, { time: "4h", avg: 2.2 },
  { time: "5h", avg: 1.8 }, { time: "6h", avg: 2.6 },
  { time: "Now", avg: 1.5 },
];

const recentActivity = [
  { id: 1, type: "success", message: "Image classification resolved — 97.3% confidence", time: "2s ago", tag: "IMAGE" },
  { id: 2, type: "learning", message: "Model retrained on 142 corrected samples", time: "14s ago", tag: "LEARN" },
  { id: 3, type: "error", message: "Audio challenge failed — queued for retraining", time: "31s ago", tag: "AUDIO" },
  { id: 4, type: "success", message: "OCR pipeline resolved distorted text challenge", time: "45s ago", tag: "OCR" },
  { id: 5, type: "warning", message: "Confidence below threshold (0.62) — fallback invoked", time: "1m ago", tag: "FALLBACK" },
  { id: 6, type: "success", message: "Slider analysis complete — gap detected at x=182", time: "2m ago", tag: "SLIDER" },
];

const metrics = [
  { label: "Solve Rate", value: "91.4%", change: "+3.2%", up: true, icon: Target, color: "cyan" },
  { label: "Avg Latency", value: "1.5s", change: "-0.4s", up: true, icon: Zap, color: "purple" },
  { label: "AI Confidence", value: "0.903", change: "+0.021", up: true, icon: Brain, color: "green" },
  { label: "Training Cycles", value: "1,284", change: "+47 today", up: true, icon: RefreshCw, color: "orange" },
];

function MetricCard({ m }: { m: typeof metrics[0] }) {
  const colorMap: Record<string, string> = {
    cyan: "text-cyan-400 bg-cyan-400/10",
    purple: "text-violet-400 bg-violet-400/10",
    green: "text-emerald-400 bg-emerald-400/10",
    orange: "text-amber-400 bg-amber-400/10",
  };
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-slate-500 font-medium">{m.label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[m.color]}`}>
          <m.icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl font-black text-white mb-1">{m.value}</div>
      <div className={`flex items-center gap-1 text-xs font-medium ${m.up ? "text-emerald-400" : "text-red-400"}`}>
        {m.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {m.change}
      </div>
    </div>
  );
}

const ActivityIcon = ({ type }: { type: string }) => {
  if (type === "success") return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
  if (type === "error") return <XCircle className="w-3.5 h-3.5 text-red-400" />;
  if (type === "warning") return <AlertCircle className="w-3.5 h-3.5 text-amber-400" />;
  return <Brain className="w-3.5 h-3.5 text-violet-400" />;
};

const tagColors: Record<string, string> = {
  IMAGE: "badge-cyan", LEARN: "badge-purple", AUDIO: "badge-green",
  OCR: "badge-orange", FALLBACK: "badge-orange", SLIDER: "badge-cyan",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Research Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">AI pipeline performance · Live telemetry · Learning progress</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live — updates every 2s
          </div>
          <button className="btn-secondary text-xs py-1.5 px-3">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <MetricCard m={m} />
          </motion.div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Solve Rate Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-semibold text-white">Solve Rate & Confidence</h2>
              <p className="text-xs text-slate-500 mt-0.5">24h rolling window</p>
            </div>
            <span className="badge-cyan">LIVE</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={solveRateData}>
              <defs>
                <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              <Area type="monotone" dataKey="rate" stroke="#00d4ff" strokeWidth={2} fill="url(#rateGrad)" name="Solve Rate %" />
              <Area type="monotone" dataKey="confidence" stroke="#8b5cf6" strokeWidth={2} fill="url(#confGrad)" name="Confidence" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Challenge Distribution */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-white mb-6">Challenge Distribution</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={challengeDistrib} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                {challengeDistrib.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {challengeDistrib.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-slate-400">{d.name}</span>
                </div>
                <span className="text-slate-300 font-medium">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Learning Curve */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-semibold text-white">AI Learning Curve</h2>
              <p className="text-xs text-slate-500 mt-0.5">Training loss & accuracy over epochs</p>
            </div>
            <span className="badge-purple">EPOCH 7</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={learningData}>
              <XAxis dataKey="epoch" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={2} dot={false} name="Loss" />
              <Line type="monotone" dataKey="acc" stroke="#10b981" strokeWidth={2} dot={false} name="Accuracy" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Latency */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-white mb-1">Solve Latency</h2>
          <p className="text-xs text-slate-500 mb-6">Avg seconds per challenge</p>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={latencyData} barSize={14}>
              <XAxis dataKey="time" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
              <Bar dataKey="avg" name="Avg (s)" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 rounded-lg bg-emerald-400/5 border border-emerald-400/15">
            <div className="text-xl font-black text-emerald-400">1.5s</div>
            <div className="text-xs text-slate-500">current avg · ↓ 21% vs yesterday</div>
          </div>
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Live Activity Feed</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time pipeline events</p>
          </div>
          <button className="btn-ghost text-xs flex items-center gap-1">View All <ChevronRight className="w-3.5 h-3.5" /></button>
        </div>
        <div className="space-y-2">
          {recentActivity.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors"
            >
              <ActivityIcon type={item.type} />
              <span className="text-xs text-slate-300 flex-1 min-w-0 truncate">{item.message}</span>
              <span className={`${tagColors[item.tag]} text-[10px] shrink-0`}>{item.tag}</span>
              <div className="flex items-center gap-1 text-[10px] text-slate-600 shrink-0">
                <Clock className="w-2.5 h-2.5" />
                {item.time}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
