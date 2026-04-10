
CREATE TABLE public.graduations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  svg_url TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'actif',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.graduations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active graduations"
ON public.graduations
FOR SELECT
TO anon, authenticated
USING (status = 'actif');

CREATE POLICY "Authenticated users can insert graduations"
ON public.graduations
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own graduations"
ON public.graduations
FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete own graduations"
ON public.graduations
FOR DELETE
TO authenticated
USING (created_by = auth.uid());
