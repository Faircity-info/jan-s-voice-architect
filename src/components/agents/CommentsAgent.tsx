import { useState } from "react";
import { motion } from "framer-motion";
import { MessagesSquare, Sparkles, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const STYLE_OPTIONS = ["Add value", "Share experience", "Ask question", "Offer perspective", "Support & amplify"];

export const CommentsAgent = () => {
  const [postContent, setPostContent] = useState("");
  const [postUrl, setPostUrl] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("Add value");
  const [angle, setAngle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedComment, setGeneratedComment] = useState("");

  const handleGenerate = async () => {
    if (!postContent.trim()) {
      toast.error("Please enter the post content");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Fetch active style guide
      const { data: styleGuideData } = await supabase
        .from("style_guide")
        .select("content")
        .eq("is_active", true)
        .single();

      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: {
          type: "comment",
          postContent: postContent,
          style: selectedStyle,
          angle: angle,
          styleGuide: styleGuideData?.content || undefined,
        },
      });

      if (error) throw error;

      setGeneratedComment(data.content);
      toast.success("Comment generated!");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate comment");
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
          <MessagesSquare className="w-5 h-5 text-primary" />
          Proactive Comments
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Paste a post from someone you want to engage with. The agent will generate a valuable, 
          insightful comment that adds to the conversation and showcases your expertise.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Post content</label>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
              placeholder="Paste the post you want to comment on..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              Post URL
              <span className="text-xs text-muted-foreground">(optional)</span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 rounded-lg bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="https://..."
              />
              {postUrl && (
                <a
                  href={postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Comment style</label>
            <div className="flex flex-wrap gap-2">
              {STYLE_OPTIONS.map((style) => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${
                    selectedStyle === style
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/50 text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Your angle (optional)</label>
            <input
              type="text"
              value={angle}
              onChange={(e) => setAngle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="e.g. 'Connect this to AI' or 'Share my startup experience'"
            />
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
            {isGenerating ? "Generating..." : "Generate Comment"}
          </button>

          {generatedComment && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-primary/5 border border-primary/20"
            >
              <h4 className="font-medium mb-2">Generated Comment</h4>
              <p className="text-sm whitespace-pre-wrap">{generatedComment}</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
