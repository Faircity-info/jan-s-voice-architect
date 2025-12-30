import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Youtube, Instagram, Linkedin, Twitter, Podcast, Trash2, Edit2, Check, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreatorContentManager } from "./CreatorContentManager";

interface ReferenceCreator {
  id: string;
  name: string;
  youtube: boolean;
  instagram: boolean;
  linkedin: boolean;
  x_twitter: boolean;
  spotify: boolean;
  field: string[] | null;
  priority: string | null;
  notes: string | null;
  analyzed: boolean;
  style_profile: any;
}

// Standardized fields for multi-select
const FIELD_OPTIONS = [
  { value: "AI", label: "AI" },
  { value: "Business", label: "Business" },
  { value: "Personal Brand", label: "Personal Brand" },
  { value: "Mindset", label: "Mindset" },
  { value: "Tech", label: "Tech" },
  { value: "Startup", label: "Startup" },
  { value: "Education", label: "Education" },
];

const priorityColors: Record<string, string> = {
  "VELMI VYSOKÁ": "bg-red-500/20 text-red-400 border-red-500/30",
  "Vysoká": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "Střední": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "Nízká": "bg-muted text-muted-foreground border-border",
};

const PlatformIcon = ({ platform, active }: { platform: string; active: boolean }) => {
  const iconProps = {
    className: `w-4 h-4 ${active ? "text-primary" : "text-muted-foreground/30"}`,
  };
  
  switch (platform) {
    case "youtube": return <Youtube {...iconProps} />;
    case "instagram": return <Instagram {...iconProps} />;
    case "linkedin": return <Linkedin {...iconProps} />;
    case "x_twitter": return <Twitter {...iconProps} />;
    case "spotify": return <Podcast {...iconProps} />;
    default: return null;
  }
};

