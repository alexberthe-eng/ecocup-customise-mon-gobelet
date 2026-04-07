
-- Table for shared design snapshots
CREATE TABLE public.shared_designs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  design_name TEXT NOT NULL DEFAULT 'Design',
  cup_color TEXT NOT NULL DEFAULT '#f2f2f2',
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days')
);

-- Public read access (anyone with the link can view)
ALTER TABLE public.shared_designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shared designs"
  ON public.shared_designs
  FOR SELECT
  TO anon, authenticated
  USING (expires_at > now());

-- Anyone can create a share link (no auth required for sharing)
CREATE POLICY "Anyone can create shared designs"
  ON public.shared_designs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Storage bucket for shared design images
INSERT INTO storage.buckets (id, name, public)
VALUES ('shared-designs', 'shared-designs', true);

-- Allow anyone to upload to shared-designs bucket
CREATE POLICY "Anyone can upload shared design images"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'shared-designs');

-- Allow anyone to view shared design images
CREATE POLICY "Anyone can view shared design images"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'shared-designs');
