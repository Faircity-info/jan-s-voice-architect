import { motion } from "framer-motion";
import { StyleRules } from "@/types/style";
import { Check, Minus, X } from "lucide-react";

interface StyleRulesCardProps {
  rules: StyleRules;
}

export function StyleRulesCard({ rules }: StyleRulesCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="surface-elevated rounded-xl p-6"
    >
      <h3 className="text-sm font-semibold text-foreground mb-5">Style Rules</h3>
      
      <div className="space-y-5">
        <RuleSection
          icon={<Check className="w-3.5 h-3.5" />}
          label="Always"
          items={rules.always}
          color="green"
        />
        <RuleSection
          icon={<Minus className="w-3.5 h-3.5" />}
          label="Sometimes"
          items={rules.sometimes}
          color="amber"
        />
        <RuleSection
          icon={<X className="w-3.5 h-3.5" />}
          label="Never"
          items={rules.never}
          color="red"
        />
      </div>
    </motion.div>
  );
}

function RuleSection({
  icon,
  label,
  items,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  items: string[];
  color: "green" | "amber" | "red";
}) {
  const colorClasses = {
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <div>
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border mb-3 ${colorClasses[color]}`}>
        {icon}
        {label}
      </div>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
            className="text-sm text-secondary-foreground pl-3 border-l-2 border-border/50"
          >
            {item}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