export const ReferenceCreatorsManager = () => {
  const [creators, setCreators] = useState<ReferenceCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [contentManagerCreator, setContentManagerCreator] = useState<ReferenceCreator | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    youtube: false,
    instagram: false,
    linkedin: false,
    x_twitter: false,
    spotify: false,
    fields: [] as string[],
    priority: "Střední" as string,
    notes: "",
  });

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      const { data, error } = await supabase
        .from("reference_creators")
        .select("*")
        .order("priority", { ascending: true })
        .order("name");

      if (error) throw error;
      setCreators(data || []);
    } catch (error) {
      console.error("Error fetching creators:", error);
      toast({
        title: "Chyba",
        description: "Nepodařilo se načíst tvůrce",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({ title: "Vyplň jméno", variant: "destructive" });
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from("reference_creators")
          .update({
            name: formData.name,
            youtube: formData.youtube,
            instagram: formData.instagram,
            linkedin: formData.linkedin,
            x_twitter: formData.x_twitter,
            spotify: formData.spotify,
            field: formData.fields.length > 0 ? formData.fields : null,
            priority: formData.priority,
            notes: formData.notes || null,
          })
          .eq("id", editingId);

        if (error) throw error;
        toast({ title: "Tvůrce aktualizován" });
      } else {
        const { error } = await supabase
          .from("reference_creators")
          .insert({
            name: formData.name,
            youtube: formData.youtube,
            instagram: formData.instagram,
            linkedin: formData.linkedin,
            x_twitter: formData.x_twitter,
            spotify: formData.spotify,
            field: formData.fields.length > 0 ? formData.fields : null,
            priority: formData.priority,
            notes: formData.notes || null,
          });

        if (error) throw error;
        toast({ title: "Tvůrce přidán" });
      }

      resetForm();
      fetchCreators();
    } catch (error) {
      console.error("Error saving creator:", error);
      toast({
        title: "Chyba",
        description: "Nepodařilo se uložit tvůrce",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (creator: ReferenceCreator) => {
    setFormData({
      name: creator.name,
      youtube: creator.youtube,
      instagram: creator.instagram,
      linkedin: creator.linkedin,
      x_twitter: creator.x_twitter,
      spotify: creator.spotify,
      fields: creator.field || [],
      priority: creator.priority || "Střední",
      notes: creator.notes || "",
    });
    setEditingId(creator.id);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("reference_creators")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Tvůrce smazán" });
      fetchCreators();
    } catch (error) {
      console.error("Error deleting creator:", error);
      toast({
        title: "Chyba",
        description: "Nepodařilo se smazat tvůrce",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      youtube: false,
      instagram: false,
      linkedin: false,
      x_twitter: false,
      spotify: false,
      fields: [],
      priority: "Střední",
      notes: "",
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const toggleField = (fieldValue: string) => {
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.includes(fieldValue)
        ? prev.fields.filter((f) => f !== fieldValue)
        : [...prev.fields, fieldValue],
    }));
  };

  const groupedByPriority = creators.reduce((acc, creator) => {
    const priority = creator.priority || "Nízká";
    if (!acc[priority]) acc[priority] = [];
    acc[priority].push(creator);
    return acc;
  }, {} as Record<string, ReferenceCreator[]>);

  const priorityOrder = ["VELMI VYSOKÁ", "Vysoká", "Střední", "Nízká"];

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted/50 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Influenceři & Tvůrci</h2>
          <p className="text-sm text-muted-foreground">
            {creators.length} tvůrců ke sledování
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Přidat tvůrce
        </button>
      </div>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && resetForm()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  {editingId ? "Upravit tvůrce" : "Přidat tvůrce"}
                </h3>
                <button onClick={resetForm} className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Jméno / Organizace *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="např. Alex Hormozi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Platformy</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: "youtube", label: "YouTube", icon: Youtube },
                      { key: "instagram", label: "Instagram", icon: Instagram },
                      { key: "linkedin", label: "LinkedIn", icon: Linkedin },
                      { key: "x_twitter", label: "X/Twitter", icon: Twitter },
                      { key: "spotify", label: "Spotify", icon: Podcast },
                    ].map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData({ ...formData, [key]: !formData[key as keyof typeof formData] })}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm ${
                          formData[key as keyof typeof formData]
                            ? "bg-primary/20 border-primary text-primary"
                            : "bg-muted/50 border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Obory</label>
                  <div className="flex flex-wrap gap-2">
                    {FIELD_OPTIONS.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggleField(value)}
                        className={`px-3 py-1.5 rounded-lg border transition-all text-sm ${
                          formData.fields.includes(value)
                            ? "bg-primary/20 border-primary text-primary"
                            : "bg-muted/50 border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Priorita</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  >
                    <option value="VELMI VYSOKÁ">VELMI VYSOKÁ</option>
                    <option value="Vysoká">Vysoká</option>
                    <option value="Střední">Střední</option>
                    <option value="Nízká">Nízká</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Poznámky</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                    placeholder="Proč ho sleduješ, co z něj čerpat..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-border hover:bg-muted transition-all text-sm"
                  >
                    Zrušit
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    {editingId ? "Uložit změny" : "Přidat"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grouped by Priority */}
      <div className="space-y-6">
        {priorityOrder.map((priority) => {
          const items = groupedByPriority[priority];
          if (!items || items.length === 0) return null;

          return (
            <div key={priority}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${priorityColors[priority]}`}>
                  {priority}
                </span>
                <span className="text-xs text-muted-foreground">({items.length})</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((creator, index) => (
                  <motion.div
                    key={creator.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-foreground">{creator.name}</h3>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setContentManagerCreator(creator)}
                          className="p-1.5 rounded-lg hover:bg-primary/20 transition-colors"
                          title="Spravovat obsah"
                        >
                          <FileText className="w-3.5 h-3.5 text-primary" />
                        </button>
                        <button
                          onClick={() => handleEdit(creator)}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDelete(creator.id)}
                          className="p-1.5 rounded-lg hover:bg-destructive/20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      </div>
                    </div>

                    {creator.field && creator.field.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {creator.field.map((f) => (
                          <span key={f} className="px-1.5 py-0.5 rounded text-[10px] bg-accent text-accent-foreground">
                            {f}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mb-2">
                      {(["youtube", "instagram", "linkedin", "x_twitter", "spotify"] as const).map((platform) => (
                        <PlatformIcon
                          key={platform}
                          platform={platform}
                          active={creator[platform]}
                        />
                      ))}
                    </div>

                    {creator.notes && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{creator.notes}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {creators.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>Zatím nemáš žádné tvůrce</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-2 text-primary hover:underline text-sm"
          >
            Přidej prvního tvůrce
          </button>
        </div>
      )}

      {/* Content Manager Modal */}
      <AnimatePresence>
        {contentManagerCreator && (
          <CreatorContentManager
            creatorId={contentManagerCreator.id}
            creatorName={contentManagerCreator.name}
            onClose={() => setContentManagerCreator(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
