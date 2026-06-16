import React from "react";
import { Zap } from "lucide-react";
import { motion } from "motion/react";
import { GlassButton } from "@/components/ui/apple-tahoe-liquid-glass-button";

export default function GlassButtonDemo() {
  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-cover bg-center p-8"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80')",
      }}
    >
      <div className="absolute inset-0 bg-zinc-950/45" />
      <motion.div
        className="relative z-10"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <GlassButton size="lg" intensity="strong" contentClassName="gap-2">
          Generate
          <Zap className="h-5 w-5" />
        </GlassButton>
      </motion.div>
    </div>
  );
}
