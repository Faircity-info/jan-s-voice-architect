import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Lightbulb, Sparkles, Upload, Save, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

type Mode = "weekly" | "adhoc";

interface ScheduleItem {
  platform: "linkedin" | "x" | "instagram" | "youtube";
  format: string;
  topic: "ai" | "business" | "lifestyle";
  description: string;
}

interface DaySchedule {
  day: "monday" | "wednesday" | "friday";
  theme: string;
  items: ScheduleItem[];
}

interface ContentSchedule {
  version: string;
  period: "weekly" | "biweekly";
  weeks: {
    week: 1 | 2;
    days: DaySchedule[];
  }[];
}

const EXAMPLE_SCHEDULE: ContentSchedule = {
  version: "1.0",
  period: "biweekly",
  weeks: [
    {
      week: 1,
      days: [
        {
          day: "monday",
          theme: "AI News & Insights",
          items: [
            { platform: "linkedin", format: "text", topic: "ai", description: "Short commentary on weekend AI news (OpenAI/Google updates)" },
            { platform: "x", format: "posts", topic: "ai", description: "2-3 punchy posts about AI news" }
          ]
        },
        {
          day: "wednesday",
          theme: "Expertise / How-to",
          items: [
            { platform: "linkedin", format: "carousel", topic: "business", description: "Carousel (5-7 slides) - practical workflow (e.g., 'How AI cleans my Excel data')" },
            { platform: "x", format: "thread", topic: "business", description: "Thread (5-7 tweets) - repurpose LinkedIn carousel" },
            { platform: "instagram", format: "reels", topic: "business", description: "Screen recording - automation demo with voiceover" }
          ]
        },
        {
          day: "friday",
          theme: "Lifestyle / Vision",
          items: [
            { platform: "linkedin", format: "photo+text", topic: "lifestyle", description: "Personal story - photo of Jan + text about how AI changed his work perspective" },
            { platform: "x", format: "hot-take", topic: "lifestyle", description: "One provocative opinion (e.g., 'In 2026, a CFO without AI skills will be unemployable')" },
            { platform: "instagram", format: "reels", topic: "lifestyle", description: "Talking head - 20s selfie video: 'This is my biggest lesson this week...'" }
          ]
        }
      ]
    },
    {
      week: 2,
      days: [
        {
          day: "monday",
          theme: "AI News & Insights",
          items: [
            { platform: "linkedin", format: "text", topic: "ai", description: "AI industry analysis or trend commentary" },
            { platform: "x", format: "posts", topic: "ai", description: "2-3 posts with insights on AI developments" }
          ]
        },
        {
          day: "wednesday",
          theme: "Expertise / How-to",
          items: [
            { platform: "linkedin", format: "carousel", topic: "business", description: "Carousel - business/productivity workflow with AI" },
            { platform: "x", format: "thread", topic: "business", description: "Thread - repurpose LinkedIn content" },
            { platform: "instagram", format: "reels", topic: "business", description: "Demo or tutorial reel" }
          ]
        },
        {
          day: "friday",
          theme: "Lifestyle / Vision",
          items: [
            { platform: "linkedin", format: "photo+text", topic: "lifestyle", description: "Behind-the-scenes or personal reflection" },
            { platform: "x", format: "hot-take", topic: "lifestyle", description: "Bold prediction or contrarian view" },
            { platform: "instagram", format: "reels", topic: "lifestyle", description: "Personal video message" }
          ]
        }
      ]
    }
  ]
};

const STORAGE_KEY = "content-schedule";

const PLATFORM_COLORS: Record<string, string> = {
  linkedin: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  x: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
  instagram: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  youtube: "bg-red-500/20 text-red-400 border-red-500/30",
};

const TOPIC_COLORS: Record<string, string> = {
  ai: "bg-emerald-500/20 text-emerald-400",
  business: "bg-amber-500/20 text-amber-400",
  lifestyle: "bg-purple-500/20 text-purple-400",
};

const DAY_NAMES: Record<string, string> = {
  monday: "Monday",
  wednesday: "Wednesday",
  friday: "Friday",
};

