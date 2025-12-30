import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
  description?: string;
  comment?: string;
  context?: string;
  tone?: string;
  postContent?: string;
  angle?: string;
  style?: string;
  creatorContent?: string;
  useWebSearch?: boolean;
}

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
    console.log("Generate request:", body);

    let systemPrompt = "";
    let userPrompt = "";

    // Jan Kluz's style guidelines (from memory)
    const styleGuide = `
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

OUTPUT FORMAT:
- Output ONLY plain text, ready to copy and paste directly
- NO markdown formatting (no **, no ##, no -, no *)
- NO bullet points or lists with special characters
- Use line breaks for paragraphs, nothing else
`;

    if (body.type === "post") {
      systemPrompt = styleGuide + `\n\nYou are generating a ${body.format || "post"} for ${body.platform || "LinkedIn"}.`;
      
      // Check if this is an AI news post that should use web search
      const isAINewsPost = body.useWebSearch || 
        (body.category === "ai" && body.topic?.toLowerCase().includes("news")) ||
        (body.description?.toLowerCase().includes("news") && body.category === "ai");
      
      if (isAINewsPost) {
        userPrompt = `Generate a ${body.format || "post"} about: ${body.topic || body.description}

Category: ${body.category || "general"}
Platform: ${body.platform || "LinkedIn"}

IMPORTANT: This is an AI news post. Search the web for the LATEST AI news from the past 7 days. Include specific recent announcements, releases, or developments from major AI companies (OpenAI, Google, Anthropic, Meta, Microsoft, etc.). 

Do NOT mention old news or generic AI information. Focus on what happened THIS WEEK.

${body.creatorContent ? `\nReference insights from other creators for style inspiration:\n${body.creatorContent}` : ""}

Write the post now. Be direct and valuable. Output plain text only, no markdown.`;
      } else {
        userPrompt = `Generate a ${body.format || "post"} about: ${body.topic || body.description}

Category: ${body.category || "general"}
Platform: ${body.platform || "LinkedIn"}
${body.creatorContent ? `\nReference insights from other creators:\n${body.creatorContent}` : ""}

Write the post now. Be direct and valuable. Output plain text only, no markdown.`;
      }
    } else if (body.type === "reply") {
      systemPrompt = styleGuide + `\n\nYou are generating a reply to a comment. The reply should match Jan's voice while being ${body.tone || "thoughtful"}.`;
      
      userPrompt = `Someone left this comment on my post:
"${body.comment}"

${body.context ? `Context about my original post: ${body.context}` : ""}

Generate a ${body.tone || "thoughtful"} reply that:
1. Acknowledges their point
2. Adds value or insight
3. Stays true to my voice

Write the reply now. Output plain text only, no markdown.`;
    } else if (body.type === "comment") {
      systemPrompt = styleGuide + `\n\nYou are generating a proactive comment to engage with another creator's post. The comment should ${body.style || "add value"}.`;
      
      userPrompt = `Here's a post I want to engage with:
"${body.postContent}"

${body.angle ? `My angle/perspective: ${body.angle}` : ""}
Comment style: ${body.style || "Add value"}

Generate a comment that:
1. Shows I actually read and thought about their post
2. Adds genuine value or perspective
3. Positions me as a knowledgeable peer
4. Is not sycophantic or generic

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
