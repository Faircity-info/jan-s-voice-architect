import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Save, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Creator {
  id: string;
  name: string;
}

interface ContentEntry {
  id: string;
  content: string;
  platform: string;
  created_at: string;
}

interface Props {
  creator: Creator;
  onClose: () => void;
  onSave: () => void;
}

export const CreatorContentEditor = ({ creator, onClose, onSave }: Props) => {
  const [entries, setEntries] = useState<ContentEntry[]>([]);
  const [newContent, setNewContent] = useState("");
  const [platform, setPlatform] = useState("YouTube");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEntries();
  }, [creator.id]);

  const fetchEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("creator_content")
      .select("id, content, platform, created_at")
      .eq("creator_id", creator.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching content:", error);
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newContent.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase.from("creator_content").insert({
        creator_id: creator.id,
        content: newContent.trim(),
        platform,
      });

      if (error) throw error;

      toast({ title: "Content added" });
      setNewContent("");
      fetchEntries();
      onSave();
    } catch (error) {
      console.error("Error adding content:", error);
      toast({
        title: "Error",
        description: "Failed to add content",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("creator_content")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Content deleted" });
      fetchEntries();
      onSave();
    } catch (error) {
      console.error("Error deleting content:", error);
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive",
      });
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
              Add posts, tweets, transcripts to creator_content table
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add New Content */}
        <div className="p-6 border-b border-border space-y-3">
          <div className="flex items-center gap-3">
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="px-3 py-2 rounded-lg bg-muted/30 border border-border text-sm"
            >
              <option value="YouTube">YouTube</option>
              <option value="X">X / Twitter</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Podcast">Podcast</option>
              <option value="Other">Other</option>
            </select>
            <button
              onClick={handleAdd}
              disabled={saving || !newContent.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-sm disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {saving ? "Adding..." : "Add Content"}
            </button>
          </div>
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full h-32 px-4 py-3 rounded-lg bg-muted/30 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none font-mono text-sm"
            placeholder="Paste content here - tweets, LinkedIn posts, podcast transcripts, YouTube summaries, etc."
          />
        </div>

        {/* Existing Entries */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground">
            Existing Content ({entries.length})
          </h4>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No content yet. Add some above or send via endpoint.
            </p>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-lg bg-muted/20 border border-border group"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-xs rounded bg-primary/10 text-primary">
                      {entry.platform}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-foreground/80 line-clamp-4 font-mono">
                  {entry.content.substring(0, 500)}
                  {entry.content.length > 500 && "..."}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {entry.content.length.toLocaleString()} characters
                </p>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
