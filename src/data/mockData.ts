import { 
  ReferenceCreator, 
  StyleDimensions, 
  StyleRules, 
  StyleObject, 
  VoiceManifesto,
  StyleGuide,
  ToneExample,
  StrategicContext
} from "@/types/style";

// Mock data for demonstration
export const mockCreators: ReferenceCreator[] = [
  {
    id: "1",
    name: "Alex Hormozi",
    platform: "LinkedIn",
    links: ["https://linkedin.com/in/alexhormozi"],
    reasonWhy: "Punchy, direct, zero fluff. High density of insight per sentence.",
    analyzed: true,
    styleProfile: {
      hookMechanics: {
        patterns: ["Contrarian opener", "Bold claim", "Pattern interrupt"],
        style: "authority"
      },
      sentenceStructure: {
        avgLength: "short",
        usesFragments: true,
        rhythmScore: 9
      },
      toneAttributes: {
        calm: 6,
        aggressive: 8,
        playful: 4,
        certainty: 10,
        emotionalTemperature: 7
      },
      cognitiveStyle: ["First-principles", "Contrarian takes", "Frameworks"],
      languageMarkers: {
        typicalPhrases: ["Here's the thing", "Most people", "The reality is"],
        metaphors: ["Business as game", "Money as score"],
        tabooWords: ["Maybe", "I think", "Hopefully"]
      }
    }
  },
  {
    id: "2",
    name: "Sahil Bloom",
    platform: "X",
    links: ["https://twitter.com/SahilBloom"],
    reasonWhy: "Great storytelling, accessible insights, warm authority.",
    analyzed: true,
    styleProfile: {
      hookMechanics: {
        patterns: ["Story opener", "Curiosity gap", "Personal anecdote"],
        style: "curiosity"
      },
      sentenceStructure: {
        avgLength: "medium",
        usesFragments: false,
        rhythmScore: 8
      },
      toneAttributes: {
        calm: 8,
        aggressive: 3,
        playful: 6,
        certainty: 7,
        emotionalTemperature: 6
      },
      cognitiveStyle: ["Storytelling", "Frameworks", "Observational insights"],
      languageMarkers: {
        typicalPhrases: ["Let me tell you about", "Here's what I learned", "The lesson"],
        metaphors: ["Life as journey", "Growth as compound interest"],
        tabooWords: ["Hustle culture", "Grind"]
      }
    }
  }
];

export const mockStyleDimensions: StyleDimensions = {
  directness: 8,
  densityOfInsight: 9,
  emotionality: 5,
  authority: 8,
  vulnerability: 4,
  practicality: 9,
  provocativeness: 7
};

export const mockStyleRules: StyleRules = {
  always: [
    "Lead with the insight, not the backstory",
    "Use concrete numbers and specifics",
    "End with actionable clarity",
    "Write like you're talking to one smart friend"
  ],
  sometimes: [
    "Share personal failures (when relevant)",
    "Use provocative statements (when earned)",
    "Break conventional wisdom (when you have proof)"
  ],
  never: [
    "Use corporate jargon or buzzwords",
    "Start with 'I'm excited to announce'",
    "End with generic CTAs",
    "Use filler phrases like 'in this day and age'"
  ]
};

export const mockStyleObject: StyleObject = {
  voiceVersion: "v1.0",
  corePrinciples: [
    "Clarity over cleverness",
    "Experience over theory",
    "Signal over noise",
    "Density over length"
  ],
  forbiddenPatterns: [
    "Starting with 'I'",
    "Passive voice",
    "Hedging language",
    "Generic openings"
  ],
  preferredHooks: [
    "Contrarian statement",
    "Unexpected insight",
    "Pattern interrupt",
    "Direct challenge"
  ],
  sentenceRules: [
    "Max 15 words per sentence on average",
    "Vary rhythm: short-short-long",
    "Use fragments for emphasis",
    "One idea per paragraph"
  ],
  emotionalRange: { min: 4, max: 8 },
  allowedExperimentationBounds: [
    "Test vulnerability in personal stories",
    "Experiment with longer narrative posts on weekends",
    "Try more questions vs statements ratio"
  ]
};

export const mockManifesto: VoiceManifesto = {
  title: "The Jan Kluz Voice",
  coreVoice: "Sharp, honest, calm authority. Someone who's done the work and shares the real lessons—not the polished version.",
  keyPrinciples: [
    "Say the uncomfortable truth others avoid",
    "Back every claim with experience or data",
    "Respect the reader's intelligence",
    "Make complexity accessible without dumbing down"
  ],
  toneGuidelines: "Think: experienced mentor in a quiet bar, not motivational speaker on stage. Confident but not arrogant. Direct but not harsh. Practical but not boring."
};

export const mockStyleGuide: StyleGuide = {
  doList: [
    "Open with your strongest insight",
    "Use specific examples from real experience",
    "Write shorter than feels comfortable",
    "Challenge common assumptions with evidence",
    "End with clarity, not questions",
    "Use 'you' more than 'I'"
  ],
  dontList: [
    "Start posts with 'I'm excited...' or 'Thrilled to...'",
    "Use buzzwords: synergy, leverage, ecosystem",
    "Write walls of text without whitespace",
    "Make claims without backing them up",
    "Sound like you're selling something",
    "Use hashtags as content"
  ]
};

export const mockToneExamples: ToneExample[] = [
  {
    type: "good",
    content: "Most startup advice is written by people who've never built anything.\n\nHere's what actually worked after 3 failed companies:\n\n1. Speed beats perfection. Ship weekly.\n2. Customer calls > market research. Talk to 5 users before writing code.\n3. Revenue validates. Everything else is noise.",
    explanation: "Direct opener, specific experience, actionable density, zero fluff."
  },
  {
    type: "bad",
    content: "I'm so excited to share some thoughts on entrepreneurship! 🚀\n\nIn today's fast-paced world, it's more important than ever to focus on innovation and disruption. As a passionate founder, I believe we should all strive to make an impact.\n\nWho's with me? Drop a 🔥 if you agree!",
    explanation: "Generic opener, buzzwords, no specifics, engagement bait, empty enthusiasm."
  }
];

export const mockStrategicContext: StrategicContext = {
  targetAudience: "Founders, operators, and ambitious professionals building in AI and tech",
  brandPositioning: ["AI", "Startups", "Practical Strategy", "Authentic Leadership"],
  desiredPerception: ["Sharp", "Honest", "Calm", "Contrarian", "Practical"]
};
