import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AddContentRequest {
  creator_name: string;
  summary: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: AddContentRequest = await req.json();
    
    console.log('Received request:', JSON.stringify(body, null, 2));

    // Validate required fields
    if (!body.creator_name || !body.summary) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          required: ['creator_name', 'summary'],
          received: { creator_name: !!body.creator_name, summary: !!body.summary }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the creator by name (case-insensitive partial match)
    const { data: creators, error: creatorError } = await supabase
      .from('reference_creators')
      .select('id, name')
      .ilike('name', `%${body.creator_name}%`);

    if (creatorError) {
      console.error('Error finding creator:', creatorError);
      return new Response(
        JSON.stringify({ error: 'Database error while finding creator', details: creatorError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!creators || creators.length === 0) {
      console.error('Creator not found:', body.creator_name);
      return new Response(
        JSON.stringify({ 
          error: 'Creator not found',
          searched_for: body.creator_name,
          hint: 'Make sure the creator exists in reference_creators table'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (creators.length > 1) {
      console.warn('Multiple creators found, using first match:', creators.map(c => c.name));
    }

    const creator = creators[0];
    console.log('Found creator:', creator.name, 'with id:', creator.id);

    // Insert the new content
    const { data: newContent, error: insertError } = await supabase
      .from('creator_content')
      .insert({
        creator_id: creator.id,
        content: body.summary,
        platform: 'YouTube',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting content:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to insert content', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully added content:', newContent.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Content added to ${creator.name}`,
        content_id: newContent.id,
        creator: {
          id: creator.id,
          name: creator.name
        }
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
