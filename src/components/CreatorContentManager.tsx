import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Trash2, ExternalLink, Calendar, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreatorContent {
  id: string;
  creator_id: string;
  platform: string;
  content: string;
  source_url: string | null;
  posted_at: string | null;
  key_insights: string | null;
  created_at: string;
}

interface Props {
  creatorId: string;
  creatorName: string;
  onClose: () => void;
}

const platformOptions = ["X", "YouTube", "LinkedIn", "Instagram", "Spotify", "Podcast", "Blog"];

export const CreatorContentManager = ({ creatorId, creatorName, onClose }: Props) => {
  const [contents, setContents] = useState<CreatorContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    platform: "X",
    content: "",
    source_url: "",
    posted_at: "",
    key_insights: "",
  });

  useEffect(() => {
    fetchContents();
  }, [creatorId]);

  const fetchContents = async () => {
    try {
      const { data, error } = await supabase
        .from("creator_content")
        .select("*")
        .eq("creator_id", creatorId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContents(data || []);
    } catch (error) {
      console.error("Error fetching content:", error);
      toast({
        title: "Chyba",
        description: "Nepodařilo se načíst obsah",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.content.trim()) {
      toast({ title: "Vyplň obsah příspěvku", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("creator_content").insert({
        creator_id: creatorId,
        platform: formData.platform,
        content: formData.content,
        source_url: formData.source_url || null,
        posted_at: formData.posted_at || null,
        key_insights: formData.key_insights || null,
      });

      if (error) throw error;

      toast({ title: "Obsah přidán" });
      setFormData({
        platform: "X",
        content: "",
        source_url: "",
        posted_at: "",
        key_insights: "",
      });
      setShowAddForm(false);
      fetchContents();
    } catch (error) {
      console.error("Error adding content:", error);
      toast({
        title: "Chyba",
        description: "Nepodařilo se přidat obsah",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("creator_content").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Obsah smazán" });
      fetchContents();
    } catch (error) {
      console.error("Error deleting content:", error);
      toast({
        title: "Chyba",
        description: "Nepodařilo se smazat obsah",
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
        className="w-full max-w-3xl max-h-[85vh] overflow-hidden bg-card border border-border rounded-2xl shadow-xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold">{creatorName}</h3>
            <p className="text-sm text-muted-foreground">
              {contents.length} uložených příspěvků
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              Přidat obsah
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : contents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Žádný uložený obsah</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-2 text-primary hover:underline text-sm"
              >
                Přidej první příspěvek
              </button>
            </div>
          ) : (
            contents.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group p-4 rounded-xl bg-muted/30 border border-border hover:border-primary/30 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary">
                      {item.platform}
                    </span>
                    {item.posted_at && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.posted_at).toLocaleDateString("cs-CZ")}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.source_url && (
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-foreground whitespace-pre-wrap mb-2">
                  {item.content}
                </p>

                {item.key_insights && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Klíčové poznatky:</span> {item.key_insights}
                    </p>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Add Form Modal */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-card/95 backdrop-blur-sm flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="w-full max-w-lg"
              >
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Přidat nový obsah</h4>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Platforma</label>
                      <select
                        value={formData.platform}
                        onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      >
                        {platformOptions.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Datum příspěvku</label>
                      <input
                        type="date"
                        value={formData.posted_at}
                        onChange={(e) => setFormData({ ...formData, posted_at: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">URL zdroje</label>
                    <input
                      type="url"
                      value={formData.source_url}
                      onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Obsah příspěvku *</label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                      placeholder="Zkopíruj sem text příspěvku..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">Klíčové poznatky</label>
                    <textarea
                      value={formData.key_insights}
                      onChange={(e) => setFormData({ ...formData, key_insights: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                      placeholder="Co je z tohoto příspěvku nejdůležitější..."
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-border hover:bg-muted transition-all text-sm"
                    >
                      Zrušit
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-sm font-medium"
                    >
                      Uložit obsah
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
