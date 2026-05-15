"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Download, RefreshCw, Sliders, Image as ImageIcon,
  Volume2, Move, Type, Layers, Play, ChevronRight,
  Package, AlertTriangle, Settings2, Shuffle, Grid3X3,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type ChallengeKind = "ocr" | "image-select" | "slider" | "audio" | "distorted-text" | "adversarial";

interface GenConfig {
  kind: ChallengeKind;
  count: number;
  distortionLevel: number;
  noiseLevel: number;
  fontSize: number;
  rotation: number;
  blur: number;
  colorScheme: "dark" | "light" | "random";
  font: string;
  adversarialStrength: number;
  includeLabels: boolean;
  exportFormat: "zip" | "json" | "csv";
}

// ─── Canvas renderer ─────────────────────────────────────────────────────────
function drawOCRCaptcha(canvas: HTMLCanvasElement, config: GenConfig) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width, height } = canvas;

  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const text = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");

  const bg = config.colorScheme === "dark" ? "#0a1628" : config.colorScheme === "light" ? "#f8fafc" : (Math.random() > 0.5 ? "#0a1628" : "#f8fafc");
  const isDark = bg.startsWith("#0a");

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Noise
  const noiseCount = Math.floor(config.noiseLevel * 2);
  for (let i = 0; i < noiseCount; i++) {
    ctx.fillStyle = isDark ? `rgba(255,255,255,${Math.random() * 0.15})` : `rgba(0,0,0,${Math.random() * 0.12})`;
    ctx.fillRect(Math.random() * width, Math.random() * height, Math.random() * 3, Math.random() * 3);
  }

  // Wave distortion lines
  const waveCount = Math.floor(config.distortionLevel / 20) + 2;
  for (let i = 0; i < waveCount; i++) {
    ctx.beginPath();
    ctx.strokeStyle = isDark ? `rgba(0,212,255,${Math.random() * 0.3 + 0.1})` : `rgba(0,100,200,${Math.random() * 0.2 + 0.05})`;
    ctx.lineWidth = Math.random() * 1.5 + 0.5;
    ctx.moveTo(0, Math.random() * height);
    for (let x = 0; x < width; x += 10) {
      ctx.lineTo(x, height / 2 + Math.sin(x / 20 + i) * 30 * (config.distortionLevel / 100));
    }
    ctx.stroke();
  }

  // Draw each character with individual rotation
  const charW = width / (text.length + 1);
  text.split("").forEach((char, i) => {
    ctx.save();
    const x = charW * (i + 0.8) + (Math.random() - 0.5) * 10 * (config.distortionLevel / 100);
    const y = height / 2 + (Math.random() - 0.5) * 15 * (config.distortionLevel / 100);
    ctx.translate(x, y);
    ctx.rotate(((Math.random() - 0.5) * config.rotation * Math.PI) / 180);
    ctx.font = `bold ${config.fontSize}px "${config.font}"`;
    ctx.fillStyle = isDark
      ? `hsl(${Math.random() * 60 + 180}, 80%, 70%)`
      : `hsl(${Math.random() * 60 + 200}, 60%, 30%)`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(char, 0, 0);
    ctx.restore();
  });

  // Blur pass
  if (config.blur > 0) {
    ctx.filter = `blur(${config.blur * 0.3}px)`;
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = "none";
  }

  return text;
}

function drawSliderCaptcha(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width, height } = canvas;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, width, 0);
  grad.addColorStop(0, "#0f172a");
  grad.addColorStop(1, "#1e293b");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Random background shapes
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.fillStyle = `rgba(0,212,255,${Math.random() * 0.05 + 0.02})`;
    ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 30 + 10, 0, Math.PI * 2);
    ctx.fill();
  }

  // The gap (puzzle piece hole)
  const gapX = Math.floor(Math.random() * (width - 100) + 60);
  const gapY = Math.floor(height / 2 - 20);
  const gapSize = 40;

  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.strokeStyle = "rgba(0,212,255,0.6)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(gapX, gapY, gapSize, gapSize, 6);
  ctx.fill();
  ctx.stroke();

  // Labels
  ctx.font = "11px monospace";
  ctx.fillStyle = "rgba(0,212,255,0.7)";
  ctx.fillText(`GAP @ x=${gapX}`, 8, height - 8);
}

