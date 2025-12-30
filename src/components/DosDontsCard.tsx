import { motion } from "framer-motion";
import { StyleGuide } from "@/types/style";
import { CheckCircle2, XCircle } from "lucide-react";

interface DosDontsCardProps {
  guide: StyleGuide;
}

export function DosDontsCard({ guide }: DosDontsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="surface-elevated rounded-xl p-6"
    >
      <h3 className="text-sm font-semibold text-foreground mb-5">Style Guide: Do's & Don'ts</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="text-sm font-semibold text-green-400">Do</span>
          </div>
          <ul className="space-y-2.5">
            {guide.doList.map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                className="flex items-start gap-2.5 text-sm text-secondary-foreground"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                {item}
              </motion.li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 text-red-400" />
            <span className="text-sm font-semibold text-red-400">Don't</span>
          </div>
          <ul className="space-y-2.5">
            {guide.dontList.map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.35 + index * 0.05 }}
                className="flex items-start gap-2.5 text-sm text-secondary-foreground"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                {item}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
