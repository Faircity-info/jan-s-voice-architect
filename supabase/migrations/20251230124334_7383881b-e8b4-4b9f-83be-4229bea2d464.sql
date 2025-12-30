-- Create table for tracking reference creators/influencers
CREATE TABLE public.reference_creators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  youtube BOOLEAN DEFAULT false,
  instagram BOOLEAN DEFAULT false,
  linkedin BOOLEAN DEFAULT false,
  x_twitter BOOLEAN DEFAULT false,
  spotify BOOLEAN DEFAULT false,
  field TEXT,
  priority TEXT CHECK (priority IN ('VELMI VYSOKÁ', 'Vysoká', 'Střední', 'Nízká')),
  notes TEXT,
  analyzed BOOLEAN DEFAULT false,
  style_profile JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reference_creators ENABLE ROW LEVEL SECURITY;

-- Create policy for all operations (single tenant app)
CREATE POLICY "Allow all operations on reference_creators" 
ON public.reference_creators 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_reference_creators_updated_at
BEFORE UPDATE ON public.reference_creators
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();