export const PostsAgent = () => {
  const [mode, setMode] = useState<Mode>("weekly");
  const [adhocIdea, setAdhocIdea] = useState("");
  const [schedule, setSchedule] = useState<ContentSchedule | null>(null);
  const [jsonInput, setJsonInput] = useState("");
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [currentWeek, setCurrentWeek] = useState<1 | 2>(1);
  const [selectedDay, setSelectedDay] = useState<DaySchedule | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSchedule(JSON.parse(saved));
      } catch {
        console.error("Failed to parse saved schedule");
      }
    }
  }, []);

  const handleLoadSchedule = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setSchedule(parsed);
      localStorage.setItem(STORAGE_KEY, jsonInput);
      setShowJsonEditor(false);
      toast.success("Schedule loaded successfully");
    } catch {
      toast.error("Invalid JSON format");
    }
  };

  const handleLoadExample = () => {
    const exampleJson = JSON.stringify(EXAMPLE_SCHEDULE, null, 2);
    setJsonInput(exampleJson);
  };

  const handleSaveSchedule = () => {
    if (schedule) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
      toast.success("Schedule saved");
    }
  };

  const currentWeekData = schedule?.weeks.find(w => w.week === currentWeek);

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
          Biweekly Plan
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
          {/* Schedule Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowJsonEditor(!showJsonEditor)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border hover:border-primary transition-all text-sm"
            >
              <Upload className="w-4 h-4" />
              {showJsonEditor ? "Hide Editor" : "Load Schedule JSON"}
            </button>
            {schedule && (
              <button
                onClick={handleSaveSchedule}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border hover:border-primary transition-all text-sm"
              >
                <Save className="w-4 h-4" />
                Save Schedule
              </button>
            )}
          </div>

          {/* JSON Editor */}
          {showJsonEditor && (
            <div className="p-4 rounded-xl bg-card border border-border space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Schedule JSON</h4>
                <button
                  onClick={handleLoadExample}
                  className="text-sm text-primary hover:underline"
                >
                  Load Example
                </button>
              </div>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none font-mono text-xs"
                placeholder="Paste your schedule JSON here..."
              />
              <button
                onClick={handleLoadSchedule}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-sm font-medium"
              >
                Load Schedule
              </button>
            </div>
          )}

          {/* Calendar View */}
          {schedule ? (
            <div className="space-y-4">
              {/* Week Selector */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
                <button
                  onClick={() => setCurrentWeek(1)}
                  disabled={currentWeek === 1}
                  className="p-2 rounded-lg hover:bg-muted/50 disabled:opacity-30 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-center">
                  <h3 className="font-semibold">Week {currentWeek}</h3>
                  <p className="text-sm text-muted-foreground">
                    {schedule.period === "biweekly" ? "Biweekly Schedule" : "Weekly Schedule"}
                  </p>
                </div>
                <button
                  onClick={() => setCurrentWeek(2)}
                  disabled={currentWeek === 2 || schedule.period !== "biweekly"}
                  className="p-2 rounded-lg hover:bg-muted/50 disabled:opacity-30 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Days Grid */}
              <div className="grid gap-4 md:grid-cols-3">
                {currentWeekData?.days.map((day) => (
                  <div
                    key={day.day}
                    className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all cursor-pointer"
                    onClick={() => setSelectedDay(day)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{DAY_NAMES[day.day]}</h4>
                      <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        {day.items.length} items
                      </span>
                    </div>
                    <p className="text-sm text-primary mb-3">{day.theme}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {day.items.map((item, idx) => (
                        <span
                          key={idx}
                          className={`text-xs px-2 py-0.5 rounded border ${PLATFORM_COLORS[item.platform]}`}
                        >
                          {item.platform}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Day Detail */}
              {selectedDay && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-xl bg-card border border-border"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{DAY_NAMES[selectedDay.day]}</h3>
                      <p className="text-sm text-primary">{selectedDay.theme}</p>
                    </div>
                    <button
                      onClick={() => setSelectedDay(null)}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Close
                    </button>
                  </div>

                  <div className="space-y-3">
                    {selectedDay.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg bg-muted/30 border border-border/50"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs px-2 py-0.5 rounded border ${PLATFORM_COLORS[item.platform]}`}>
                            {item.platform}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                            {item.format}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded ${TOPIC_COLORS[item.topic]}`}>
                            {item.topic}
                          </span>
                        </div>
                        <p className="text-sm">{item.description}</p>
                        <button className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all text-sm">
                          <Sparkles className="w-3 h-3" />
                          Generate
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-card border border-border border-dashed text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No Schedule Loaded</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Load a JSON schedule to see your content calendar
              </p>
              <button
                onClick={() => {
                  handleLoadExample();
                  setShowJsonEditor(true);
                }}
                className="text-sm text-primary hover:underline"
              >
                Load Example Schedule
              </button>
            </div>
          )}
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
                    <option>Instagram</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Topic category</label>
                  <select className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                    <option value="ai">AI</option>
                    <option value="business">Business</option>
                    <option value="lifestyle">Lifestyle</option>
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
