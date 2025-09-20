-- Create user_travel_guides table for storing AI-generated travel guides
CREATE TABLE public.user_travel_guides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  preferences_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_guide TEXT NOT NULL,
  model_used TEXT NOT NULL DEFAULT 'gpt-4',
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_travel_guides ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own travel guides" 
ON public.user_travel_guides 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own travel guides" 
ON public.user_travel_guides 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own travel guides" 
ON public.user_travel_guides 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own travel guides" 
ON public.user_travel_guides 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_travel_guides_updated_at
BEFORE UPDATE ON public.user_travel_guides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();