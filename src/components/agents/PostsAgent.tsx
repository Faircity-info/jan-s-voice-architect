import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Lightbulb, Sparkles } from "lucide-react";

type Mode = "weekly" | "adhoc";

export const PostsAgent = () => {
  const [mode, setMode] = useState<Mode>("weekly");
  const [adhocIdea, setAdhocIdea] = useState("");

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-xl border border-border/50 w-fit">
        <button
          onClick={() => setMode("weekly")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            mode === "weekly"
              ? "bg-primary text-primary-foreground shadow-lg"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Weekly Plan
        </button>
        <button
          onClick={() => setMode("adhoc")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            mode === "adhoc"
              ? "bg-primary text-primary-foreground shadow-lg"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          Ad-hoc Post
        </button>
      </div>

      {mode === "weekly" ? (
        <motion.div
          key="weekly"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Weekly Content Plan
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Generate a week's worth of posts. Each post will be tagged with its topic (AI, Mindset, Business, etc.) 
              and the agent will pull relevant content from matching reference creators.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">Platform</label>
                <select className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                  <option>LinkedIn</option>
                  <option>X / Twitter</option>
                  <option>Both</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Week Starting</label>
                <input
                  type="date"
                  className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Topics to cover this week</label>
              <div className="flex flex-wrap gap-2">
                {["AI", "Business", "Mindset", "Personal Brand", "Tech", "Startup"].map((topic) => (
                  <button
                    key={topic}
                    className="px-3 py-1.5 rounded-lg border border-border bg-muted/50 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-all"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            <button className="mt-6 flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium">
              <Sparkles className="w-4 h-4" />
              Generate Weekly Plan
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="adhoc"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="p-6 rounded-xl bg-card border border-border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              Ad-hoc Post
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Got an idea? Describe it and the agent will help you craft it into a polished post 
              using your style and relevant reference content.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your idea or topic</label>
                <textarea
                  value={adhocIdea}
                  onChange={(e) => setAdhocIdea(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                  placeholder="e.g. 'I want to write about how AI is changing how we learn new skills' or 'Thread about my journey from employee to founder'"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-2">Platform</label>
                  <select className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                    <option>LinkedIn</option>
                    <option>X / Twitter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Topic category</label>
                  <select className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                    <option>AI</option>
                    <option>Business</option>
                    <option>Mindset</option>
                    <option>Personal Brand</option>
                    <option>Tech</option>
                    <option>Startup</option>
                  </select>
                </div>
              </div>

              <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium">
                <Sparkles className="w-4 h-4" />
                Generate Post
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
