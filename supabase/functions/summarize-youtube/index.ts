import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Extract video ID from various YouTube URL formats
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Fetch YouTube transcript using the internal API
async function getYouTubeTranscript(videoId: string): Promise<string> {
  // First, get the video page to extract caption track info
  const videoPageResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept-Language': 'en-US,en;q=0.9,cs;q=0.8',
    }
  });
  
  const html = await videoPageResponse.text();
  
  // Extract captions data from the page
  const captionMatch = html.match(/"captions":\s*(\{[^}]+playerCaptionsTracklistRenderer[^}]+\})/);
  if (!captionMatch) {
    // Try alternative pattern
    const altMatch = html.match(/\"captionTracks\":(\[.*?\])/);
    if (!altMatch) {
      throw new Error('No captions available for this video');
    }
    
    const captionTracks = JSON.parse(altMatch[1]);
    if (captionTracks.length === 0) {
      throw new Error('No caption tracks found');
    }
    
    // Prefer Czech or English
    let selectedTrack = captionTracks.find((t: any) => t.languageCode === 'cs') ||
                        captionTracks.find((t: any) => t.languageCode === 'en') ||
                        captionTracks[0];
    
    const captionUrl = selectedTrack.baseUrl;
    const captionResponse = await fetch(captionUrl);
    const captionXml = await captionResponse.text();
    
    // Parse XML and extract text
    const textMatches = captionXml.matchAll(/<text[^>]*>([^<]*)<\/text>/g);
    const texts: string[] = [];
    for (const match of textMatches) {
      // Decode HTML entities
      const text = match[1]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n/g, ' ');
      texts.push(text);
    }
    
    return texts.join(' ');
  }
  
  throw new Error('Could not parse captions data');
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

    const { youtube_url, video_title, creator_name } = await req.json();
    
    console.log('Request:', { youtube_url, video_title, creator_name });

    if (!youtube_url) {
      return new Response(
        JSON.stringify({ error: 'Missing youtube_url' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const videoId = extractVideoId(youtube_url);
    if (!videoId) {
      return new Response(
        JSON.stringify({ error: 'Invalid YouTube URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching transcript for video:', videoId);
    
    let transcript: string;
    try {
      transcript = await getYouTubeTranscript(videoId);
      console.log('Transcript length:', transcript.length);
    } catch (transcriptError) {
      const errorMessage = transcriptError instanceof Error ? transcriptError.message : 'Unknown error';
      console.error('Transcript error:', errorMessage);
      return new Response(
        JSON.stringify({ error: `Could not get transcript: ${errorMessage}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send transcript to Gemini for summarization
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
            role: 'user',
            content: `Toto je transkript YouTube videa.
Název videa: ${video_title || 'neznámý'}
Autor: ${creator_name || 'neznámý'}

TRANSKRIPT:
${transcript}

---

Vytvoř z tohoto transkriptu podrobné summary v češtině. Zaměř se na:
- Hlavní téma a poselství videa
- Klíčové body, tipy a rady
- Zajímavé citáty nebo koncepty
- Unikátní frameworky nebo metodiky, které autor používá
- Styl prezentace autora`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error:', response.status, errorText);
      
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

    console.log('Summary generated successfully');

    return new Response(
      JSON.stringify({ success: true, summary, transcript_length: transcript.length }),
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