// ─── Main Component ───────────────────────────────────────────────────────────
const kindOptions: { id: ChallengeKind; label: string; icon: React.ElementType; color: string }[] = [
  { id: "ocr", label: "OCR Text", icon: Type, color: "cyan" },
  { id: "distorted-text", label: "Distorted Text", icon: Layers, color: "purple" },
  { id: "image-select", label: "Image Select", icon: Grid3X3, color: "green" },
  { id: "slider", label: "Slider", icon: Move, color: "orange" },
  { id: "audio", label: "Audio", icon: Volume2, color: "pink" },
  { id: "adversarial", label: "Adversarial", icon: AlertTriangle, color: "red" },
];

const colorMap: Record<string, string> = {
  cyan: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
  purple: "text-violet-400 bg-violet-400/10 border-violet-400/30",
  green: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  orange: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  pink: "text-pink-400 bg-pink-400/10 border-pink-400/30",
  red: "text-red-400 bg-red-400/10 border-red-400/30",
};

const defaultConfig: GenConfig = {
  kind: "ocr",
  count: 1,
  distortionLevel: 40,
  noiseLevel: 30,
  fontSize: 32,
  rotation: 25,
  blur: 0,
  colorScheme: "dark",
  font: "Arial",
  adversarialStrength: 20,
  includeLabels: true,
  exportFormat: "zip",
};

function Slider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-500">{label}</span>
        <span className="text-slate-300 font-medium tabular-nums">{value}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/[0.06] accent-cyan-400"
      />
    </div>
  );
}

type Generated = { canvas: string; label: string; id: string };

