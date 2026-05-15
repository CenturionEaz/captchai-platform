"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical, Upload, Play, BarChart2, Cpu, Layers,
  Eye, Zap, CheckCircle2, AlertCircle, RotateCcw, Download,
  GitCompare, SplitSquareHorizontal, Search, Shield,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
type Model = { id: string; name: string; type: string; accuracy: number };
type PipelineStage = { label: string; status: "idle" | "running" | "done" | "error"; time?: number };
type CompareResult = { modelId: string; name: string; confidence: number; prediction: string; latency: number };

const MODELS: Model[] = [
  { id: "captchaiq-ocr-v3", name: "CaptchaIQ OCR v3", type: "ocr", accuracy: 91.7 },
  { id: "captchaiq-vision-v2", name: "CaptchaIQ Vision v2", type: "image", accuracy: 94.2 },
  { id: "captchaiq-slider-v1", name: "CaptchaIQ Slider v1", type: "slider", accuracy: 96.1 },
  { id: "captchaiq-audio-v1", name: "CaptchaIQ Audio v1", type: "audio", accuracy: 87.3 },
  { id: "captchaiq-detector-v1", name: "CaptchaIQ Detector v1", type: "detection", accuracy: 98.4 },
];

const OCR_STAGES: PipelineStage[] = [
  { label: "Load & validate image", status: "idle" },
  { label: "Grayscale conversion", status: "idle" },
  { label: "3× upscale (bicubic)", status: "idle" },
  { label: "Gaussian blur denoise", status: "idle" },
  { label: "Otsu thresholding", status: "idle" },
  { label: "Morphological cleanup", status: "idle" },
  { label: "Tesseract OCR (PSM 7)", status: "idle" },
  { label: "Confidence scoring", status: "idle" },
];

const confidenceHistory = Array.from({ length: 12 }, (_, i) => ({
  run: `#${i + 1}`,
  ocr: 75 + Math.random() * 20,
  vision: 80 + Math.random() * 18,
  detector: 90 + Math.random() * 9,
}));

