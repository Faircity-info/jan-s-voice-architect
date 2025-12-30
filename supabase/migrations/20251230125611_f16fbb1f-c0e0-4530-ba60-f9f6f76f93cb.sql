
-- Change field to array for multiple selection
ALTER TABLE public.reference_creators 
ALTER COLUMN field TYPE text[] USING CASE WHEN field IS NOT NULL THEN ARRAY[field] ELSE NULL END;

-- Create table for storing creator content/posts
CREATE TABLE public.creator_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES public.reference_creators(id) ON DELETE CASCADE,
  platform TEXT NOT NULL DEFAULT 'X',
  content TEXT NOT NULL,
  source_url TEXT,
  posted_at TIMESTAMP WITH TIME ZONE,
  key_insights TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creator_content ENABLE ROW LEVEL SECURITY;

-- Create policy for all operations
CREATE POLICY "Allow all operations on creator_content" 
ON public.creator_content 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create index for faster lookups by creator and platform
CREATE INDEX idx_creator_content_creator_id ON public.creator_content(creator_id);
CREATE INDEX idx_creator_content_platform ON public.creator_content(platform);
