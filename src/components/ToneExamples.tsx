import { motion } from "framer-motion";
import { ToneExample } from "@/types/style";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface ToneExamplesProps {
  examples: ToneExample[];
}

export function ToneExamples({ examples }: ToneExamplesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="surface-elevated rounded-xl p-6"
    >
      <h3 className="text-sm font-semibold text-foreground mb-5">Tone Calibration Examples</h3>
      
      <div className="grid gap-4">
        {examples.map((example, index) => (
          <div
            key={index}
            className={`rounded-lg p-4 border ${
              example.type === "good"
                ? "bg-green-500/5 border-green-500/20"
                : "bg-red-500/5 border-red-500/20"
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              {example.type === "good" ? (
                <>
                  <ThumbsUp className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Good Example</span>
                </>
              ) : (
                <>
                  <ThumbsDown className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Bad Example</span>
                </>
              )}
            </div>
            
            <div className="font-mono text-sm text-foreground bg-background/50 rounded-lg p-4 mb-3 whitespace-pre-wrap leading-relaxed border border-border/30">
              {example.content}
            </div>
            
            <p className={`text-xs leading-relaxed ${
              example.type === "good" ? "text-green-400/80" : "text-red-400/80"
            }`}>
              {example.explanation}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
