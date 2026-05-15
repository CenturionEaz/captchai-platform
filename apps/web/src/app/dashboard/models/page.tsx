"use client";

import { motion } from "framer-motion";
import { GitBranch, CheckCircle2, Clock, Download, ExternalLink, Cpu, BarChart2, Star } from "lucide-react";

const models = [
  {
    id: "captchaiq-vision-v2",
    name: "CaptchaIQ Vision v2",
    type: "Image Classification",
    status: "production",
    accuracy: 94.2,
    size: "287 MB",
    updated: "2h ago",
    uses: 18291,
    description: "Multi-scale CNN for image grid challenge classification. Fine-tuned on diverse CAPTCHA datasets.",
    tags: ["image", "classification", "cnn"],
  },
  {
    id: "captchaiq-ocr-v3",
    name: "CaptchaIQ OCR v3",
    type: "Text Recognition",
    status: "production",
    accuracy: 91.7,
    size: "142 MB",
    updated: "1d ago",
    uses: 9842,
    description: "Tesseract-enhanced OCR with custom preprocessing for heavily distorted CAPTCHA text.",
    tags: ["ocr", "text", "tesseract"],
  },
  {
    id: "captchaiq-audio-v1",
    name: "CaptchaIQ Audio v1",
    type: "Audio Transcription",
    status: "beta",
    accuracy: 87.3,
    size: "1.2 GB",
    updated: "3d ago",
    uses: 2341,
    description: "Whisper-based audio CAPTCHA transcription with noise reduction preprocessing.",
    tags: ["audio", "whisper", "transcription"],
  },
  {
    id: "captchaiq-slider-v1",
    name: "CaptchaIQ Slider v1",
    type: "Visual Analysis",
    status: "production",
    accuracy: 96.1,
    size: "48 MB",
    updated: "5d ago",
    uses: 6721,
    description: "OpenCV-based slider gap detection using edge detection and template matching.",
    tags: ["slider", "opencv", "vision"],
  },
  {
    id: "captchaiq-detector-v1",
    name: "CaptchaIQ Detector v1",
    type: "Challenge Detection",
    status: "production",
    accuracy: 98.4,
    size: "32 MB",
    updated: "1w ago",
    uses: 28441,
    description: "Multi-class classifier for automatic CAPTCHA challenge type identification.",
    tags: ["detection", "classifier", "routing"],
  },
  {
    id: "captchaiq-behavioral-v1",
    name: "CaptchaIQ Behavioral v1",
    type: "Behavioral Analysis",
    status: "experimental",
    accuracy: 79.2,
    size: "95 MB",
    updated: "2w ago",
    uses: 441,
    description: "Research model for analyzing mouse movement and behavioral CAPTCHA patterns.",
    tags: ["behavioral", "research", "experimental"],
  },
];

const statusBadge: Record<string, string> = {
  production: "badge-green",
  beta: "badge-cyan",
  experimental: "badge-orange",
};

export default function ModelsPage() {
  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Model Registry</h1>
          <p className="text-sm text-slate-500 mt-0.5">All AI models in the CaptchaIQ pipeline</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge-purple">{models.length} Models</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {models.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-card p-5 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-white">{m.name}</h3>
                  <span className={`${statusBadge[m.status]} text-[10px]`}>{m.status.toUpperCase()}</span>
                </div>
                <p className="text-xs text-slate-500">{m.type}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center">
                <Cpu className="w-4 h-4 text-slate-400" />
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">{m.description}</p>

            {/* Accuracy Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Accuracy</span>
                <span className="text-white font-semibold">{m.accuracy}%</span>
              </div>
              <div className="confidence-bar">
                <motion.div
                  className="confidence-bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${m.accuracy}%` }}
                  transition={{ duration: 0.8, delay: i * 0.06 }}
                />
              </div>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 text-[10px] text-slate-500 mb-4">
              <span>{m.size}</span>
              <span>·</span>
              <span>{m.uses.toLocaleString()} uses</span>
              <span>·</span>
              <span>Updated {m.updated}</span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {m.tags.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-white/[0.04] border border-white/[0.06]">{t}</span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-white/[0.04]">
              <button className="btn-ghost text-xs py-1 px-2 flex-1 justify-center">
                <BarChart2 className="w-3 h-3" /> Benchmarks
              </button>
              <button className="btn-ghost text-xs py-1 px-2 flex-1 justify-center">
                <Download className="w-3 h-3" /> Export
              </button>
              <button className="btn-secondary text-xs py-1 px-3">
                Use Model
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
