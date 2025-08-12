-- Create enum for paper status
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'paper_status_type') THEN
    CREATE TYPE public.paper_status_type AS ENUM ('published', 'in-review', 'draft');
  END IF;
END $$;

-- Create research_papers table
CREATE TABLE IF NOT EXISTS public.research_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paper_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  collaborators TEXT[] NOT NULL DEFAULT '{}',
  issue_date DATE NOT NULL,
  status public.paper_status_type NOT NULL DEFAULT 'in-review',
  keywords TEXT[] NOT NULL DEFAULT '{}',
  pdf_path TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.research_papers ENABLE ROW LEVEL SECURITY;

-- Roles enum and user_roles table
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Basic RLS for user_roles: users can see their own roles
DROP POLICY IF EXISTS "Users can view their roles" ON public.user_roles;
CREATE POLICY "Users can view their roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policies for research_papers
DROP POLICY IF EXISTS "Public can view published papers" ON public.research_papers;
CREATE POLICY "Public can view published papers"
ON public.research_papers
FOR SELECT
USING (status = 'published' OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Owners can view their papers" ON public.research_papers;
CREATE POLICY "Owners can view their papers"
ON public.research_papers
FOR SELECT
TO authenticated
USING (auth.uid() = owner OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Owners can insert their papers" ON public.research_papers;
CREATE POLICY "Owners can insert their papers"
ON public.research_papers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Owners can update their papers" ON public.research_papers;
CREATE POLICY "Owners can update their papers"
ON public.research_papers
FOR UPDATE
TO authenticated
USING (auth.uid() = owner OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = owner OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Owners can delete their papers" ON public.research_papers;
CREATE POLICY "Owners can delete their papers"
ON public.research_papers
FOR DELETE
TO authenticated
USING (auth.uid() = owner OR public.has_role(auth.uid(), 'admin'));

-- Timestamp update trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_research_papers_updated_at ON public.research_papers;
CREATE TRIGGER trg_research_papers_updated_at
BEFORE UPDATE ON public.research_papers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_research_papers_status ON public.research_papers(status);
CREATE INDEX IF NOT EXISTS idx_research_papers_issue_date ON public.research_papers(issue_date);
CREATE INDEX IF NOT EXISTS idx_research_papers_keywords ON public.research_papers USING GIN (keywords);

-- Create storage bucket for PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('papers', 'papers', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for 'papers' bucket
DROP POLICY IF EXISTS "Public can read papers" ON storage.objects;
CREATE POLICY "Public can read papers"
ON storage.objects FOR SELECT
USING (bucket_id = 'papers');

DROP POLICY IF EXISTS "Users can upload to their folder" ON storage.objects;
CREATE POLICY "Users can upload to their folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'papers' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can update files in their folder" ON storage.objects;
CREATE POLICY "Users can update files in their folder"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'papers' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'papers' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete files in their folder" ON storage.objects;
CREATE POLICY "Users can delete files in their folder"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'papers' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
