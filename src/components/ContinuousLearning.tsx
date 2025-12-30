import { motion } from "framer-motion";
import { TrendingUp, AlertCircle, Lightbulb, ArrowRight } from "lucide-react";

interface LearningInsight {
  type: "strengthen" | "remove" | "experiment";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
}

const mockInsights: LearningInsight[] = [
  {
    type: "strengthen",
    title: "Short, punchy openers",
    description: "Posts starting with under 8 words get 40% more engagement",
    impact: "high"
  },
  {
    type: "remove",
    title: "Question endings",
    description: "Posts ending with questions underperform by 25% vs clear statements",
    impact: "medium"
  },
  {
    type: "experiment",
    title: "Personal vulnerability",
    description: "Limited data suggests failure stories resonate—cautiously test more",
    impact: "low"
  }
];

export function ContinuousLearning() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="surface-elevated rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Continuous Learning</h3>
          <p className="text-xs text-muted-foreground mt-1">Style optimization suggestions based on performance</p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-muted/50 text-muted-foreground">
          Awaiting data
        </span>
      </div>

      <div className="space-y-3">
        {mockInsights.map((insight, index) => (
          <InsightCard key={index} insight={insight} index={index} />
        ))}
      </div>

      <div className="mt-5 p-4 rounded-lg bg-muted/20 border border-border/30">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Suggestions require human approval before modifying the style system. 
              No automatic changes will be made to preserve voice authenticity.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function InsightCard({ insight, index }: { insight: LearningInsight; index: number }) {
  const typeConfig = {
    strengthen: {
      icon: TrendingUp,
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
      label: "Strengthen"
    },
    remove: {
      icon: AlertCircle,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      label: "Remove"
    },
    experiment: {
      icon: Lightbulb,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      label: "Experiment"
    }
  };

  const config = typeConfig[insight.type];
  const Icon = config.icon;

  const impactColors = {
    high: "bg-green-500/20 text-green-400",
    medium: "bg-amber-500/20 text-amber-400",
    low: "bg-muted text-muted-foreground"
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
      className={`p-4 rounded-lg border ${config.bg} ${config.border}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-lg ${config.bg} border ${config.border} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-4 h-4 ${config.color}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${impactColors[insight.impact]}`}>
                {insight.impact} impact
              </span>
            </div>
            <h4 className="text-sm font-medium text-foreground">{insight.title}</h4>
            <p className="text-xs text-secondary-foreground mt-1">{insight.description}</p>
          </div>
        </div>
        
        <button className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all">
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
