-- Fix RLS Policies to Resolve Infinite Recursion
-- This script removes problematic policies and creates new ones that don't cause recursion

-- First, drop all existing problematic policies
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "example" ON public.users;
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Admins can access all excel data" ON public.excel_data;
DROP POLICY IF EXISTS "Employees can access POC data" ON public.excel_data;

-- Create a security definer function to safely get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.users WHERE id = auth.uid();
$$;

-- Create a security definer function to safely get user POC
CREATE OR REPLACE FUNCTION public.get_user_poc()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT poc FROM public.users WHERE id = auth.uid();
$$;

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_poc() TO authenticated;

-- Recreate users table policies using the safe functions
CREATE POLICY "Admins can insert users" ON public.users
FOR INSERT 
TO authenticated
WITH CHECK (public.get_user_role() = 'admin');

CREATE POLICY "Admins can read all users" ON public.users
FOR SELECT 
TO authenticated
USING (public.get_user_role() = 'admin');

CREATE POLICY "Users can read own data" ON public.users
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Recreate excel_data policies using the safe functions
CREATE POLICY "Admins can access all excel data" ON public.excel_data
FOR ALL 
TO authenticated
USING (public.get_user_role() = 'admin');

CREATE POLICY "Employees can access POC data" ON public.excel_data
FOR SELECT 
TO authenticated
USING (
  public.get_user_role() = 'employee' 
  AND public.get_user_poc() = poc
);

-- Fix other table policies that might have similar issues
-- Call records policies
DROP POLICY IF EXISTS "Admins can access all call records" ON public.call_records;
DROP POLICY IF EXISTS "Authenticated users can insert call records" ON public.call_records;
DROP POLICY IF EXISTS "Employees can access POC call records" ON public.call_records;

CREATE POLICY "Admins can access all call records" ON public.call_records
FOR ALL 
TO authenticated
USING (public.get_user_role() = 'admin');

CREATE POLICY "Authenticated users can insert call records" ON public.call_records
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Employees can access POC call records" ON public.call_records
FOR SELECT 
TO authenticated
USING (
  public.get_user_role() = 'employee' 
  AND EXISTS (
    SELECT 1 FROM public.excel_data 
    WHERE excel_data.user_id = call_records.user_id 
    AND excel_data.poc = public.get_user_poc()
  )
);

-- User queries policies
DROP POLICY IF EXISTS "Admins can access all user queries" ON public.user_queries;
DROP POLICY IF EXISTS "Authenticated users can insert user queries" ON public.user_queries;
DROP POLICY IF EXISTS "Authenticated users can update user queries" ON public.user_queries;
DROP POLICY IF EXISTS "Employees can access POC user queries" ON public.user_queries;

CREATE POLICY "Admins can access all user queries" ON public.user_queries
FOR ALL 
TO authenticated
USING (public.get_user_role() = 'admin');

CREATE POLICY "Authenticated users can insert user queries" ON public.user_queries
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update user queries" ON public.user_queries
FOR UPDATE 
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Employees can access POC user queries" ON public.user_queries
FOR SELECT 
TO authenticated
USING (
  public.get_user_role() = 'employee' 
  AND EXISTS (
    SELECT 1 FROM public.excel_data 
    WHERE excel_data.user_id = user_queries.user_id 
    AND excel_data.poc = public.get_user_poc()
  )
);

-- Retailer tags policies
DROP POLICY IF EXISTS "Admins can access all retailer tags" ON public.retailer_tags;
DROP POLICY IF EXISTS "Authenticated users can insert retailer tags" ON public.retailer_tags;
DROP POLICY IF EXISTS "Authenticated users can update retailer tags" ON public.retailer_tags;
DROP POLICY IF EXISTS "Employees can access POC retailer tags" ON public.retailer_tags;

CREATE POLICY "Admins can access all retailer tags" ON public.retailer_tags
FOR ALL 
TO authenticated
USING (public.get_user_role() = 'admin');

CREATE POLICY "Authenticated users can insert retailer tags" ON public.retailer_tags
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update retailer tags" ON public.retailer_tags
FOR UPDATE 
TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Employees can access POC retailer tags" ON public.retailer_tags
FOR SELECT 
TO authenticated
USING (
  public.get_user_role() = 'employee' 
  AND EXISTS (
    SELECT 1 FROM public.excel_data 
    WHERE excel_data.user_id = retailer_tags.user_id 
    AND excel_data.poc = public.get_user_poc()
  )
);

-- Branch accounts policies (admin only)
DROP POLICY IF EXISTS "Admins can access all branch accounts" ON public.branch_accounts;

CREATE POLICY "Admins can access all branch accounts" ON public.branch_accounts
FOR ALL 
TO authenticated
USING (public.get_user_role() = 'admin');

-- Complaint tags policies
DROP POLICY IF EXISTS "Admins can manage complaint tags" ON public.complaint_tags;
DROP POLICY IF EXISTS "Everyone can read complaint tags" ON public.complaint_tags;

CREATE POLICY "Admins can manage complaint tags" ON public.complaint_tags
FOR ALL 
TO authenticated
USING (public.get_user_role() = 'admin');

CREATE POLICY "Everyone can read complaint tags" ON public.complaint_tags
FOR SELECT 
TO authenticated
USING (true);