export default function LabPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedModels, setSelectedModels] = useState<string[]>(["captchaiq-ocr-v3"]);
  const [stages, setStages] = useState<PipelineStage[]>(OCR_STAGES);
  const [results, setResults] = useState<CompareResult[]>([]);
  const [running, setRunning] = useState(false);
  const [tab, setTab] = useState<"pipeline" | "compare" | "history">("pipeline");
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (f: File) => {
    setFile(f);
    setResults([]);
    setStages(OCR_STAGES.map((s) => ({ ...s, status: "idle" })));
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const runAnalysis = useCallback(async () => {
    if (!file) return;
    setRunning(true);
    setResults([]);

    // Simulate pipeline stages
    for (let i = 0; i < stages.length; i++) {
      await new Promise((r) => setTimeout(r, 200 + Math.random() * 300));
      setStages((prev) => prev.map((s, idx) => ({
        ...s,
        status: idx < i ? "done" : idx === i ? "done" : "idle",
        time: idx === i ? Math.floor(50 + Math.random() * 200) : s.time,
      })));
    }

    // Simulate model results
    const res: CompareResult[] = selectedModels.map((id) => {
      const m = MODELS.find((m) => m.id === id)!;
      return {
        modelId: id,
        name: m.name,
        confidence: m.accuracy / 100 * (0.85 + Math.random() * 0.15),
        prediction: id.includes("ocr") ? "R3k9mP" : id.includes("vision") ? "Traffic lights" : id.includes("slider") ? "Gap at x=147px" : id.includes("detector") ? "text-ocr" : "analyzed",
        latency: Math.floor(400 + Math.random() * 1800),
      };
    });

    setResults(res);
    setRunning(false);
  }, [file, selectedModels, stages]);

  const toggleModel = (id: string) =>
    setSelectedModels((prev) => prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]);

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <FlaskConical className="w-6 h-6 text-cyan-400" />
          Research Lab
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Interactive AI playground · Side-by-side model comparison · Pipeline visualization
        </p>
      </div>

      {/* Ethics banner */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-400/5 border border-cyan-400/10">
        <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
        <p className="text-xs text-cyan-300">
          Research lab is for analyzing challenges on systems you own or have explicit authorization to test.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Panel — Upload + Config */}
        <div className="space-y-5">
          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => document.getElementById("lab-file-input")?.click()}
            className={`glass-card p-6 flex flex-col items-center justify-center min-h-40 cursor-pointer border-2 transition-all ${dragOver ? "border-cyan-400/50 bg-cyan-400/5" : "border-dashed border-white/[0.08] hover:border-white/[0.15]"}`}
          >
            <input id="lab-file-input" type="file" accept="image/*,audio/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
            {preview ? (
              <div className="w-full">
                <img src={preview} alt="Preview" className="w-full rounded-lg object-contain max-h-32" />
                <p className="text-xs text-slate-500 text-center mt-2 truncate">{file?.name}</p>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-slate-600 mb-3" />
                <p className="text-sm text-slate-400 font-medium">Drop CAPTCHA here</p>
                <p className="text-xs text-slate-600 mt-1">PNG, JPG, WebP, MP3, WAV</p>
              </>
            )}
          </div>

          {/* Model Selection */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Select Models</h3>
            <div className="space-y-2">
              {MODELS.map((m) => {
                const selected = selectedModels.includes(m.id);
                return (
                  <button key={m.id} onClick={() => toggleModel(m.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${selected ? "border-cyan-400/30 bg-cyan-400/5" : "border-white/[0.06] hover:bg-white/[0.03]"}`}>
                    <div className={`w-1.5 h-1.5 rounded-full transition-colors ${selected ? "bg-cyan-400" : "bg-slate-700"}`} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-medium ${selected ? "text-white" : "text-slate-400"}`}>{m.name}</div>
                      <div className="text-[10px] text-slate-600">{m.accuracy}% accuracy</div>
                    </div>
                    {selected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <button onClick={runAnalysis} disabled={!file || running || selectedModels.length === 0}
            className="w-full btn-primary justify-center py-3 disabled:opacity-50">
            {running ? <><RotateCcw className="w-4 h-4 animate-spin" /> Running...</> : <><Play className="w-4 h-4" /> Run Analysis</>}
          </button>
        </div>

        {/* Right Panel — Results */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            {([
              { id: "pipeline", icon: Layers, label: "Pipeline" },
              { id: "compare", icon: GitCompare, label: "Compare" },
              { id: "history", icon: BarChart2, label: "History" },
            ] as const).map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${tab === t.id ? "bg-cyan-400/10 text-cyan-400" : "text-slate-500 hover:text-slate-300"}`}>
                <t.icon className="w-3.5 h-3.5" />{t.label}
              </button>
            ))}
          </div>

          {/* Pipeline Tab */}
          {tab === "pipeline" && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-5">Pipeline Execution</h3>
              <div className="space-y-3">
                {stages.map((stage, i) => (
                  <motion.div key={i} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      stage.status === "done" ? "bg-emerald-400/10 text-emerald-400"
                      : stage.status === "running" ? "bg-cyan-400/10 text-cyan-400"
                      : stage.status === "error" ? "bg-red-400/10 text-red-400"
                      : "bg-white/[0.04] text-slate-700"
                    }`}>
                      {stage.status === "done" ? <CheckCircle2 className="w-3.5 h-3.5" />
                       : stage.status === "running" ? <RotateCcw className="w-3 h-3 animate-spin" />
                       : stage.status === "error" ? <AlertCircle className="w-3.5 h-3.5" />
                       : <span className="text-[10px] font-bold">{i + 1}</span>}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${stage.status === "done" ? "text-white" : stage.status === "running" ? "text-cyan-400" : "text-slate-600"}`}>
                        {stage.label}
                      </div>
                      {stage.time && <div className="text-[10px] text-slate-600">{stage.time}ms</div>}
                    </div>
                    {i < stages.length - 1 && stage.status === "done" && (
                      <div className="w-px h-4 bg-emerald-400/30 absolute left-[35px] translate-y-6" />
                    )}
                  </motion.div>
                ))}
              </div>

              {results.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 pt-6 border-t border-white/[0.06]">
                  <h4 className="text-xs font-semibold text-white mb-4">Primary Result</h4>
                  <div className="p-4 rounded-xl bg-cyan-400/5 border border-cyan-400/20">
                    <div className="text-2xl font-black text-white mb-1 font-mono">{results[0]?.prediction}</div>
                    <div className="text-sm text-slate-400">Confidence: <span className="text-cyan-400 font-semibold">{(results[0]?.confidence * 100).toFixed(1)}%</span></div>
                    <div className="mt-3 h-2 rounded-full bg-white/[0.04]">
                      <motion.div className="h-full rounded-full bg-cyan-400"
                        initial={{ width: 0 }} animate={{ width: `${results[0]?.confidence * 100}%` }} transition={{ duration: 0.8 }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Compare Tab */}
          {tab === "compare" && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-5 flex items-center gap-2">
                <SplitSquareHorizontal className="w-4 h-4" /> Model Comparison
              </h3>
              {results.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-slate-600 text-sm">
                  Run analysis first to see model comparison
                </div>
              ) : (
                <div className="space-y-4">
                  {results.map((r) => (
                    <div key={r.modelId} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-sm font-semibold text-white">{r.name}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">"{r.prediction}"</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-black text-white">{(r.confidence * 100).toFixed(1)}%</div>
                          <div className="text-xs text-slate-500">{r.latency}ms</div>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.04]">
                        <motion.div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
                          initial={{ width: 0 }} animate={{ width: `${r.confidence * 100}%` }} transition={{ duration: 0.8 }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {tab === "history" && (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-5">Benchmark History</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={confidenceHistory}>
                  <defs>
                    {[["ocr", "#00d4ff"], ["vision", "#8b5cf6"], ["detector", "#10b981"]].map(([key, color]) => (
                      <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <XAxis dataKey="run" tick={{ fontSize: 10 }} />
                  <YAxis domain={[60, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                  <Area type="monotone" dataKey="ocr" stroke="#00d4ff" fill="url(#grad-ocr)" name="OCR" strokeWidth={2} />
                  <Area type="monotone" dataKey="vision" stroke="#8b5cf6" fill="url(#grad-vision)" name="Vision" strokeWidth={2} />
                  <Area type="monotone" dataKey="detector" stroke="#10b981" fill="url(#grad-detector)" name="Detector" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 justify-center text-xs mt-2">
                {[["OCR", "#00d4ff"], ["Vision", "#8b5cf6"], ["Detector", "#10b981"]].map(([n, c]) => (
                  <div key={n} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: c }} />
                    <span className="text-slate-500">{n}</span>
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
