-- Fix security vulnerability: Restrict access to user emails and co-author data

-- Drop the overly permissive policy that allows anyone to view all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;

-- Create a more restrictive policy that only allows users to view their own profile
-- and allows admins to view all profiles for management purposes
CREATE POLICY "Users can view own profile and admins can view all" 
ON public.users 
FOR SELECT 
USING (
  auth.uid() = auth_user_id OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- For co_authors table, restrict access to authenticated users only
-- Drop the current public policy
DROP POLICY IF EXISTS "Everyone can view active co-authors" ON public.co_authors;

-- Create a new policy that requires authentication to view co-authors
CREATE POLICY "Authenticated users can view active co-authors" 
ON public.co_authors 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND is_active = true
);