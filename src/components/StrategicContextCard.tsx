import { motion } from "framer-motion";
import { StrategicContext } from "@/types/style";
import { Target, Users, Sparkles } from "lucide-react";

interface StrategicContextCardProps {
  context: StrategicContext;
}

export function StrategicContextCard({ context }: StrategicContextCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="surface-elevated rounded-xl p-5"
    >
      <h3 className="text-sm font-semibold text-foreground mb-4">Strategic Context</h3>
      
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <span className="text-xs font-medium text-dim uppercase tracking-wider">Target Audience</span>
            <p className="text-sm text-secondary-foreground mt-1">{context.targetAudience}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Target className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <span className="text-xs font-medium text-dim uppercase tracking-wider">Brand Positioning</span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {context.brandPositioning.map((item) => (
                <span
                  key={item}
                  className="text-xs px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="text-xs font-medium text-dim uppercase tracking-wider">Desired Perception</span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {context.desiredPerception.map((item) => (
                <span
                  key={item}
                  className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
