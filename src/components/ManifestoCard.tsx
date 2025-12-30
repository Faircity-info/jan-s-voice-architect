import { motion } from "framer-motion";
import { VoiceManifesto } from "@/types/style";
import { Sparkles, FileText } from "lucide-react";

interface ManifestoCardProps {
  manifesto: VoiceManifesto;
}

export function ManifestoCard({ manifesto }: ManifestoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="surface-elevated rounded-xl p-6 glow-primary relative overflow-hidden"
    >
      {/* Gradient accent */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{manifesto.title}</h3>
            <p className="text-xs text-muted-foreground">Voice Manifesto</p>
          </div>
        </div>

        <blockquote className="text-base text-foreground leading-relaxed mb-6 pl-4 border-l-2 border-primary/50">
          {manifesto.coreVoice}
        </blockquote>

        <div className="mb-5">
          <h4 className="text-xs font-semibold text-dim uppercase tracking-wider mb-3">Key Principles</h4>
          <div className="grid gap-2">
            {manifesto.keyPrinciples.map((principle, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/30"
              >
                <span className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-mono text-primary flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <p className="text-sm text-secondary-foreground">{principle}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-muted/20 border border-border/30">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tone Guidelines</h4>
          </div>
          <p className="text-sm text-secondary-foreground leading-relaxed italic">
            {manifesto.toneGuidelines}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
