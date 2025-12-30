export interface ReferenceCreator {
  id: string;
  name: string;
  platform: "LinkedIn" | "X" | "YouTube" | "Blog";
  links: string[];
  reasonWhy?: string;
  analyzed: boolean;
  styleProfile?: CreatorStyleProfile;
}

export interface CreatorStyleProfile {
  hookMechanics: {
    patterns: string[];
    style: "curiosity" | "authority" | "provocation" | "mixed";
  };
  sentenceStructure: {
    avgLength: "short" | "medium" | "long";
    usesFragments: boolean;
    rhythmScore: number;
  };
  toneAttributes: {
    calm: number;
    aggressive: number;
    playful: number;
    certainty: number;
    emotionalTemperature: number;
  };
  cognitiveStyle: string[];
  languageMarkers: {
    typicalPhrases: string[];
    metaphors: string[];
    tabooWords: string[];
  };
}

export interface StyleDimensions {
  directness: number;
  densityOfInsight: number;
  emotionality: number;
  authority: number;
  vulnerability: number;
  practicality: number;
  provocativeness: number;
}

export interface StyleRules {
  always: string[];
  sometimes: string[];
  never: string[];
}

export interface StructuralPatterns {
  preferredLengths: string[];
  preferredHooks: string[];
  preferredEndings: string[];
}

export interface StyleObject {
  voiceVersion: string;
  corePrinciples: string[];
  forbiddenPatterns: string[];
  preferredHooks: string[];
  sentenceRules: string[];
  emotionalRange: { min: number; max: number };
  allowedExperimentationBounds: string[];
}

export interface VoiceManifesto {
  title: string;
  coreVoice: string;
  keyPrinciples: string[];
  toneGuidelines: string;
}

export interface StyleGuide {
  doList: string[];
  dontList: string[];
}

export interface ToneExample {
  type: "good" | "bad";
  content: string;
  explanation: string;
}

export interface StrategicContext {
  targetAudience: string;
  brandPositioning: string[];
  desiredPerception: string[];
}
