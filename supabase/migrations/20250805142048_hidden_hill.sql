-- Fix RLS Policies to Resolve Infinite Recursion
-- Run this SQL script in your Supabase SQL Editor

-- Step 1: Drop all problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "example" ON public.users;
DROP POLICY IF EXISTS "Employees can access POC data" ON public.excel_data;

-- Step 2: Create a security definer function to safely check user roles
-- This function runs with elevated privileges and won't trigger RLS recursion
CREATE OR REPLACE FUNCTION auth.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.users WHERE id = auth.uid();
$$;

-- Step 3: Create a security definer function to safely get user POC
CREATE OR REPLACE FUNCTION auth.get_user_poc()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT poc FROM public.users WHERE id = auth.uid();
$$;

-- Step 4: Recreate users table policies using the security definer functions
CREATE POLICY "Admins can insert users" ON public.users
FOR INSERT 
TO authenticated
WITH CHECK (auth.get_user_role() = 'admin');

CREATE POLICY "Admins can read all users" ON public.users
FOR SELECT 
TO authenticated
USING (auth.get_user_role() = 'admin');

CREATE POLICY "Users can read own data" ON public.users
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
FOR UPDATE 
TO authenticated
USING (auth.uid() = id);

-- Step 5: Recreate excel_data policies without recursive queries
CREATE POLICY "Admins can access all excel data" ON public.excel_data
FOR ALL 
TO authenticated
USING (auth.get_user_role() = 'admin');

CREATE POLICY "Employees can access POC data" ON public.excel_data
FOR SELECT 
TO authenticated
USING (
  auth.get_user_role() = 'employee' 
  AND poc = auth.get_user_poc()
);

-- Step 6: Grant necessary permissions for the security definer functions
GRANT EXECUTE ON FUNCTION auth.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.get_user_poc() TO authenticated;

-- Step 7: Ensure RLS is enabled on both tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.excel_data ENABLE ROW LEVEL SECURITY;

-- Verification queries (optional - you can run these to check the policies)
-- SELECT * FROM pg_policies WHERE tablename IN ('users', 'excel_data');