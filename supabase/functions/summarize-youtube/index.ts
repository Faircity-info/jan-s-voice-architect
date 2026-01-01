import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const { youtube_url, video_title, creator_name } = await req.json();
    
    console.log('Request:', { youtube_url, video_title, creator_name });

    if (!youtube_url) {
      return new Response(
        JSON.stringify({ error: 'Missing youtube_url' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize YouTube URL
    let normalizedUrl = youtube_url.trim();
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = `https://www.youtube.com/watch?v=${normalizedUrl}`;
    }

    console.log('Calling Gemini API with YouTube URL:', normalizedUrl);

    const prompt = `Analyzuj toto YouTube video a vytvoř podrobné summary v češtině.

Název videa: ${video_title || 'neznámý'}
Autor: ${creator_name || 'neznámý'}

Zaměř se na:
- Hlavní téma a poselství videa
- Klíčové body, tipy a rady
- Zajímavé citáty nebo koncepty
- Unikátní frameworky nebo metodiky, které autor používá
- Styl prezentace autora

Odpověz pouze v češtině.`;

    // Use Gemini 2.5 Flash which handles YouTube videos natively
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  fileData: {
                    mimeType: "video/*",
                    fileUri: normalizedUrl
                  }
                },
                { text: prompt }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini response received');
    
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!summary) {
      console.error('No summary in response:', JSON.stringify(data, null, 2));
      throw new Error('No summary generated from Gemini');
    }

    console.log('Summary generated successfully, length:', summary.length);

    return new Response(
      JSON.stringify({ success: true, summary }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});