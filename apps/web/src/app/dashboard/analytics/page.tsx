"use client";

import { motion } from "framer-motion";
import { BarChart3, TrendingUp, TrendingDown, Calendar, Filter } from "lucide-react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, ResponsiveContainer,
  Tooltip, Area, AreaChart, RadarChart, PolarGrid,
  PolarAngleAxis, Radar, ScatterChart, Scatter, ZAxis
} from "recharts";

const weeklyData = [
  { day: "Mon", solved: 1240, failed: 89, latency: 2.1 },
  { day: "Tue", solved: 1380, failed: 76, latency: 1.9 },
  { day: "Wed", solved: 1190, failed: 94, latency: 2.4 },
  { day: "Thu", solved: 1520, failed: 68, latency: 1.8 },
  { day: "Fri", solved: 1680, failed: 72, latency: 1.6 },
  { day: "Sat", solved: 980, failed: 45, latency: 1.4 },
  { day: "Sun", solved: 1100, failed: 51, latency: 1.5 },
];

const radarData = [
  { subject: "Image", A: 94, B: 72 },
  { subject: "OCR", A: 91, B: 68 },
  { subject: "Audio", A: 87, B: 60 },
  { subject: "Slider", A: 96, B: 81 },
  { subject: "Detector", A: 98, B: 85 },
  { subject: "Behavioral", A: 79, B: 55 },
];

const hourlyHeatmap = Array.from({ length: 7 }, (_, day) =>
  Array.from({ length: 24 }, (_, hour) => ({
    day, hour, value: Math.floor(Math.random() * 100),
  }))
).flat();

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AnalyticsPage() {
  const totalSolved = weeklyData.reduce((a, b) => a + b.solved, 0);
  const totalFailed = weeklyData.reduce((a, b) => a + b.failed, 0);
  const successRate = ((totalSolved / (totalSolved + totalFailed)) * 100).toFixed(1);

  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Research performance deep-dive</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost text-xs py-1.5 px-3"><Calendar className="w-3.5 h-3.5" /> Last 7 Days</button>
          <button className="btn-ghost text-xs py-1.5 px-3"><Filter className="w-3.5 h-3.5" /> Filter</button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Analyzed", value: (totalSolved + totalFailed).toLocaleString(), sub: "This week", up: true },
          { label: "Success Rate", value: `${successRate}%`, sub: "↑ 2.8% vs last week", up: true },
          { label: "Avg Latency", value: "1.81s", sub: "↓ 0.3s vs last week", up: true },
        ].map((s) => (
          <div key={s.label} className="glass-card p-5 text-center">
            <div className="text-3xl font-black text-white mb-1">{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
            <div className={`text-xs mt-1 ${s.up ? "text-emerald-400" : "text-red-400"}`}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Weekly Chart */}
      <div className="glass-card p-6">
        <h2 className="text-sm font-semibold text-white mb-5">Weekly Performance</h2>
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={weeklyData}>
            <XAxis dataKey="day" tick={{ fontSize: 10 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
            <Bar yAxisId="left" dataKey="solved" name="Solved" fill="#00d4ff" opacity={0.8} radius={[3,3,0,0]} />
            <Bar yAxisId="left" dataKey="failed" name="Failed" fill="#ef4444" opacity={0.6} radius={[3,3,0,0]} />
            <Line yAxisId="right" type="monotone" dataKey="latency" stroke="#f59e0b" strokeWidth={2} dot={false} name="Latency (s)" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Radar — Model Comparison */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-white mb-1">Model Performance Radar</h2>
          <p className="text-xs text-slate-500 mb-4">CaptchaIQ models vs baseline</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#64748b" }} />
              <Radar name="CaptchaIQ" dataKey="A" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.2} />
              <Radar name="Baseline" dataKey="B" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} />
              <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 justify-center text-xs">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-cyan-400" /> CaptchaIQ</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-violet-400" /> Baseline</div>
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-white mb-1">Activity Heatmap</h2>
          <p className="text-xs text-slate-500 mb-4">Analysis volume by day and hour</p>
          <div className="overflow-x-auto">
            <div className="flex gap-1">
              <div className="flex flex-col gap-1 mr-1">
                {dayLabels.map((d) => (
                  <div key={d} className="text-[9px] text-slate-600 h-4 flex items-center w-6">{d}</div>
                ))}
              </div>
              {Array.from({ length: 24 }, (_, hour) => (
                <div key={hour} className="flex flex-col gap-1">
                  {Array.from({ length: 7 }, (_, day) => {
                    const item = hourlyHeatmap.find(h => h.day === day && h.hour === hour);
                    const v = item?.value || 0;
                    const opacity = v / 100;
                    return (
                      <div
                        key={day}
                        className="w-4 h-4 rounded-[2px]"
                        style={{ background: `rgba(0,212,255,${opacity * 0.8 + 0.05})` }}
                        title={`${dayLabels[day]} ${hour}:00 — ${v} analyses`}
                      />
                    );
                  })}
                  {hour % 4 === 0 && <div className="text-[8px] text-slate-700 text-center">{hour}h</div>}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-[10px] text-slate-600">
            <span>Low</span>
            <div className="flex gap-0.5">
              {[0.1, 0.3, 0.5, 0.7, 0.9].map((o) => (
                <div key={o} className="w-3 h-3 rounded-[2px]" style={{ background: `rgba(0,212,255,${o})` }} />
              ))}
            </div>
            <span>High</span>
          </div>
        </div>
      </div>
    </div>
  );
}
