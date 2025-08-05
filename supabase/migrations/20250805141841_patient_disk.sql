-- Fix RLS Policies to Resolve Infinite Recursion
-- Run this SQL in your Supabase SQL Editor

-- First, drop the problematic policies on users table
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "example" ON public.users;

-- Recreate the admin policies with proper role-based access
-- Note: These policies assume you have role information in your JWT claims
-- If you don't have role in JWT, you'll need to use a different approach

CREATE POLICY "Admins can insert users" ON public.users
FOR INSERT 
TO authenticated
WITH CHECK (
  -- Check if user has admin role in their JWT claims
  (auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin')
  OR
  -- Alternative: Check if user exists in users table with admin role (safer approach)
  (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'))
);

CREATE POLICY "Admins can read all users" ON public.users
FOR SELECT 
TO authenticated
USING (
  -- Check if user has admin role in their JWT claims
  (auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin')
  OR
  -- Alternative: Check if user exists in users table with admin role (safer approach)
  (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'))
);

-- Fix the excel_data policies to avoid recursive queries
DROP POLICY IF EXISTS "Employees can access POC data" ON public.excel_data;

-- Recreate the employee policy without recursive user table queries
CREATE POLICY "Employees can access POC data" ON public.excel_data
FOR SELECT 
TO authenticated
USING (
  -- Allow access if user is admin
  (auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin')
  OR
  -- Allow access if user's POC matches the excel_data POC
  -- This assumes POC information is stored in user metadata or you handle it differently
  (auth.jwt() ->> 'user_metadata' ->> 'poc' = excel_data.poc)
);

-- Alternative approach if you don't have POC in JWT:
-- You might need to create a function that safely gets user POC without causing recursion

-- Create a security definer function to safely get user POC
CREATE OR REPLACE FUNCTION get_user_poc()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT poc FROM users WHERE id = auth.uid() LIMIT 1;
$$;

-- Alternative policy using the function (use this if the above doesn't work)
/*
DROP POLICY IF EXISTS "Employees can access POC data" ON public.excel_data;

CREATE POLICY "Employees can access POC data" ON public.excel_data
FOR SELECT 
TO authenticated
USING (
  -- Allow access if user is admin (from JWT)
  (auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin')
  OR
  -- Allow access if user's POC matches using the safe function
  (get_user_poc() = excel_data.poc)
);
*/