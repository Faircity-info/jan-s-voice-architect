import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Lightbulb, Sparkles, Upload, Save, ChevronLeft, ChevronRight, Loader2, Copy, Check, Bell, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Mode = "weekly" | "adhoc" | "published";

type FieldType = "AI" | "Business" | "Personal Brand" | "Mindset" | "Tech" | "Startup" | "Education";
type ContentType = "text" | "image" | "carousel" | "video";
type CreationType = "ai-generated" | "self-created";

interface ScheduleItem {
  platform: "linkedin" | "x" | "instagram" | "youtube";
  format: string;
  fields: FieldType[]; // Which content areas this relates to
  description: string;
  contentType: ContentType; // What type of content
  creationType?: CreationType; // Only for non-text: AI generated or self-created
  aiPrompt?: string; // For AI-generated images/videos
  script?: string; // For self-created content: what to say/do, where to film
  generatedContent?: string;
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

interface PerformanceMetrics {
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
}

interface PublishedPost {
  id: string;
  content: string;
  platform: string;
  status: string;
  created_at: string;
  published_at: string | null;
  was_published: boolean | null;
  user_rating: number | null;
  user_feedback: string | null;
  performance_metrics: PerformanceMetrics | null;
}

const EXAMPLE_SCHEDULE: ContentSchedule = {
  version: "2.0",
  period: "biweekly",
  weeks: [
    {
      week: 1,
      days: [
        {
          day: "monday",
          theme: "AI News & Insights",
          items: [
            { 
              platform: "linkedin", 
              format: "text", 
              fields: ["AI", "Tech"], 
              contentType: "text",
              description: "Short commentary on weekend AI news (OpenAI/Google updates)" 
            },
            { 
              platform: "x", 
              format: "posts", 
              fields: ["AI"], 
              contentType: "text",
              description: "2-3 punchy posts about AI news" 
            }
          ]
        },
        {
          day: "wednesday",
          theme: "Expertise / How-to",
          items: [
            { 
              platform: "linkedin", 
              format: "carousel", 
              fields: ["Business", "AI"], 
              contentType: "carousel",
              creationType: "ai-generated",
              aiPrompt: "Create 5-7 slides showing step-by-step AI workflow for Excel data cleaning",
              description: "Carousel (5-7 slides) - practical workflow (e.g., 'How AI cleans my Excel data')" 
            },
            { 
              platform: "x", 
              format: "thread", 
              fields: ["Business"], 
              contentType: "text",
              description: "Thread (5-7 tweets) - repurpose LinkedIn carousel" 
            },
            { 
              platform: "instagram", 
              format: "reels", 
              fields: ["Business", "Tech"], 
              contentType: "video",
              creationType: "self-created",
              script: "Record screen while demonstrating automation. Voiceover: 'This is how I save 2 hours daily...' Location: at desk with clean background",
              description: "Screen recording - automation demo with voiceover" 
            }
          ]
        },
        {
          day: "friday",
          theme: "Lifestyle / Vision",
          items: [
            { 
              platform: "linkedin", 
              format: "photo+text", 
              fields: ["Personal Brand", "Mindset"], 
              contentType: "image",
              creationType: "self-created",
              script: "Take a candid photo at workspace or outdoor location. Show authentic moment of reflection or work",
              description: "Personal story - photo of Jan + text about how AI changed his work perspective" 
            },
            { 
              platform: "x", 
              format: "hot-take", 
              fields: ["AI", "Business"], 
              contentType: "text",
              description: "One provocative opinion (e.g., 'In 2026, a CFO without AI skills will be unemployable')" 
            },
            { 
              platform: "instagram", 
              format: "reels", 
              fields: ["Personal Brand", "Mindset"], 
              contentType: "video",
              creationType: "self-created",
              script: "20s selfie video, natural lighting. Start: 'This is my biggest lesson this week...' End with actionable takeaway. Location: home office or outdoor",
              description: "Talking head - 20s selfie video: 'This is my biggest lesson this week...'" 
            }
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
            { 
              platform: "linkedin", 
              format: "text", 
              fields: ["AI", "Tech"], 
              contentType: "text",
              description: "AI industry analysis or trend commentary" 
            },
            { 
              platform: "x", 
              format: "posts", 
              fields: ["AI"], 
              contentType: "text",
              description: "2-3 posts with insights on AI developments" 
            }
          ]
        },
        {
          day: "wednesday",
          theme: "Expertise / How-to",
          items: [
            { 
              platform: "linkedin", 
              format: "carousel", 
              fields: ["Business", "Startup"], 
              contentType: "carousel",
              creationType: "ai-generated",
              aiPrompt: "Create 5-7 professional slides showing AI productivity hack for entrepreneurs",
              description: "Carousel - business/productivity workflow with AI" 
            },
            { 
              platform: "x", 
              format: "thread", 
              fields: ["Business"], 
              contentType: "text",
              description: "Thread - repurpose LinkedIn content" 
            },
            { 
              platform: "instagram", 
              format: "reels", 
              fields: ["Education", "Tech"], 
              contentType: "video",
              creationType: "self-created",
              script: "Quick tutorial showing one AI tool. Start: 'Stop doing X manually, here's why...' Screen recording with face overlay",
              description: "Demo or tutorial reel" 
            }
          ]
        },
        {
          day: "friday",
          theme: "Lifestyle / Vision",
          items: [
            { 
              platform: "linkedin", 
              format: "photo+text", 
              fields: ["Personal Brand"], 
              contentType: "image",
              creationType: "self-created",
              script: "Behind-the-scenes photo: workspace, meeting, or creative process. Show the human side",
              description: "Behind-the-scenes or personal reflection" 
            },
            { 
              platform: "x", 
              format: "hot-take", 
              fields: ["AI", "Mindset"], 
              contentType: "text",
              description: "Bold prediction or contrarian view" 
            },
            { 
              platform: "instagram", 
              format: "reels", 
              fields: ["Personal Brand", "Mindset"], 
              contentType: "video",
              creationType: "self-created",
              script: "Personal video message: share a vulnerable moment or lesson. Natural setting, eye contact with camera",
              description: "Personal video message" 
            }
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
  LinkedIn: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  X: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
  Instagram: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  YouTube: "bg-red-500/20 text-red-400 border-red-500/30",
};

const FIELD_COLORS: Record<FieldType, string> = {
  "AI": "bg-emerald-500/20 text-emerald-400",
  "Business": "bg-amber-500/20 text-amber-400",
  "Personal Brand": "bg-purple-500/20 text-purple-400",
  "Mindset": "bg-cyan-500/20 text-cyan-400",
  "Tech": "bg-blue-500/20 text-blue-400",
  "Startup": "bg-orange-500/20 text-orange-400",
  "Education": "bg-rose-500/20 text-rose-400",
};

const CONTENT_TYPE_ICONS: Record<ContentType, string> = {
  "text": "📝",
  "image": "🖼️",
  "carousel": "📑",
  "video": "🎬",
};

const DAY_NAMES: Record<string, string> = {
  monday: "Monday",
  wednesday: "Wednesday",
  friday: "Friday",
};

export const PostsAgent = () => {
  const [mode, setMode] = useState<Mode>("weekly");
  const [adhocIdea, setAdhocIdea] = useState("");
  const [adhocPlatform, setAdhocPlatform] = useState("linkedin");
  const [adhocCategory, setAdhocCategory] = useState("ai");
  const [schedule, setSchedule] = useState<ContentSchedule | null>(null);
  const [jsonInput, setJsonInput] = useState("");
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [currentWeek, setCurrentWeek] = useState<1 | 2>(1);
  const [selectedDay, setSelectedDay] = useState<DaySchedule | null>(null);
  const [generatingItem, setGeneratingItem] = useState<string | null>(null);
  const [isGeneratingAdhoc, setIsGeneratingAdhoc] = useState(false);
  const [adhocResult, setAdhocResult] = useState("");
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [publishedPosts, setPublishedPosts] = useState<PublishedPost[]>([]);
  const [loadingPublished, setLoadingPublished] = useState(false);
  const [editingMetrics, setEditingMetrics] = useState<string | null>(null);
  const [metricsForm, setMetricsForm] = useState({ views: "", likes: "", comments: "", shares: "" });

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

  useEffect(() => {
    if (mode === "published") {
      fetchPublishedPosts();
    }
  }, [mode]);

  const fetchPublishedPosts = async () => {
    setLoadingPublished(true);
    try {
      const { data, error } = await supabase
        .from("generated_posts")
        .select("*")
        .eq("was_published", true)
        .order("published_at", { ascending: false });

      if (error) throw error;
      // Cast to correct type
      const posts = (data || []).map(p => ({
        ...p,
        performance_metrics: p.performance_metrics as PerformanceMetrics | null
      }));
      setPublishedPosts(posts);
    } catch (error) {
      console.error("Error fetching published posts:", error);
      toast.error("Failed to load published posts");
    } finally {
      setLoadingPublished(false);
    }
  };

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

  const handleCopy = async (content: string, itemKey: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedItem(itemKey);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedItem(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleMarkAsPosted = async (content: string, platform: string, itemKey: string) => {
    try {
      const { error } = await supabase
        .from("generated_posts")
        .insert({
          content,
          platform,
          status: "published",
          was_published: true,
          published_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success("Marked as posted! Add performance metrics in 7 days.");
    } catch (error) {
      console.error("Error saving post:", error);
      toast.error("Failed to save post");
    }
  };

  const handleUpdateMetrics = async (postId: string) => {
    try {
      const metrics = {
        views: metricsForm.views ? parseInt(metricsForm.views) : undefined,
        likes: metricsForm.likes ? parseInt(metricsForm.likes) : undefined,
        comments: metricsForm.comments ? parseInt(metricsForm.comments) : undefined,
        shares: metricsForm.shares ? parseInt(metricsForm.shares) : undefined,
      };

      const { error } = await supabase
        .from("generated_posts")
        .update({ performance_metrics: metrics })
        .eq("id", postId);

      if (error) throw error;
      
      toast.success("Performance metrics saved!");
      setEditingMetrics(null);
      setMetricsForm({ views: "", likes: "", comments: "", shares: "" });
      fetchPublishedPosts();
    } catch (error) {
      console.error("Error updating metrics:", error);
      toast.error("Failed to save metrics");
    }
  };

  const needsMetrics = (post: PublishedPost) => {
    if (!post.published_at) return false;
    const publishedDate = new Date(post.published_at);
    const daysSince = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince >= 7 && !post.performance_metrics;
  };

  const handleGeneratePost = async (item: ScheduleItem, dayIndex: number, itemIndex: number) => {
    const itemKey = `${dayIndex}-${itemIndex}`;
    setGeneratingItem(itemKey);
    
    try {
      // 1. Fetch active style guide from database
      const { data: styleGuideData } = await supabase
        .from("style_guide")
        .select("content")
        .eq("is_active", true)
        .single();

      // 2. Fetch creator notes (high-level style info)
      const { data: creators } = await supabase
        .from("reference_creators")
        .select("id, name, content_notes, field")
        .not("content_notes", "is", null);

      // 3. Fetch detailed creator content (RAG-style knowledge base)
      const relevantCreatorIds = creators
        ?.filter(c => c.field?.some(creatorField => 
          item.fields.some(itemField => 
            creatorField.toLowerCase() === itemField.toLowerCase()
          )
        ))
        .map(c => c.id) || [];

      const { data: creatorContentData } = await supabase
        .from("creator_content")
        .select("content, key_insights, platform")
        .in("creator_id", relevantCreatorIds)
        .limit(20); // Limit to prevent token overflow

      // 4. Fetch historical posts to avoid duplication
      const { data: historicalPosts } = await supabase
        .from("historical_posts")
        .select("content, platform")
        .eq("platform", item.platform)
        .order("posted_at", { ascending: false })
        .limit(10);

      // Also check generated posts that were published
      const { data: publishedGenerated } = await supabase
        .from("generated_posts")
        .select("content, platform")
        .eq("platform", item.platform)
        .eq("was_published", true)
        .order("published_at", { ascending: false })
        .limit(10);

      // Build creator notes string
      const relevantContent = creators
        ?.filter(c => c.field?.some(creatorField => 
          item.fields.some(itemField => 
            creatorField.toLowerCase() === itemField.toLowerCase()
          )
        ))
        .map(c => `${c.name}: ${c.content_notes?.substring(0, 500)}`)
        .join("\n\n") || "";

      // Build RAG-style creator insights (actual content examples)
      const creatorInsights = creatorContentData
        ?.map(c => `[${c.platform}] ${c.key_insights || ""}\n${c.content.substring(0, 400)}`)
        .join("\n---\n") || "";

      // Build historical posts summary for duplication check
      const allHistorical = [
        ...(historicalPosts || []),
        ...(publishedGenerated || [])
      ];
      const historicalSummary = allHistorical
        .map(p => p.content.substring(0, 200))
        .join("\n---\n");

      // Check if this is an AI news post (fields include AI and description mentions news)
      const isAINews = item.fields.includes("AI") && 
        (item.description.toLowerCase().includes("news") || 
         item.description.toLowerCase().includes("update") ||
         item.description.toLowerCase().includes("weekend"));

      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: {
          type: "post",
          topic: item.description,
          platform: item.platform,
          category: item.fields[0]?.toLowerCase() || "ai",
          format: item.format,
          contentType: item.contentType,
          description: item.description,
          styleGuide: styleGuideData?.content || undefined,
          creatorContent: relevantContent,
          creatorInsights: creatorInsights || undefined,
          historicalPosts: historicalSummary || undefined,
          useWebSearch: isAINews,
          aiPrompt: item.aiPrompt,
          script: item.script,
        },
      });

      if (error) throw error;

      if (selectedDay && schedule) {
        const updatedSchedule = { ...schedule };
        const weekData = updatedSchedule.weeks.find(w => w.week === currentWeek);
        if (weekData) {
          const day = weekData.days.find(d => d.day === selectedDay.day);
          if (day) {
            day.items[itemIndex].generatedContent = data.content;
            setSchedule(updatedSchedule);
            setSelectedDay({ ...selectedDay, items: [...day.items] });
          }
        }
      }

      toast.success("Post generated!");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate post");
    } finally {
      setGeneratingItem(null);
    }
  };

  const handleGenerateAdhoc = async () => {
    if (!adhocIdea.trim()) {
      toast.error("Please enter an idea first");
      return;
    }

    setIsGeneratingAdhoc(true);
    
    try {
      // 1. Fetch active style guide
      const { data: styleGuideData } = await supabase
        .from("style_guide")
        .select("content")
        .eq("is_active", true)
        .single();

      // 2. Fetch creator notes
      const { data: creators } = await supabase
        .from("reference_creators")
        .select("id, name, content_notes, field")
        .not("content_notes", "is", null);

      // 3. Fetch detailed creator content for this category
      const relevantCreatorIds = creators
        ?.filter(c => c.field?.some(f => f.toLowerCase() === adhocCategory))
        .map(c => c.id) || [];

      const { data: creatorContentData } = await supabase
        .from("creator_content")
        .select("content, key_insights, platform")
        .in("creator_id", relevantCreatorIds)
        .limit(15);

      // 4. Fetch historical posts for this platform
      const { data: historicalPosts } = await supabase
        .from("historical_posts")
        .select("content")
        .eq("platform", adhocPlatform)
        .order("posted_at", { ascending: false })
        .limit(10);

      const { data: publishedGenerated } = await supabase
        .from("generated_posts")
        .select("content")
        .eq("platform", adhocPlatform)
        .eq("was_published", true)
        .order("published_at", { ascending: false })
        .limit(10);

      const relevantContent = creators
        ?.filter(c => c.field?.some(f => f.toLowerCase() === adhocCategory))
        .map(c => `${c.name}: ${c.content_notes?.substring(0, 500)}`)
        .join("\n\n") || "";

      const creatorInsights = creatorContentData
        ?.map(c => `[${c.platform}] ${c.key_insights || ""}\n${c.content.substring(0, 400)}`)
        .join("\n---\n") || "";

      const allHistorical = [...(historicalPosts || []), ...(publishedGenerated || [])];
      const historicalSummary = allHistorical
        .map(p => p.content.substring(0, 200))
        .join("\n---\n");

      const isAINews = adhocCategory === "ai" && 
        (adhocIdea.toLowerCase().includes("news") || 
         adhocIdea.toLowerCase().includes("update"));

      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: {
          type: "post",
          topic: adhocIdea,
          platform: adhocPlatform,
          category: adhocCategory,
          format: "post",
          styleGuide: styleGuideData?.content || undefined,
          creatorContent: relevantContent,
          creatorInsights: creatorInsights || undefined,
          historicalPosts: historicalSummary || undefined,
          useWebSearch: isAINews,
        },
      });

      if (error) throw error;

      setAdhocResult(data.content);
      toast.success("Post generated!");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate post");
    } finally {
      setIsGeneratingAdhoc(false);
    }
  };

  const currentWeekData = schedule?.weeks.find(w => w.week === currentWeek);
  const postsNeedingMetrics = publishedPosts.filter(needsMetrics);

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
        <button
          onClick={() => setMode("published")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
            mode === "published"
              ? "bg-primary text-primary-foreground shadow-lg"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Published
          {postsNeedingMetrics.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
              {postsNeedingMetrics.length}
            </span>
          )}
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
                    {selectedDay.items.map((item, idx) => {
                      const dayIndex = currentWeekData?.days.findIndex(d => d.day === selectedDay.day) || 0;
                      const itemKey = `${dayIndex}-${idx}`;
                      const isGenerating = generatingItem === itemKey;
                      
                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-lg bg-muted/30 border border-border/50"
                        >
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-0.5 rounded border ${PLATFORM_COLORS[item.platform]}`}>
                              {item.platform}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                              {CONTENT_TYPE_ICONS[item.contentType]} {item.format}
                            </span>
                            {item.fields.map((field, fIdx) => (
                              <span key={fIdx} className={`text-xs px-2 py-0.5 rounded ${FIELD_COLORS[field]}`}>
                                {field}
                              </span>
                            ))}
                            {item.creationType && (
                              <span className={`text-xs px-2 py-0.5 rounded ${item.creationType === 'ai-generated' ? 'bg-violet-500/20 text-violet-400' : 'bg-teal-500/20 text-teal-400'}`}>
                                {item.creationType === 'ai-generated' ? '🤖 AI' : '📹 Self'}
                              </span>
                            )}
                          </div>
                          <p className="text-sm">{item.description}</p>
                          
                          {/* Show AI Prompt or Script for non-text content */}
                          {item.contentType !== "text" && (item.aiPrompt || item.script) && (
                            <div className="mt-2 p-2 rounded-lg bg-muted/30 border border-border/30">
                              {item.aiPrompt && (
                                <div className="text-xs">
                                  <span className="font-medium text-violet-400">AI Prompt: </span>
                                  <span className="text-muted-foreground">{item.aiPrompt}</span>
                                </div>
                              )}
                              {item.script && (
                                <div className="text-xs">
                                  <span className="font-medium text-teal-400">Script: </span>
                                  <span className="text-muted-foreground">{item.script}</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {item.generatedContent && (
                            <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                              <p className="text-sm whitespace-pre-wrap">{item.generatedContent}</p>
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => handleCopy(item.generatedContent!, itemKey)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-all text-xs"
                                >
                                  {copiedItem === itemKey ? (
                                    <Check className="w-3 h-3 text-green-500" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                  {copiedItem === itemKey ? "Copied!" : "Copy"}
                                </button>
                                <button
                                  onClick={() => handleMarkAsPosted(item.generatedContent!, item.platform, itemKey)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all text-xs"
                                >
                                  <Check className="w-3 h-3" />
                                  Mark as Posted
                                </button>
                              </div>
                            </div>
                          )}
                          
                          <button 
                            onClick={() => handleGeneratePost(item, dayIndex, idx)}
                            disabled={isGenerating}
                            className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all text-sm disabled:opacity-50"
                          >
                            {isGenerating ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Sparkles className="w-3 h-3" />
                            )}
                            {isGenerating ? "Generating..." : item.generatedContent ? "Regenerate" : "Generate"}
                          </button>
                        </div>
                      );
                    })}
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
      ) : mode === "adhoc" ? (
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
                  <select 
                    value={adhocPlatform}
                    onChange={(e) => setAdhocPlatform(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  >
                    <option value="linkedin">LinkedIn</option>
                    <option value="x">X / Twitter</option>
                    <option value="instagram">Instagram</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Topic category</label>
                  <select 
                    value={adhocCategory}
                    onChange={(e) => setAdhocCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  >
                    <option value="ai">AI</option>
                    <option value="business">Business</option>
                    <option value="lifestyle">Lifestyle</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={handleGenerateAdhoc}
                disabled={isGeneratingAdhoc}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium disabled:opacity-50"
              >
                {isGeneratingAdhoc ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {isGeneratingAdhoc ? "Generating..." : "Generate Post"}
              </button>

              {adhocResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-primary/5 border border-primary/20"
                >
                  <h4 className="font-medium mb-2">Generated Post</h4>
                  <p className="text-sm whitespace-pre-wrap">{adhocResult}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleCopy(adhocResult, "adhoc")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-all text-xs"
                    >
                      {copiedItem === "adhoc" ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      {copiedItem === "adhoc" ? "Copied!" : "Copy"}
                    </button>
                    <button
                      onClick={() => handleMarkAsPosted(adhocResult, adhocPlatform, "adhoc")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all text-xs"
                    >
                      <Check className="w-3 h-3" />
                      Mark as Posted
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="published"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Alert for posts needing metrics */}
          {postsNeedingMetrics.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <Bell className="w-5 h-5 text-amber-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-400">
                  {postsNeedingMetrics.length} post{postsNeedingMetrics.length > 1 ? "s" : ""} need performance metrics
                </h4>
                <p className="text-sm text-muted-foreground">
                  These posts were published more than 7 days ago. Add their metrics to improve future content.
                </p>
              </div>
            </div>
          )}

          {loadingPublished ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : publishedPosts.length === 0 ? (
            <div className="p-8 rounded-xl bg-card border border-border border-dashed text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No Published Posts Yet</h3>
              <p className="text-sm text-muted-foreground">
                Generate content and mark it as posted to track performance here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {publishedPosts.map((post) => {
                const needsMetricsNow = needsMetrics(post);
                
                return (
                  <div
                    key={post.id}
                    className={`p-4 rounded-xl bg-card border transition-all ${
                      needsMetricsNow ? "border-amber-500/50" : "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded border ${PLATFORM_COLORS[post.platform] || PLATFORM_COLORS.linkedin}`}>
                          {post.platform}
                        </span>
                        {needsMetricsNow && (
                          <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                            Needs metrics
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {post.published_at ? new Date(post.published_at).toLocaleDateString() : "Unknown date"}
                      </span>
                    </div>
                    
                    <p className="text-sm whitespace-pre-wrap line-clamp-4 mb-3">{post.content}</p>
                    
                    {post.performance_metrics ? (
                      <div className="flex flex-wrap gap-3 p-3 rounded-lg bg-muted/30">
                        {post.performance_metrics.views !== undefined && (
                          <div className="text-center">
                            <p className="text-lg font-semibold">{post.performance_metrics.views}</p>
                            <p className="text-xs text-muted-foreground">Views</p>
                          </div>
                        )}
                        {post.performance_metrics.likes !== undefined && (
                          <div className="text-center">
                            <p className="text-lg font-semibold">{post.performance_metrics.likes}</p>
                            <p className="text-xs text-muted-foreground">Likes</p>
                          </div>
                        )}
                        {post.performance_metrics.comments !== undefined && (
                          <div className="text-center">
                            <p className="text-lg font-semibold">{post.performance_metrics.comments}</p>
                            <p className="text-xs text-muted-foreground">Comments</p>
                          </div>
                        )}
                        {post.performance_metrics.shares !== undefined && (
                          <div className="text-center">
                            <p className="text-lg font-semibold">{post.performance_metrics.shares}</p>
                            <p className="text-xs text-muted-foreground">Shares</p>
                          </div>
                        )}
                      </div>
                    ) : editingMetrics === post.id ? (
                      <div className="p-3 rounded-lg bg-muted/30 space-y-3">
                        <div className="grid grid-cols-4 gap-2">
                          <div>
                            <label className="text-xs text-muted-foreground">Views</label>
                            <input
                              type="number"
                              value={metricsForm.views}
                              onChange={(e) => setMetricsForm({ ...metricsForm, views: e.target.value })}
                              className="w-full px-2 py-1.5 rounded bg-background border border-border text-sm"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Likes</label>
                            <input
                              type="number"
                              value={metricsForm.likes}
                              onChange={(e) => setMetricsForm({ ...metricsForm, likes: e.target.value })}
                              className="w-full px-2 py-1.5 rounded bg-background border border-border text-sm"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Comments</label>
                            <input
                              type="number"
                              value={metricsForm.comments}
                              onChange={(e) => setMetricsForm({ ...metricsForm, comments: e.target.value })}
                              className="w-full px-2 py-1.5 rounded bg-background border border-border text-sm"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Shares</label>
                            <input
                              type="number"
                              value={metricsForm.shares}
                              onChange={(e) => setMetricsForm({ ...metricsForm, shares: e.target.value })}
                              className="w-full px-2 py-1.5 rounded bg-background border border-border text-sm"
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateMetrics(post.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs"
                          >
                            <Check className="w-3 h-3" />
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingMetrics(null);
                              setMetricsForm({ views: "", likes: "", comments: "", shares: "" });
                            }}
                            className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingMetrics(post.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all text-xs"
                      >
                        <BarChart3 className="w-3 h-3" />
                        Add Performance Metrics
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
