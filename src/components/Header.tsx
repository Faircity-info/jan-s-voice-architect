import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border-b border-border/50 surface-glass sticky top-0 z-50"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center glow-primary">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Style Agent</h1>
              <p className="text-xs text-muted-foreground">Voice Architecture System</p>
            </div>
          </div>
          
          {/* Navigation moved to main tabs */}
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">
              v1.0
            </span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-accent flex items-center justify-center text-primary-foreground text-sm font-semibold">
              JK
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
