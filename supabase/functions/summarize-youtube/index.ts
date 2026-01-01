import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SummarizeRequest {
  youtube_url: string;
  video_title?: string;
  creator_name?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const body: SummarizeRequest = await req.json();
    
    console.log('Received request:', JSON.stringify(body, null, 2));

    if (!body.youtube_url) {
      return new Response(
        JSON.stringify({ error: 'Missing youtube_url' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build verification context
    const verificationContext = [];
    if (body.video_title) {
      verificationContext.push(`Expected video title: "${body.video_title}"`);
    }
    if (body.creator_name) {
      verificationContext.push(`Expected creator: "${body.creator_name}"`);
    }
    const verificationPrompt = verificationContext.length > 0 
      ? `\n\nIMPORTANT VERIFICATION: Before creating the summary, verify that the video at this URL matches these expected details:\n${verificationContext.join('\n')}\nIf the video title or creator doesn't match, start your response with a WARNING explaining the mismatch.\n`
      : '';

    // Call Gemini to analyze the YouTube video
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert content analyst. Your task is to watch YouTube videos and create comprehensive summaries that capture:

1. **Main Topic & Thesis**: What is the video about? What's the core message?
2. **Key Points**: List the main arguments, tips, or insights (bullet points)
3. **Memorable Quotes**: Any standout phrases or concepts the creator uses
4. **Content Style**: How does the creator present? (tone, pacing, visual style)
5. **Unique Frameworks**: Any proprietary concepts, methods, or terminology they use
6. **Call to Action**: What does the creator want viewers to do?
${verificationPrompt}
Write the summary in Czech language. Be thorough but concise. Focus on extractable insights that could help understand this creator's style and content approach.`
          },
          {
            role: 'user',
            content: `Please analyze this YouTube video and provide a comprehensive summary: ${body.youtube_url}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded, please try again later' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required, please add credits' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to analyze video', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content;

    if (!summary) {
      return new Response(
        JSON.stringify({ error: 'No summary generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Summary generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        summary: summary,
        youtube_url: body.youtube_url
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
