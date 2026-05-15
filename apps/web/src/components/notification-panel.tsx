"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, XCircle, AlertCircle, Brain, Info } from "lucide-react";

export type Notification = {
  id: string;
  type: "success" | "error" | "warning" | "info" | "ai";
  title: string;
  body: string;
  time: string;
  read: boolean;
};

const mockNotifications: Notification[] = [
  { id: "1", type: "ai", title: "Model retrained", body: "OCR v3 accuracy improved to 91.7% after 142 corrections.", time: "2m ago", read: false },
  { id: "2", type: "success", title: "Analysis complete", body: "Image challenge classified with 97.3% confidence.", time: "5m ago", read: false },
  { id: "3", type: "warning", title: "Confidence below threshold", body: "Audio challenge fell back to secondary model.", time: "12m ago", read: true },
  { id: "4", type: "info", title: "Training job queued", body: "Weekly retraining scheduled for Sunday 02:00 UTC.", time: "1h ago", read: true },
  { id: "5", type: "error", title: "Pipeline error", body: "Slider analysis failed — connection timeout.", time: "2h ago", read: true },
];

const typeConfig = {
  success: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  error: { icon: XCircle, color: "text-red-400", bg: "bg-red-400/10" },
  warning: { icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-400/10" },
  info: { icon: Info, color: "text-cyan-400", bg: "bg-cyan-400/10" },
  ai: { icon: Brain, color: "text-violet-400", bg: "bg-violet-400/10" },
};

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState(mockNotifications);
  const unread = notifications.filter((n) => !n.read).length;

  const markAllRead = () => setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
  const dismiss = (id: string) => setNotifications((ns) => ns.filter((n) => n.id !== id));

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 z-50 rounded-xl border border-white/[0.08] overflow-hidden"
            style={{ background: "rgba(10,18,38,0.98)", backdropFilter: "blur(24px)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">Notifications</span>
                {unread > 0 && (
                  <span className="text-[10px] font-bold bg-cyan-400 text-black rounded-full w-4 h-4 flex items-center justify-center">{unread}</span>
                )}
              </div>
              <button onClick={markAllRead} className="text-[10px] text-cyan-400 hover:underline">Mark all read</button>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto no-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-slate-600 text-sm">No notifications</div>
              ) : (
                notifications.map((n) => {
                  const cfg = typeConfig[n.type];
                  return (
                    <div key={n.id} className={`flex gap-3 px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${!n.read ? "bg-white/[0.01]" : ""}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg}`}>
                        <cfg.icon className={`w-4 h-4 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-semibold ${!n.read ? "text-white" : "text-slate-300"}`}>{n.title}</p>
                          <button onClick={() => dismiss(n.id)} className="text-slate-600 hover:text-slate-400 shrink-0">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{n.body}</p>
                        <p className="text-[10px] text-slate-700 mt-1">{n.time}</p>
                      </div>
                      {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />}
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-4 py-2.5 border-t border-white/[0.04]">
              <button className="text-xs text-slate-500 hover:text-slate-300 transition-colors">View all notifications</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
