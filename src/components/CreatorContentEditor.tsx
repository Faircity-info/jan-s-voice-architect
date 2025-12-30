import { useState } from "react";
import { motion } from "framer-motion";
import { X, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Creator {
  id: string;
  name: string;
  content_notes: string | null;
}

interface Props {
  creator: Creator;
  onClose: () => void;
  onSave: () => void;
}

export const CreatorContentEditor = ({ creator, onClose, onSave }: Props) => {
  const [content, setContent] = useState(creator.content_notes || "");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("reference_creators")
        .update({ content_notes: content || null })
        .eq("id", creator.id);

      if (error) throw error;

      toast({ title: "Content saved" });
      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving content:", error);
      toast({
        title: "Error",
        description: "Failed to save content",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-4xl max-h-[85vh] overflow-hidden bg-card border border-border rounded-2xl shadow-xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold">{creator.name}</h3>
            <p className="text-sm text-muted-foreground">
              Paste their posts, tweets, transcripts, etc.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-hidden">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full min-h-[400px] px-4 py-3 rounded-lg bg-muted/30 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none font-mono text-sm"
            placeholder="Paste content here - tweets, LinkedIn posts, podcast transcripts, YouTube descriptions, etc. This will be used as reference material for content generation."
          />
        </div>
      </motion.div>
    </motion.div>
  );
};
