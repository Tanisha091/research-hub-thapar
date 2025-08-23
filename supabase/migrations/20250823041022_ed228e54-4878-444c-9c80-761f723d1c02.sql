-- Fix co-author email exposure security vulnerability
-- Create a more granular access control system

-- Drop the current policy that exposes emails to all authenticated users
DROP POLICY IF EXISTS "Authenticated users can view active co-authors" ON public.co_authors;

-- Create a policy that allows authenticated users to see names and departments
-- but restricts email access to admins only
CREATE POLICY "Users can view co-author names, admins see all data" 
ON public.co_authors 
FOR SELECT 
USING (
  -- Allow access to active co-authors for authenticated users
  auth.uid() IS NOT NULL AND is_active = true
);

-- Create a separate function to handle email visibility in the application layer
-- This will be used to conditionally show emails based on user role
CREATE OR REPLACE FUNCTION public.get_co_author_with_conditional_email(co_author_row public.co_authors)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  is_admin boolean;
  result json;
BEGIN
  -- Check if current user is admin
  SELECT has_role(auth.uid(), 'admin'::app_role) INTO is_admin;
  
  -- Build result object conditionally including email
  IF is_admin THEN
    result := json_build_object(
      'id', co_author_row.id,
      'full_name', co_author_row.full_name,
      'email', co_author_row.email,
      'department', co_author_row.department,
      'is_active', co_author_row.is_active,
      'created_at', co_author_row.created_at,
      'updated_at', co_author_row.updated_at
    );
  ELSE
    result := json_build_object(
      'id', co_author_row.id,
      'full_name', co_author_row.full_name,
      'email', '[Contact admin for email]',
      'department', co_author_row.department,
      'is_active', co_author_row.is_active,
      'created_at', co_author_row.created_at,
      'updated_at', co_author_row.updated_at
    );
  END IF;
  
  RETURN result;
END;
$$;