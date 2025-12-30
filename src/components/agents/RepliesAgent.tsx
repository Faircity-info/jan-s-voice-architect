import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const TONE_OPTIONS = ["Friendly", "Professional", "Thoughtful", "Witty", "Direct"];

export const RepliesAgent = () => {
  const [comment, setComment] = useState("");
  const [context, setContext] = useState("");
  const [selectedTone, setSelectedTone] = useState("Thoughtful");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReply, setGeneratedReply] = useState("");

  const handleGenerate = async () => {
    if (!comment.trim()) {
      toast.error("Please enter a comment to reply to");
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: {
          type: "reply",
          comment: comment,
          context: context,
          tone: selectedTone.toLowerCase(),
        },
      });

      if (error) throw error;

      setGeneratedReply(data.content);
      toast.success("Reply generated!");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate reply");
    } finally {
      setIsGenerating(false);
    }
  };

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
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
              placeholder="What was your original post about? Any specific angle for the reply?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tone</label>
            <div className="flex flex-wrap gap-2">
              {TONE_OPTIONS.map((tone) => (
                <button
                  key={tone}
                  onClick={() => setSelectedTone(tone)}
                  className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${
                    selectedTone === tone
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/50 text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isGenerating ? "Generating..." : "Generate Reply"}
          </button>

          {generatedReply && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-primary/5 border border-primary/20"
            >
              <h4 className="font-medium mb-2">Generated Reply</h4>
              <p className="text-sm whitespace-pre-wrap">{generatedReply}</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
