import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Model fallback chain: start with fast model, escalate to larger if needed
const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-pro'
];

async function callGeminiWithModel(
  model: string,
  normalizedUrl: string,
  prompt: string,
  GEMINI_API_KEY: string
): Promise<{ success: boolean; summary?: string; error?: string; shouldRetry: boolean }> {
  console.log(`Trying model: ${model}`);
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
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
      console.error(`Model ${model} error:`, response.status, errorText);
      
      // Check if error suggests we should try a larger model
      const shouldRetry = response.status === 400 || 
                          response.status === 413 || 
                          response.status === 500 ||
                          errorText.includes('too large') ||
                          errorText.includes('exceeds') ||
                          errorText.includes('token') ||
                          errorText.includes('limit');
      
      return { success: false, error: errorText, shouldRetry };
    }

    const data = await response.json();
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!summary) {
      console.error(`Model ${model}: No summary in response`);
      return { success: false, error: 'No summary generated', shouldRetry: true };
    }

    console.log(`Model ${model} succeeded, summary length:`, summary.length);
    return { success: true, summary, shouldRetry: false };
    
  } catch (error) {
    console.error(`Model ${model} exception:`, error);
    return { success: false, error: String(error), shouldRetry: true };
  }
}

async function processYouTubeVideo(
  youtube_url: string,
  video_title: string,
  creator_name: string,
  GEMINI_API_KEY: string,
  supabaseUrl: string,
  supabaseKey: string
) {
  console.log('Background processing started for:', youtube_url);
  
  try {
    // Normalize YouTube URL
    let normalizedUrl = youtube_url.trim();
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = `https://www.youtube.com/watch?v=${normalizedUrl}`;
    }

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

    // Try models in order, escalating to larger models on failure
    let summary: string | null = null;
    
    for (const model of MODELS) {
      const result = await callGeminiWithModel(model, normalizedUrl, prompt, GEMINI_API_KEY);
      
      if (result.success && result.summary) {
        summary = result.summary;
        console.log(`Successfully processed with model: ${model}`);
        break;
      }
      
      if (!result.shouldRetry) {
        console.log(`Model ${model} failed with non-retryable error, stopping`);
        break;
      }
      
      console.log(`Model ${model} failed, trying next model...`);
    }

    if (!summary) {
      console.error('All models failed to process video, giving up silently');
      return;
    }

    // Save to database
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find creator by name (case-insensitive partial match)
    const { data: creators, error: findError } = await supabase
      .from('reference_creators')
      .select('id, name')
      .ilike('name', `%${creator_name}%`)
      .limit(1);

    if (findError) {
      console.error('Error finding creator:', findError);
      return;
    }

    if (!creators || creators.length === 0) {
      console.log('Creator not found, creating new one:', creator_name);
      
      // Create new creator
      const { data: newCreator, error: createError } = await supabase
        .from('reference_creators')
        .insert({
          name: creator_name,
          youtube: true,
          analyzed: false
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating creator:', createError);
        return;
      }

      // Add content for new creator
      const { error: insertError } = await supabase
        .from('creator_content')
        .insert({
          creator_id: newCreator.id,
          content: summary,
          platform: 'YouTube',
          source_url: normalizedUrl,
          key_insights: video_title
        });

      if (insertError) {
        console.error('Error inserting content:', insertError);
      } else {
        console.log('Content saved for new creator:', creator_name);
      }
    } else {
      // Add content for existing creator
      const { error: insertError } = await supabase
        .from('creator_content')
        .insert({
          creator_id: creators[0].id,
          content: summary,
          platform: 'YouTube',
          source_url: normalizedUrl,
          key_insights: video_title
        });

      if (insertError) {
        console.error('Error inserting content:', insertError);
      } else {
        console.log('Content saved for creator:', creators[0].name);
      }
    }

  } catch (error) {
    console.error('Background processing error:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration missing');
    }

    const { youtube_url, video_title, creator_name } = await req.json();
    
    console.log('Request received:', { youtube_url, video_title, creator_name });

    if (!youtube_url) {
      return new Response(
        JSON.stringify({ error: 'Missing youtube_url' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!creator_name) {
      return new Response(
        JSON.stringify({ error: 'Missing creator_name' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Start background processing (non-blocking)
    // @ts-ignore - EdgeRuntime is available in Supabase Edge Functions
    (globalThis as any).EdgeRuntime?.waitUntil?.(
      processYouTubeVideo(
        youtube_url,
        video_title || '',
        creator_name,
        GEMINI_API_KEY,
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY
      )
    ) ?? processYouTubeVideo(
      youtube_url,
      video_title || '',
      creator_name,
      GEMINI_API_KEY,
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );

    // Return immediately
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Video processing started. Summary will be saved to database when complete.',
        youtube_url,
        creator_name
      }),
      { status: 202, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});