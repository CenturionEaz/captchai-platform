"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Image as ImageIcon, Volume2, Move, MousePointer2,
  Cpu, Play, RotateCcw, ChevronRight, AlertTriangle,
  CheckCircle2, XCircle, Brain, Zap, Eye, BarChart2
} from "lucide-react";

const challengeTypes = [
  { id: "auto", label: "Auto Detect", icon: Eye, description: "Automatically identify challenge type" },
  { id: "image", label: "Image Select", icon: ImageIcon, description: "Grid image classification" },
  { id: "ocr", label: "Text OCR", icon: Cpu, description: "Distorted text recognition" },
  { id: "audio", label: "Audio", icon: Volume2, description: "Audio CAPTCHA transcription" },
  { id: "slider", label: "Slider", icon: Move, description: "Slider gap detection" },
  { id: "behavioral", label: "Behavioral", icon: MousePointer2, description: "Mouse/touch pattern analysis" },
];

type AnalysisState = "idle" | "uploading" | "analyzing" | "complete" | "failed";

const mockResult = {
  type: "image",
  confidence: 0.947,
  prediction: "Traffic lights",
  processingTime: 1.23,
  modelUsed: "captchaiq-vision-v2",
  pipeline: ["preprocess", "segment", "classify", "score"],
  corrections: 0,
  alternatives: [
    { label: "Street signs", confidence: 0.031 },
    { label: "Stop signs", confidence: 0.018 },
    { label: "Crosswalks", confidence: 0.004 },
  ],
};

export default function AnalyzePage() {
  const [selectedType, setSelectedType] = useState("auto");
  const [state, setState] = useState<AnalysisState>("idle");
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setState("idle");
  };

  const handleAnalyze = () => {
    if (!file) return;
    setState("analyzing");
    setTimeout(() => setState("complete"), 2800);
  };

  const reset = () => { setFile(null); setState("idle"); };

  const ConfBar = ({ value }: { value: number }) => (
    <div className="confidence-bar w-full">
      <motion.div
        className="confidence-bar-fill"
        initial={{ width: 0 }}
        animate={{ width: `${value * 100}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Analyze Challenge</h1>
        <p className="text-sm text-slate-500 mt-0.5">Upload a CAPTCHA sample for AI pipeline analysis</p>
      </div>

      {/* Ethical warning */}
      <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-400/5 border border-amber-400/20">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <p className="text-xs text-amber-300">
          Analysis must only be performed on CAPTCHAs from systems you own or have explicit authorization to test.
          This tool is for educational and security research purposes only.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left Panel */}
        <div className="lg:col-span-3 space-y-5">
          {/* Challenge Type */}
          <div className="glass-card p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Challenge Type</h2>
            <div className="grid grid-cols-3 gap-2">
              {challengeTypes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border text-center transition-all ${
                    selectedType === t.id
                      ? "bg-cyan-400/10 border-cyan-400/30 text-cyan-400"
                      : "border-white/[0.06] text-slate-400 hover:bg-white/[0.04] hover:text-slate-300"
                  }`}
                >
                  <t.icon className="w-4 h-4" />
                  <span className="text-[11px] font-medium leading-tight">{t.label}</span>
                </button>
              ))}
            </div>
            {selectedType !== "auto" && (
              <p className="text-xs text-slate-500 mt-3">
                {challengeTypes.find(t => t.id === selectedType)?.description}
              </p>
            )}
          </div>

          {/* Upload Area */}
          <div className="glass-card p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Upload Sample</h2>
            {!file ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                onClick={() => fileRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                  dragOver
                    ? "border-cyan-400/60 bg-cyan-400/5"
                    : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                }`}
              >
                <input ref={fileRef} type="file" accept="image/*,audio/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                <Upload className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                <p className="text-sm text-slate-400 font-medium">Drop file or click to upload</p>
                <p className="text-xs text-slate-600 mt-1">PNG, JPG, WebP, WAV, MP3 up to 10MB</p>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="w-12 h-12 rounded-lg bg-cyan-400/10 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{file.name}</div>
                  <div className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</div>
                </div>
                <button onClick={reset} className="btn-ghost text-xs p-2"><RotateCcw className="w-3.5 h-3.5" /></button>
              </div>
            )}
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={!file || state === "analyzing"}
            className="w-full btn-primary py-3 justify-center disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {state === "analyzing" ? (
              <><RotateCcw className="w-4 h-4 animate-spin" /> Analyzing...</>
            ) : (
              <><Play className="w-4 h-4" /> Run Analysis Pipeline</>
            )}
          </button>
        </div>

        {/* Right Panel — Results */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {state === "idle" && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 h-full flex flex-col items-center justify-center text-center">
                <Brain className="w-12 h-12 text-slate-700 mb-4" />
                <p className="text-slate-500 text-sm">Upload a challenge sample to begin analysis</p>
              </motion.div>
            )}

            {state === "analyzing" && (
              <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6 space-y-4">
                <h2 className="text-sm font-semibold text-white">Pipeline Running</h2>
                {["Preprocessing image", "Segmenting regions", "Running classifier", "Scoring confidence"].map((step, i) => (
                  <motion.div key={step} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.6 }} className="flex items-center gap-3">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    </motion.div>
                    <span className="text-xs text-slate-400">{step}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {state === "complete" && (
              <motion.div key="complete" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-semibold text-white">Analysis Complete</h2>
                </div>

                {/* Main Result */}
                <div className="p-4 rounded-xl bg-emerald-400/5 border border-emerald-400/20">
                  <div className="text-2xl font-black text-emerald-400">{mockResult.prediction}</div>
                  <div className="text-xs text-slate-500 mt-1">Primary prediction</div>
                </div>

                {/* Confidence */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-500">Confidence</span>
                    <span className="text-white font-semibold">{(mockResult.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <ConfBar value={mockResult.confidence} />
                </div>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Model", value: "vision-v2" },
                    { label: "Time", value: `${mockResult.processingTime}s` },
                    { label: "Type", value: "Image Select" },
                    { label: "Corrections", value: mockResult.corrections.toString() },
                  ].map((m) => (
                    <div key={m.label} className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                      <div className="text-[10px] text-slate-600">{m.label}</div>
                      <div className="text-xs text-slate-200 font-medium mt-0.5">{m.value}</div>
                    </div>
                  ))}
                </div>

                {/* Alternatives */}
                <div>
                  <div className="text-[10px] text-slate-600 mb-2 uppercase tracking-wider">Alternatives</div>
                  <div className="space-y-2">
                    {mockResult.alternatives.map((alt) => (
                      <div key={alt.label} className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">{alt.label}</span>
                        <span className="text-slate-500">{(alt.confidence * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={reset} className="btn-secondary w-full justify-center text-xs py-2">
                  <RotateCcw className="w-3.5 h-3.5" /> Analyze Another
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
