-- Add google_scholar_id column to users table
ALTER TABLE public.users 
ADD COLUMN google_scholar_id text;