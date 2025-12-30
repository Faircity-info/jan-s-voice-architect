import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, BarChart3, FileText, Code2, RefreshCw, User } from "lucide-react";
import { Header } from "@/components/Header";
import { CreatorCard } from "@/components/CreatorCard";
import { StyleRadar } from "@/components/StyleRadar";
import { StyleRulesCard } from "@/components/StyleRulesCard";
import { StyleObjectViewer } from "@/components/StyleObjectViewer";
import { ManifestoCard } from "@/components/ManifestoCard";
import { ToneExamples } from "@/components/ToneExamples";
import { DosDontsCard } from "@/components/DosDontsCard";
import { AddCreatorForm } from "@/components/AddCreatorForm";
import { StrategicContextCard } from "@/components/StrategicContextCard";
import { ContinuousLearning } from "@/components/ContinuousLearning";
import { JansContentSection } from "@/components/JansContentSection";
import { ReferenceCreator } from "@/types/style";
import {
  mockCreators,
  mockStyleDimensions,
  mockStyleRules,
  mockStyleObject,
  mockManifesto,
  mockStyleGuide,
  mockToneExamples,
  mockStrategicContext,
} from "@/data/mockData";

type Tab = "jans-content" | "creators" | "synthesis" | "manifesto" | "object";

const tabs = [
  { id: "jans-content" as Tab, label: "Jan's Own Content", icon: User },
  { id: "creators" as Tab, label: "Reference Creators", icon: Users },
  { id: "synthesis" as Tab, label: "Style Synthesis", icon: BarChart3 },
  { id: "manifesto" as Tab, label: "Voice Manifesto", icon: FileText },
  { id: "object" as Tab, label: "Style Object", icon: Code2 },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("jans-content");
  const [creators, setCreators] = useState<ReferenceCreator[]>(mockCreators);
  const [showAddCreator, setShowAddCreator] = useState(false);

  const handleAddCreator = (data: Omit<ReferenceCreator, "id" | "analyzed" | "styleProfile">) => {
    const newCreator: ReferenceCreator = {
      ...data,
      id: Date.now().toString(),
      analyzed: false,
    };
    setCreators((prev) => [...prev, newCreator]);
    
    // Simulate analysis after 2 seconds
    setTimeout(() => {
      setCreators((prev) =>
        prev.map((c) =>
          c.id === newCreator.id
            ? {
                ...c,
                analyzed: true,
                styleProfile: {
                  hookMechanics: {
                    patterns: ["Pattern interrupt", "Bold claim"],
                    style: "authority",
                  },
                  sentenceStructure: {
                    avgLength: "short",
                    usesFragments: true,
                    rhythmScore: 7,
                  },
                  toneAttributes: {
                    calm: 6,
                    aggressive: 5,
                    playful: 4,
                    certainty: 8,
                    emotionalTemperature: 6,
                  },
                  cognitiveStyle: ["First-principles", "Frameworks"],
                  languageMarkers: {
                    typicalPhrases: ["The key is", "What works"],
                    metaphors: ["Building blocks"],
                    tabooWords: ["Maybe", "Perhaps"],
                  },
                },
              }
            : c
        )
      );
    }, 2000);
  };

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
                Style Analysis <span className="text-gradient">Agent #1</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
                Voice architecture system for Jan Kluz. Analyze elite creators, synthesize unique style, 
                generate the system that all other agents must obey.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-sm">
                <RefreshCw className="w-4 h-4" />
                Re-analyze All
              </button>
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
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground">Reference Creators</h2>
                    <button
                      onClick={() => setShowAddCreator(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add Creator
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {creators.map((creator, index) => (
                      <CreatorCard key={creator.id} creator={creator} index={index} />
                    ))}
                  </div>
                </div>
                
                <div className="space-y-6">
                  <StrategicContextCard context={mockStrategicContext} />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "synthesis" && (
            <motion.div
              key="synthesis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid lg:grid-cols-2 gap-6">
                <StyleRadar dimensions={mockStyleDimensions} />
                <StyleRulesCard rules={mockStyleRules} />
              </div>
              <div className="mt-6">
                <ContinuousLearning />
              </div>
            </motion.div>
          )}

          {activeTab === "manifesto" && (
            <motion.div
              key="manifesto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid lg:grid-cols-2 gap-6">
                <ManifestoCard manifesto={mockManifesto} />
                <DosDontsCard guide={mockStyleGuide} />
              </div>
              <div className="mt-6">
                <ToneExamples examples={mockToneExamples} />
              </div>
            </motion.div>
          )}

          {activeTab === "object" && (
            <motion.div
              key="object"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <StyleObjectViewer styleObject={mockStyleObject} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Add Creator Modal */}
      <AnimatePresence>
        {showAddCreator && (
          <AddCreatorForm
            onAdd={handleAddCreator}
            onClose={() => setShowAddCreator(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
