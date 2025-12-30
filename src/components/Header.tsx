import { motion } from "framer-motion";
import { Zap, Target, Users, PenTool } from "lucide-react";

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
          
          <nav className="hidden md:flex items-center gap-1">
            <NavItem icon={<Target className="w-4 h-4" />} label="Analyze" active />
            <NavItem icon={<Users className="w-4 h-4" />} label="Creators" />
            <NavItem icon={<PenTool className="w-4 h-4" />} label="Manifesto" />
          </nav>
          
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

function NavItem({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
        active
          ? "bg-primary/10 text-primary border border-primary/20"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
