-- Create update_updated_at_column function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Table for storing Jan's style guide/voice document
CREATE TABLE public.style_guide (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for storing successful historical posts
CREATE TABLE public.historical_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL DEFAULT 'LinkedIn',
  content TEXT NOT NULL,
  performance_notes TEXT,
  posted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for generated posts with feedback for learning loop
CREATE TABLE public.generated_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  prompt_used TEXT,
  style_guide_version INTEGER,
  platform TEXT NOT NULL DEFAULT 'LinkedIn',
  status TEXT NOT NULL DEFAULT 'draft',
  was_published BOOLEAN DEFAULT false,
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  user_feedback TEXT,
  performance_metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.style_guide ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historical_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_posts ENABLE ROW LEVEL SECURITY;

-- Public read/write policies (single-tenant app for Jan)
CREATE POLICY "Allow all operations on style_guide" ON public.style_guide FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on historical_posts" ON public.historical_posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on generated_posts" ON public.generated_posts FOR ALL USING (true) WITH CHECK (true);

-- Trigger for updated_at on style_guide
CREATE TRIGGER update_style_guide_updated_at
  BEFORE UPDATE ON public.style_guide
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();