-- Fix security issues: co-author email exposure and public storage bucket

-- 1. Create a secure view for co-authors that only exposes safe fields to non-admins
CREATE OR REPLACE VIEW public.co_authors_safe AS
SELECT 
  id,
  full_name,
  department,
  is_active,
  created_at,
  updated_at,
  CASE 
    WHEN has_role(auth.uid(), 'admin'::app_role) THEN email
    ELSE '[Contact admin for email]'
  END as email
FROM public.co_authors
WHERE is_active = true;

-- 2. Drop existing overly permissive RLS policies on co_authors
DROP POLICY IF EXISTS "Users can view co-author names, admins see all data" ON public.co_authors;
DROP POLICY IF EXISTS "Admins can view all co-authors" ON public.co_authors;

-- 3. Create restrictive RLS policy on co_authors table
-- Only admins can view full co_authors table data directly
CREATE POLICY "Admins can view all co-authors"
ON public.co_authors
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Grant access to the safe view for authenticated users
GRANT SELECT ON public.co_authors_safe TO authenticated;
GRANT SELECT ON public.co_authors_safe TO anon;

-- 5. Make the papers storage bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'papers';

-- 6. Drop existing storage policies for papers bucket
DROP POLICY IF EXISTS "Users can upload their own papers" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own papers" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own papers" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view papers" ON storage.objects;
DROP POLICY IF EXISTS "Public can view papers" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload papers in their folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view accessible papers" ON storage.objects;
DROP POLICY IF EXISTS "Public can view published papers" ON storage.objects;

-- 7. Create secure storage RLS policies
-- Allow users to upload papers in their own folder
CREATE POLICY "Users can upload papers in their folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'papers' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own papers
CREATE POLICY "Users can update their own papers"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'papers' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own papers
CREATE POLICY "Users can delete their own papers"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'papers' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own papers OR published papers
CREATE POLICY "Users can view accessible papers"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'papers' AND
  (
    -- Own papers
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- Admins can see all
    has_role(auth.uid(), 'admin'::app_role)
    OR
    -- Published papers (check research_papers table)
    EXISTS (
      SELECT 1 FROM public.research_papers
      WHERE pdf_path = name
      AND status = 'published'::paper_status_type
    )
  )
);

-- Allow anonymous users to view published papers only
CREATE POLICY "Public can view published papers"
ON storage.objects
FOR SELECT
TO anon
USING (
  bucket_id = 'papers' AND
  EXISTS (
    SELECT 1 FROM public.research_papers
    WHERE pdf_path = name
    AND status = 'published'::paper_status_type
  )
);