import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, FileText, MessageSquare, MessagesSquare, PenLine, Youtube } from "lucide-react";
import { Header } from "@/components/Header";
import { JansContentSection } from "@/components/JansContentSection";
import { ReferenceCreatorsManager } from "@/components/ReferenceCreatorsManager";
import { PostsAgent } from "@/components/agents/PostsAgent";
import { RepliesAgent } from "@/components/agents/RepliesAgent";
import { CommentsAgent } from "@/components/agents/CommentsAgent";
import YouTubeSummaryTest from "@/components/YouTubeSummaryTest";

type Tab = "jans-content" | "creators" | "agent-posts" | "agent-replies" | "agent-comments" | "youtube-test";

const tabs = [
  { id: "jans-content" as Tab, label: "Jan's Content", icon: FileText },
  { id: "creators" as Tab, label: "Reference Creators", icon: Users },
  { id: "agent-posts" as Tab, label: "Posts Agent", icon: PenLine },
  { id: "agent-replies" as Tab, label: "Replies Agent", icon: MessageSquare },
  { id: "agent-comments" as Tab, label: "Comments Agent", icon: MessagesSquare },
  { id: "youtube-test" as Tab, label: "YouTube Test", icon: Youtube },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("jans-content");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 sm:mb-10"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Content Engine <span className="text-gradient">for Jan Kluz</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
                3-agent system for content creation: posts, replies to comments, and proactive comments.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center gap-1 sm:gap-2 p-1 bg-muted/30 rounded-xl border border-border/50 mb-6 sm:mb-8 overflow-x-auto"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "jans-content" && <JansContentSection />}

          {activeTab === "creators" && (
            <motion.div
              key="creators"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ReferenceCreatorsManager />
            </motion.div>
          )}

          {activeTab === "agent-posts" && (
            <motion.div
              key="agent-posts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <PostsAgent />
            </motion.div>
          )}

          {activeTab === "agent-replies" && (
            <motion.div
              key="agent-replies"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <RepliesAgent />
            </motion.div>
          )}

          {activeTab === "agent-comments" && (
            <motion.div
              key="agent-comments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CommentsAgent />
            </motion.div>
          )}

          {activeTab === "youtube-test" && (
            <motion.div
              key="youtube-test"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <YouTubeSummaryTest />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
