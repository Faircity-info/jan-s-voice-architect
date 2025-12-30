import { motion } from "framer-motion";
import { useState } from "react";
import { Plus, Linkedin, Twitter, Youtube, Globe, X } from "lucide-react";
import { ReferenceCreator } from "@/types/style";

interface AddCreatorFormProps {
  onAdd: (creator: Omit<ReferenceCreator, "id" | "analyzed" | "styleProfile">) => void;
  onClose: () => void;
}

const platforms = [
  { value: "LinkedIn", icon: Linkedin, color: "text-blue-400" },
  { value: "X", icon: Twitter, color: "text-foreground" },
  { value: "YouTube", icon: Youtube, color: "text-red-400" },
  { value: "Blog", icon: Globe, color: "text-green-400" },
] as const;

export function AddCreatorForm({ onAdd, onClose }: AddCreatorFormProps) {
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState<ReferenceCreator["platform"]>("LinkedIn");
  const [links, setLinks] = useState("");
  const [reasonWhy, setReasonWhy] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !links.trim()) return;
    
    onAdd({
      name: name.trim(),
      platform,
      links: links.split("\n").map((l) => l.trim()).filter(Boolean),
      reasonWhy: reasonWhy.trim() || undefined,
    });
    
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="surface-elevated rounded-2xl p-6 w-full max-w-lg glow-primary"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Add Reference Creator</h2>
              <p className="text-xs text-muted-foreground">Analyze a new voice style</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">Creator Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Hormozi"
              className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">Platform</label>
            <div className="grid grid-cols-4 gap-2">
              {platforms.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPlatform(p.value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
                      platform === p.value
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-muted/30 border-border/50 text-muted-foreground hover:text-foreground hover:border-border"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${platform === p.value ? "text-primary" : p.color}`} />
                    <span className="text-xs font-medium">{p.value}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">
              Links to Posts/Videos <span className="text-dim">(one per line)</span>
            </label>
            <textarea
              value={links}
              onChange={(e) => setLinks(e.target.value)}
              placeholder="https://linkedin.com/in/username/posts/..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">
              Why do you like this style? <span className="text-dim">(optional)</span>
            </label>
            <textarea
              value={reasonWhy}
              onChange={(e) => setReasonWhy(e.target.value)}
              placeholder="What makes this creator's voice stand out to you?"
              rows={2}
              className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !links.trim()}
              className="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium"
            >
              Add & Analyze
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
