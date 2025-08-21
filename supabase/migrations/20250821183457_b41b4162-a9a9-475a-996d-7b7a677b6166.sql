-- Create department enum
CREATE TYPE public.department_type AS ENUM ('csed', 'eced', 'mced', 'eid', 'med', 'btd', 'ees', 'ced');

-- Create users/profiles table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  department department_type,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create co_authors table for predefined co-authors
CREATE TABLE public.co_authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  department department_type,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add new fields to research_papers table
ALTER TABLE public.research_papers 
ADD COLUMN department department_type,
ADD COLUMN publish_date DATE,
ADD COLUMN co_author_ids UUID[] DEFAULT '{}';

-- Enable RLS on new tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.co_authors ENABLE ROW LEVEL SECURITY;

-- RLS policies for users table
CREATE POLICY "Users can view all profiles" 
ON public.users FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.users FOR INSERT 
WITH CHECK (auth.uid() = auth_user_id);

-- RLS policies for co_authors table
CREATE POLICY "Everyone can view active co-authors" 
ON public.co_authors FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage co-authors" 
ON public.co_authors FOR ALL 
USING (has_role(auth.uid(), 'admin'));

-- Insert some predefined co-authors
INSERT INTO public.co_authors (full_name, email, department) VALUES
('Dr. Rajesh Kumar', 'rajesh.kumar@thapar.edu', 'csed'),
('Dr. Priya Sharma', 'priya.sharma@thapar.edu', 'eced'),
('Dr. Amit Singh', 'amit.singh@thapar.edu', 'mced'),
('Dr. Sunita Gupta', 'sunita.gupta@thapar.edu', 'eid'),
('Dr. Vinod Prakash', 'vinod.prakash@thapar.edu', 'med'),
('Dr. Neha Agarwal', 'neha.agarwal@thapar.edu', 'btd'),
('Dr. Rohit Verma', 'rohit.verma@thapar.edu', 'ees'),
('Dr. Kavita Rani', 'kavita.rani@thapar.edu', 'ced'),
('Dr. Manish Jain', 'manish.jain@thapar.edu', 'csed'),
('Dr. Sakshi Kaushal', 'sakshi.kaushal@thapar.edu', 'eced');

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_co_authors_updated_at
  BEFORE UPDATE ON public.co_authors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();