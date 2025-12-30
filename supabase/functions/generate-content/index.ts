import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateRequest {
  type: "post" | "reply" | "comment";
  topic?: string;
  platform?: string;
  category?: string;
  format?: string;
  contentType?: "text" | "image" | "carousel" | "video";
  description?: string;
  comment?: string;
  context?: string;
  tone?: string;
  postContent?: string;
  angle?: string;
  style?: string;
  creatorContent?: string;
  creatorInsights?: string; // Detailed creator_content entries
  styleGuide?: string; // Style guide from database
  historicalPosts?: string; // Previous posts to avoid duplication
  useWebSearch?: boolean;
  aiPrompt?: string;
  script?: string;
}

// Platform-specific best practices
const PLATFORM_BEST_PRACTICES: Record<string, string> = {
  linkedin: `
LINKEDIN BEST PRACTICES:
- Hook in first line (before "see more" - max 150 characters)
- Use line breaks for readability (short paragraphs, 1-3 sentences each)
- Personal stories perform 3x better than generic advice
- Questions in posts increase comments by 50%
- Posts with "I" outperform "You" posts on LinkedIn
- Optimal length: 1,200-1,500 characters (not too short, not too long)
- Post timing: Tuesday-Thursday, 7-8am or 12pm local time
- Carousels get 3x more reach than text-only
- End with a question or call-to-action for engagement
- Avoid external links in post (put in comments if needed)
- First comment from author within 1 hour boosts reach
`,
  x: `
X (TWITTER) BEST PRACTICES:
- First tweet is the hook - must stop the scroll
- Optimal tweet length: 71-100 characters for engagement
- Threads: First tweet hooks, last tweet summarizes + CTA
- Use numbers and specifics ("5 tools" not "some tools")
- Controversial/contrarian takes get more engagement
- Quote tweets > regular retweets for reach
- Reply to comments within first hour
- Peak times: 8-10am, 12pm, 5-6pm
- No hashtags (or max 1-2 highly relevant ones)
- Threads should be 5-10 tweets max
`,
  instagram: `
INSTAGRAM BEST PRACTICES:
- Reels: First 1-3 seconds must hook (face or action)
- Caption: First line is crucial (before "more...")
- Use 3-5 relevant hashtags (not 30)
- Carousel: First slide = hook, last slide = CTA
- Stories drive engagement to main posts
- Reels optimal length: 15-30 seconds
- Post consistently (3-5x per week minimum)
- Respond to all comments within 1 hour
- Use trending audio for Reels when relevant
- Behind-the-scenes content humanizes the brand
`,
  youtube: `
YOUTUBE SHORTS BEST PRACTICES:
- First 2 seconds = hook (face, movement, or surprising statement)
- Optimal length: 30-45 seconds
- Vertical format (9:16 aspect ratio)
- Strong text overlays for silent viewing
- Loop potential increases watch time
- Clear value proposition upfront
- End with subscribe CTA
- Consistency matters more than perfection
`,
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const body: GenerateRequest = await req.json();
    console.log("Generate request type:", body.type);

    // Get platform-specific best practices
    const platformLower = body.platform?.toLowerCase() || "linkedin";
    const platformBestPractices = PLATFORM_BEST_PRACTICES[platformLower] || PLATFORM_BEST_PRACTICES.linkedin;

    let systemPrompt = "";
    let userPrompt = "";

    // Use provided style guide or fallback to default
    const styleGuide = body.styleGuide || `
You are writing content for Jan Kluz, a builder and AI expert. Follow these strict style rules:

CORE PHILOSOPHY: "Builder clarity × system thinking × low-noise authority"
- Prioritize clarity over cleverness
- Experience over theory
- Signal over noise
- Credibility over virality

HARD CONSTRAINTS:
- No hashtags (unless platform-required)
- No clickbait hooks
- No "Here's why..." clichés
- No fake curiosity
- Show thinking/decision logic (trade-offs and friction), not just outcomes
- OCCASIONALLY use 1-3 emojis per post to add personality (not every post, sparingly)

WRITING MECHANICS:
- Short-to-medium declarative sentences, often stacked for rhythm
- Paragraphs: 1-3 lines with intentional whitespace
- "Low drama, high signal" emotional register
- Rhetorical patterns: "Reframe First, Explain Second" (invalidate default assumptions) and "Contrast-Based Insight"

PERSPECTIVE USAGE:
- "I" sparingly - to signal ownership or share experience
- "You" - to pull reader into thinking process
- "We" - reserved for collective patterns among builders

REFERENCE TOPICS: AI as leverage, systems, execution frameworks
TONE: Calm and direct
`;

    const outputFormat = `
OUTPUT FORMAT:
- Output ONLY plain text, ready to copy and paste directly
- NO markdown formatting (no **, no ##, no -, no *)
- NO bullet points or lists with special characters
- Use line breaks for paragraphs, nothing else
`;

    if (body.type === "post") {
      systemPrompt = styleGuide + platformBestPractices + outputFormat;
      systemPrompt += `\n\nYou are generating a ${body.format || "post"} for ${body.platform || "LinkedIn"}.`;
      
      // Check if this is an AI news post that should use web search
      const isAINewsPost = body.useWebSearch || 
        (body.category === "ai" && body.topic?.toLowerCase().includes("news")) ||
        (body.description?.toLowerCase().includes("news") && body.category === "ai");
      
      // Build content type specific instructions
      let contentTypeInstructions = "";
      if (body.contentType === "carousel") {
        contentTypeInstructions = `\n\nCONTENT TYPE: Carousel
Generate the TEXT that will accompany this carousel post. The carousel visual will be created separately.
${body.aiPrompt ? `AI generation prompt for visuals: ${body.aiPrompt}` : ""}
Focus on writing a compelling caption that introduces the carousel content and creates curiosity to swipe.`;
      } else if (body.contentType === "image") {
        contentTypeInstructions = `\n\nCONTENT TYPE: Image Post
Generate the TEXT caption that will accompany this image.
${body.aiPrompt ? `The image will be AI-generated with prompt: ${body.aiPrompt}` : ""}
${body.script ? `The image will be self-created: ${body.script}` : ""}
Focus on a caption that complements the visual and tells a story.`;
      } else if (body.contentType === "video") {
        contentTypeInstructions = `\n\nCONTENT TYPE: Video/Reel
Generate the TEXT caption that will accompany this video.
${body.script ? `Video script/directions: ${body.script}` : ""}
Also provide the video caption text that will appear when the video is posted.`;
      }

      // Build historical posts warning
      let historicalWarning = "";
      if (body.historicalPosts) {
        historicalWarning = `\n\nIMPORTANT - AVOID DUPLICATION:
You have already posted similar content before. DO NOT repeat these themes, hooks, or examples:
${body.historicalPosts}

Create something FRESH that covers new ground or a new angle on this topic.`;
      }

      // Build creator insights section (RAG-style)
      let creatorInsightsSection = "";
      if (body.creatorInsights) {
        creatorInsightsSection = `\n\nREFERENCE CREATOR INSIGHTS (use for inspiration, NOT to copy):
These are insights and content patterns from creators in relevant fields. Extract relevant ideas and synthesize them into Jan's unique voice:

${body.creatorInsights}

Remember: Use these as inspiration for angles and ideas, but write in Jan's distinct voice. Never copy directly.`;
      }

      // Build creator notes section
      let creatorNotesSection = "";
      if (body.creatorContent) {
        creatorNotesSection = `\n\nCREATOR STYLE NOTES:
${body.creatorContent}`;
      }
      
      if (isAINewsPost) {
        userPrompt = `Generate a ${body.format || "post"} about: ${body.topic || body.description}

Category: ${body.category || "general"}
Platform: ${body.platform || "LinkedIn"}
${contentTypeInstructions}
${historicalWarning}

IMPORTANT: This is an AI news post. Search the web for the LATEST AI news from the past 7 days. Include specific recent announcements, releases, or developments from major AI companies (OpenAI, Google, Anthropic, Meta, Microsoft, etc.). 

Do NOT mention old news or generic AI information. Focus on what happened THIS WEEK.
${creatorInsightsSection}
${creatorNotesSection}

Write the post now. Be direct and valuable. Output plain text only, no markdown.`;
      } else {
        userPrompt = `Generate a ${body.format || "post"} about: ${body.topic || body.description}

Category: ${body.category || "general"}
Platform: ${body.platform || "LinkedIn"}
${contentTypeInstructions}
${historicalWarning}
${creatorInsightsSection}
${creatorNotesSection}

Write the post now. Be direct and valuable. Output plain text only, no markdown.`;
      }
    } else if (body.type === "reply") {
      systemPrompt = styleGuide + outputFormat;
      systemPrompt += `\n\nYou are generating a reply to a comment. The reply should match Jan's voice while being ${body.tone || "thoughtful"}.`;
      systemPrompt += `\n\nKEEP IT CONCISE: Replies should be 1-3 sentences. Don't over-explain.`;
      
      userPrompt = `Someone left this comment on my post:
"${body.comment}"

${body.context ? `Context about my original post: ${body.context}` : ""}

Generate a ${body.tone || "thoughtful"} reply that:
1. Acknowledges their point authentically (not generically)
2. Adds a brief insight or perspective
3. Stays true to my voice - builder clarity, no fluff

Keep it SHORT - 1-3 sentences max. Output plain text only, no markdown.`;
    } else if (body.type === "comment") {
      systemPrompt = styleGuide + outputFormat;
      systemPrompt += `\n\nYou are generating a proactive comment to engage with another creator's post. The comment should ${body.style || "add value"}.`;
      systemPrompt += `\n\nKEEP IT AUTHENTIC: Comments should feel like a genuine peer-to-peer interaction, not a marketing opportunity.`;
      
      userPrompt = `Here's a post I want to engage with:
"${body.postContent}"

${body.angle ? `My angle/perspective: ${body.angle}` : ""}
Comment style: ${body.style || "Add value"}

Generate a comment that:
1. Shows I actually read and thought about their post (reference specific points)
2. Adds genuine value, perspective, or a related experience
3. Positions me as a knowledgeable peer, not a fanboy
4. Is NOT sycophantic, generic, or self-promotional
5. Is 2-4 sentences max

Write the comment now. Output plain text only, no markdown.`;
    }

    console.log("Calling Lovable AI with prompt type:", body.type);

    // Use google/gemini-2.5-flash with grounding for AI news posts
    const isAINewsPost = body.useWebSearch || 
      (body.type === "post" && body.category === "ai" && 
       (body.topic?.toLowerCase().includes("news") || body.description?.toLowerCase().includes("news")));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: isAINewsPost ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    let generatedText = data.choices?.[0]?.message?.content || "";
    
    // Clean up any markdown that might have slipped through
    generatedText = generatedText
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/^#+\s*/gm, '')
      .replace(/^[-•]\s*/gm, '')
      .replace(/`/g, '')
      .trim();

    console.log("Generated content successfully");

    return new Response(JSON.stringify({ content: generatedText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-content function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
