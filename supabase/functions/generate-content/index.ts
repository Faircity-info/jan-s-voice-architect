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
- No emojis (unless platform-required)
- No hashtags (unless platform-required)
- No clickbait hooks
- No "Here's why..." clichés
- No fake curiosity
- Show thinking/decision logic (trade-offs and friction), not just outcomes

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

    if (body.type === "post") {
      systemPrompt = styleGuide + `\n\nYou are generating a ${body.format || "post"} for ${body.platform || "LinkedIn"}.`;
      
      userPrompt = `Generate a ${body.format || "post"} about: ${body.topic || body.description}

Category: ${body.category || "general"}
Platform: ${body.platform || "LinkedIn"}
${body.creatorContent ? `\nReference insights from other creators:\n${body.creatorContent}` : ""}

Write the post now. Be direct and valuable.`;
    } else if (body.type === "reply") {
      systemPrompt = styleGuide + `\n\nYou are generating a reply to a comment. The reply should match Jan's voice while being ${body.tone || "thoughtful"}.`;
      
      userPrompt = `Someone left this comment on my post:
"${body.comment}"

${body.context ? `Context about my original post: ${body.context}` : ""}

Generate a ${body.tone || "thoughtful"} reply that:
1. Acknowledges their point
2. Adds value or insight
3. Stays true to my voice

Write the reply now.`;
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

Write the comment now.`;
    }

    console.log("Calling Lovable AI with prompt type:", body.type);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
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
    const generatedText = data.choices?.[0]?.message?.content;

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
