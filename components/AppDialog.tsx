"use client";

import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

interface AppDialogProps { open: boolean; title: string; onClose: () => void; children: ReactNode; className?: string; }

export function AppDialog({ open, title, onClose, children, className = "" }: AppDialogProps) {
  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [onClose, open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="dialog-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
          <motion.section role="dialog" aria-modal="true" aria-labelledby="dialog-title" className={`app-dialog ${className}`} initial={{ opacity: 0, y: 18, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .98 }} transition={{ type: "spring", stiffness: 380, damping: 34 }}>
            <header><h2 id="dialog-title">{title}</h2><button onClick={onClose} aria-label="关闭"><X size={20} /></button></header>
            {children}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
