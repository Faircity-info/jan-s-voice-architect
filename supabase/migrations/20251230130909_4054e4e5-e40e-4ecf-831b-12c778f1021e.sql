-- Add content_notes column to reference_creators for storing creator content as single text
ALTER TABLE public.reference_creators 
ADD COLUMN content_notes text;