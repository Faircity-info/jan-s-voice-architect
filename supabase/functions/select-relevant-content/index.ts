import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContentEntry {
  id: string;
  content: string;
  key_insights: string | null;
  platform: string;
  creator_name: string;
  created_at?: string;
  posted_at?: string | null;
}

interface SelectRequest {
  topic: string;
  entries: ContentEntry[];
  maxResults?: number;
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

    const body: SelectRequest = await req.json();
    const { topic, entries, maxResults = 5 } = body;

    console.log("Selecting relevant content for topic:", topic);
    console.log("Total entries to evaluate:", entries.length);

    if (!entries || entries.length === 0) {
      console.log("No entries provided, returning empty array");
      return new Response(JSON.stringify({ selectedIds: [], reasoning: "No content available" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build a summary of each entry for the AI to evaluate
    const entrySummaries = entries.map((e, i) => {
      const preview = e.content.substring(0, 800);
      const dateInfo = e.posted_at || e.created_at || "unknown date";
      return `[${i}] ${e.creator_name} (${e.platform}) - ${dateInfo}: ${e.key_insights || ""}\nPreview: ${preview}...`;
    }).join("\n\n---\n\n");

    const systemPrompt = `You are a content relevance expert. Your job is to select the most relevant content pieces for a given topic.

You will receive:
1. A TOPIC that the user wants to create content about
2. A list of CONTENT ENTRIES with previews and dates

Your task: Select up to ${maxResults} entries that are MOST RELEVANT to the topic. Consider:
- Direct topic match (highest priority)
- Related concepts and frameworks
- Useful angles or perspectives
- Complementary information
- RECENCY BONUS: When two entries are similarly relevant, prefer the newer one. Recent content (within last few weeks) should get a small boost in consideration, but NEVER prioritize a weakly relevant new entry over a highly relevant older one.

Return a JSON object with:
- "selectedIndices": array of entry indices (numbers) that are most relevant
- "reasoning": brief explanation of why these were selected

IMPORTANT: Only return entries that are actually relevant. If only 2 are relevant, return only 2. Don't pad with irrelevant content.`;

    const userPrompt = `TOPIC: "${topic}"

CONTENT ENTRIES:
${entrySummaries}

Select the most relevant entries for this topic. Return JSON only.`;

    console.log("Calling AI for content selection...");

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
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI error:", response.status, errorText);
      
      // Fallback: return first N entries
      const fallbackIds = entries.slice(0, maxResults).map(e => e.id);
      console.log("Falling back to first entries:", fallbackIds);
      return new Response(JSON.stringify({ 
        selectedIds: fallbackIds, 
        reasoning: "Fallback selection due to AI error" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content || "{}";
    
    console.log("AI response:", resultText);

    let parsed;
    try {
      parsed = JSON.parse(resultText);
    } catch {
      // Try to extract JSON from the response
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { selectedIndices: [] };
    }

    const selectedIndices: number[] = parsed.selectedIndices || [];
    const reasoning = parsed.reasoning || "AI selection";

    // Map indices back to entry IDs
    const selectedIds = selectedIndices
      .filter(i => i >= 0 && i < entries.length)
      .map(i => entries[i].id);

    console.log("Selected entry IDs:", selectedIds);
    console.log("Reasoning:", reasoning);

    return new Response(JSON.stringify({ selectedIds, reasoning }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in select-relevant-content:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      selectedIds: [],
      reasoning: "Error during selection"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
