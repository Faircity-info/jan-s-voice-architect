import { motion } from "framer-motion";
import { StyleGuideEditor } from "./StyleGuideEditor";
import { HistoricalPostsManager } from "./HistoricalPostsManager";

export function JansContentSection() {
  return (
    <motion.div
      key="jans-content"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid lg:grid-cols-2 gap-6">
        <StyleGuideEditor />
        <HistoricalPostsManager />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20"
      >
        <p className="text-sm text-secondary-foreground">
          <strong className="text-primary">Learning Loop:</strong> Your style guide and historical posts form the foundation of the Style Object. 
          As you add feedback to generated posts, the system will propose style optimizations to continuously improve your unique voice.
        </p>
      </motion.div>
    </motion.div>
  );
}
