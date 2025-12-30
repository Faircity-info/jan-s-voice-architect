import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Save, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function StyleGuideEditor() {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [version, setVersion] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    loadStyleGuide();
  }, []);

  const loadStyleGuide = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("style_guide")
      .select("*")
      .eq("is_active", true)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error loading style guide:", error);
      toast({
        title: "Error loading style guide",
        description: error.message,
        variant: "destructive",
      });
    } else if (data) {
      setContent(data.content);
      setVersion(data.version);
      setLastSaved(new Date(data.updated_at));
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Check if we have an existing record
    const { data: existing } = await supabase
      .from("style_guide")
      .select("id")
      .eq("is_active", true)
      .maybeSingle();

    let error;
    if (existing) {
      // Update existing
      const result = await supabase
        .from("style_guide")
        .update({ content, version: version + 1 })
        .eq("id", existing.id);
      error = result.error;
      if (!error) setVersion(version + 1);
    } else {
      // Insert new
      const result = await supabase
        .from("style_guide")
        .insert({ content, version: 1, is_active: true });
      error = result.error;
    }

    if (error) {
      console.error("Error saving style guide:", error);
      toast({
        title: "Error saving",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setLastSaved(new Date());
      toast({
        title: "Style guide saved",
        description: `Version ${existing ? version + 1 : 1} saved successfully.`,
      });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="surface-elevated rounded-xl p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="surface-elevated rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Style Guide Document</h3>
            <p className="text-xs text-muted-foreground">
              Version {version} {lastSaved && `• Last saved ${lastSaved.toLocaleTimeString()}`}
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-sm font-medium disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save
        </button>
      </div>

      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste your communication style document here..."
          className="w-full h-96 p-4 rounded-lg bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 text-sm leading-relaxed"
        />
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        This document defines your communication style and serves as the primary reference for all content generation agents.
      </p>
    </motion.div>
  );
}
