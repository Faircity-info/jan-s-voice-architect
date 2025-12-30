import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Sparkles } from "lucide-react";

export const RepliesAgent = () => {
  const [comment, setComment] = useState("");

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-xl bg-card border border-border"
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Reply to Comments
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Paste a comment someone left on your post. The agent will generate a thoughtful reply 
          that matches your voice and style.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">The comment to reply to</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
              placeholder="Paste the comment here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Context (optional)</label>
            <textarea
              rows={2}
              className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
              placeholder="What was your original post about? Any specific angle for the reply?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tone</label>
            <div className="flex flex-wrap gap-2">
              {["Friendly", "Professional", "Thoughtful", "Witty", "Direct"].map((tone) => (
                <button
                  key={tone}
                  className="px-3 py-1.5 rounded-lg border border-border bg-muted/50 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-all"
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium">
            <Sparkles className="w-4 h-4" />
            Generate Reply
          </button>
        </div>
      </motion.div>
    </div>
  );
};
