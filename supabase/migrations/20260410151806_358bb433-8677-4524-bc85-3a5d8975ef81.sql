CREATE TABLE public.motifs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  format text NOT NULL DEFAULT 'SVG',
  status text NOT NULL DEFAULT 'actif',
  svg_url text NOT NULL DEFAULT '',
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.motifs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active motifs"
ON public.motifs FOR SELECT
TO anon, authenticated
USING (status = 'actif');

CREATE POLICY "Authenticated users can insert motifs"
ON public.motifs FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own motifs"
ON public.motifs FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete own motifs"
ON public.motifs FOR DELETE
TO authenticated
USING (created_by = auth.uid());