export default function GeneratorPage() {
  const [config, setConfig] = useState<GenConfig>(defaultConfig);
  const [generated, setGenerated] = useState<Generated[]>([]);
  const [generating, setGenerating] = useState(false);
  const [batchCount, setBatchCount] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const set = (k: keyof GenConfig) => (v: GenConfig[keyof GenConfig]) =>
    setConfig((c) => ({ ...c, [k]: v }));

  const generateOne = useCallback((): Generated | null => {
    const canvas = document.createElement("canvas");
    canvas.width = 280;
    canvas.height = 100;
    let label = "";
    if (config.kind === "ocr" || config.kind === "distorted-text" || config.kind === "adversarial") {
      const cfg = config.kind === "adversarial"
        ? { ...config, distortionLevel: Math.min(100, config.adversarialStrength * 2), noiseLevel: config.adversarialStrength }
        : config;
      label = drawOCRCaptcha(canvas, cfg) || "";
    } else if (config.kind === "slider") {
      drawSliderCaptcha(canvas);
      label = "slider";
    } else {
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#0a1628";
      ctx.fillRect(0, 0, 280, 100);
      ctx.fillStyle = "rgba(0,212,255,0.3)";
      ctx.font = "14px monospace";
      ctx.fillText(`${config.kind.toUpperCase()} — generation stub`, 20, 55);
    }
    return { canvas: canvas.toDataURL(), label, id: Math.random().toString(36).slice(2) };
  }, [config]);

  const handleGenerate = async (count = 1) => {
    setGenerating(true);
    const results: Generated[] = [];
    for (let i = 0; i < count; i++) {
      await new Promise((r) => setTimeout(r, 80));
      const g = generateOne();
      if (g) results.push(g);
    }
    setGenerated((prev) => [...results, ...prev].slice(0, 20));
    setBatchCount((c) => c + count);
    setGenerating(false);
  };

  const downloadAll = () => {
    generated.forEach((g, i) => {
      const a = document.createElement("a");
      a.href = g.canvas;
      a.download = `captchaiq_${config.kind}_${i + 1}.png`;
      a.click();
    });
  };

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-violet-400" />
            CAPTCHA Generator
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Synthetic dataset engineering · AI training data · Adversarial benchmarks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-purple">{batchCount} generated</span>
          {generated.length > 0 && (
            <button onClick={downloadAll} className="btn-secondary text-xs py-2 px-3">
              <Download className="w-3.5 h-3.5" /> Export All
            </button>
          )}
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-400/5 border border-amber-400/20">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <p className="text-xs text-amber-300">
          Generated CAPTCHAs are for synthetic training datasets, benchmarking, and adversarial ML research only. Do not use generated data to attack real systems.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Config Panel */}
        <div className="lg:col-span-1 space-y-5">
          {/* Challenge Type */}
          <div className="glass-card p-5">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-slate-400" /> Challenge Type
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {kindOptions.map((k) => (
                <button key={k.id} onClick={() => set("kind")(k.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-medium transition-all ${config.kind === k.id ? `border ${colorMap[k.color]}` : "border-white/[0.06] text-slate-400 hover:bg-white/[0.03]"}`}>
                  <k.icon className="w-3.5 h-3.5" />
                  {k.label}
                </button>
              ))}
            </div>
          </div>

          {/* Distortion Controls */}
          <div className="glass-card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-400" /> Distortion Controls
            </h2>
            <Slider label="Distortion Level" value={config.distortionLevel} min={0} max={100} onChange={set("distortionLevel")} />
            <Slider label="Noise Level" value={config.noiseLevel} min={0} max={100} onChange={set("noiseLevel")} />
            <Slider label="Character Rotation" value={config.rotation} min={0} max={90} onChange={set("rotation")} />
            <Slider label="Blur" value={config.blur} min={0} max={10} onChange={set("blur")} />
            <Slider label="Font Size" value={config.fontSize} min={16} max={56} onChange={set("fontSize")} />
            {config.kind === "adversarial" && (
              <Slider label="Adversarial Strength" value={config.adversarialStrength} min={0} max={100} onChange={set("adversarialStrength")} />
            )}
          </div>

          {/* Style */}
          <div className="glass-card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white">Style</h2>
            <div>
              <div className="text-xs text-slate-500 mb-2">Color Scheme</div>
              <div className="flex gap-2">
                {(["dark", "light", "random"] as const).map((s) => (
                  <button key={s} onClick={() => set("colorScheme")(s)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${config.colorScheme === s ? "bg-cyan-400/10 border-cyan-400/30 text-cyan-400" : "border-white/[0.06] text-slate-400 hover:bg-white/[0.03]"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-2">Font</div>
              <select value={config.font} onChange={(e) => set("font")(e.target.value)}
                className="input-field text-xs py-2">
                {["Arial", "Courier New", "Georgia", "Impact", "Trebuchet MS", "Comic Sans MS"].map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Generate Actions */}
          <div className="space-y-2">
            <button onClick={() => handleGenerate(1)} disabled={generating}
              className="w-full btn-primary justify-center py-3 disabled:opacity-50">
              {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? "Generating..." : "Generate 1 Sample"}
            </button>
            <div className="grid grid-cols-3 gap-2">
              {[10, 50, 100].map((n) => (
                <button key={n} onClick={() => handleGenerate(n)} disabled={generating}
                  className="btn-secondary text-xs py-2 justify-center disabled:opacity-50">
                  <Package className="w-3 h-3" /> ×{n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Grid */}
        <div className="lg:col-span-2">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Generated Samples</h2>
              <div className="flex items-center gap-2">
                {generated.length > 0 && (
                  <button onClick={() => setGenerated([])} className="btn-ghost text-xs py-1">
                    Clear
                  </button>
                )}
                <button onClick={() => handleGenerate(1)} disabled={generating}
                  className="btn-ghost text-xs py-1 gap-1">
                  <Shuffle className="w-3 h-3" /> Regenerate
                </button>
              </div>
            </div>

            {generated.length === 0 ? (
              <div className="h-80 flex flex-col items-center justify-center text-center">
                <Sparkles className="w-12 h-12 text-slate-700 mb-4" />
                <p className="text-slate-500 text-sm">Configure parameters and generate CAPTCHA samples</p>
                <p className="text-slate-600 text-xs mt-2">Samples will appear here for preview and download</p>
                <button onClick={() => handleGenerate(4)} className="mt-6 btn-primary text-sm">
                  <Play className="w-4 h-4" /> Quick Generate ×4
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-[600px] overflow-y-auto no-scrollbar">
                <AnimatePresence>
                  {generated.map((g, i) => (
                    <motion.div key={g.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                      className="group relative rounded-xl overflow-hidden border border-white/[0.06] hover:border-cyan-400/20 transition-colors">
                      <img src={g.canvas} alt={`Generated ${i}`} className="w-full h-24 object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <a href={g.canvas} download={`captchaiq_${config.kind}_${i}.png`}
                          className="btn-primary text-xs py-1.5 px-3">
                          <Download className="w-3 h-3" /> Save
                        </a>
                      </div>
                      {config.includeLabels && g.label && g.label !== "slider" && (
                        <div className="absolute bottom-0 inset-x-0 bg-black/70 px-2 py-1 text-[10px] font-mono text-cyan-400">
                          label: "{g.label}"
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Dataset Stats */}
          {batchCount > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 glass-card p-4 grid grid-cols-4 gap-4">
              {[
                { label: "Generated", value: batchCount },
                { label: "Type", value: config.kind.toUpperCase() },
                { label: "Distortion", value: `${config.distortionLevel}%` },
                { label: "Format", value: config.exportFormat.toUpperCase() },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-lg font-black text-white">{s.value}</div>
                  <div className="text-[10px] text-slate-600">{s.label}</div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
