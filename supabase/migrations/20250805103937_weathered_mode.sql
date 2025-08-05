/*
  # Initial Schema Setup for Key Account Management Dashboard

  1. New Tables
    - `users` - Application users with roles and POC assignments
    - `excel_data` - Performance data imported from Excel files
    - `call_records` - Call interaction records with complaint tags
    - `user_queries` - User complaints and queries management
    - `retailer_tags` - User-retailer relationship tagging
    - `complaint_tags` - Configurable complaint categories
    - `branch_accounts` - Branch account management

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Admin users can access all data
    - Employee users can only access data for their assigned POC

  3. Enums
    - user_role: admin, employee
    - call_status: call connected, call not connected, switched off, call later
    - query_status: open, in-progress, resolved
*/

-- Create custom types/enums
CREATE TYPE user_role AS ENUM ('admin', 'employee');
CREATE TYPE call_status AS ENUM ('call connected', 'call not connected', 'switched off', 'call later');
CREATE TYPE query_status AS ENUM ('open', 'in-progress', 'resolved');

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'employee',
  name text NOT NULL,
  poc text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Excel data table
CREATE TABLE IF NOT EXISTS excel_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  date text NOT NULL,
  name text NOT NULL,
  poc text NOT NULL,
  potential numeric NOT NULL DEFAULT 0,
  last_30_days numeric NOT NULL DEFAULT 0,
  pro_rated_ach numeric NOT NULL DEFAULT 0,
  short_fall numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Call records table
CREATE TABLE IF NOT EXISTS call_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  status call_status NOT NULL,
  comment text DEFAULT '',
  complaint_tag text,
  timestamp text NOT NULL,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User queries table
CREATE TABLE IF NOT EXISTS user_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  user_name text NOT NULL,
  complaint_tag text NOT NULL,
  comment text DEFAULT '',
  status query_status NOT NULL DEFAULT 'open',
  timestamp text NOT NULL,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Retailer tags table
CREATE TABLE IF NOT EXISTS retailer_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL UNIQUE,
  user_name text NOT NULL,
  retailers text[] NOT NULL DEFAULT '{}',
  timestamp text NOT NULL,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Complaint tags table
CREATE TABLE IF NOT EXISTS complaint_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_name text UNIQUE NOT NULL,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Branch accounts table
CREATE TABLE IF NOT EXISTS branch_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  department text NOT NULL,
  role text NOT NULL,
  branch text NOT NULL,
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE excel_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users" ON users
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert users" ON users
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for excel_data table
CREATE POLICY "Admins can access all excel data" ON excel_data
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Employees can access POC data" ON excel_data
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'employee' 
      AND poc = excel_data.poc
    )
  );

-- RLS Policies for call_records table
CREATE POLICY "Admins can access all call records" ON call_records
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Employees can access POC call records" ON call_records
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN excel_data e ON e.user_id = call_records.user_id
      WHERE u.id = auth.uid() 
      AND u.role = 'employee' 
      AND u.poc = e.poc
    )
  );

CREATE POLICY "Authenticated users can insert call records" ON call_records
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- RLS Policies for user_queries table
CREATE POLICY "Admins can access all user queries" ON user_queries
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Employees can access POC user queries" ON user_queries
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN excel_data e ON e.user_id = user_queries.user_id
      WHERE u.id = auth.uid() 
      AND u.role = 'employee' 
      AND u.poc = e.poc
    )
  );

CREATE POLICY "Authenticated users can insert user queries" ON user_queries
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update user queries" ON user_queries
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

-- RLS Policies for retailer_tags table
CREATE POLICY "Admins can access all retailer tags" ON retailer_tags
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Employees can access POC retailer tags" ON retailer_tags
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN excel_data e ON e.user_id = retailer_tags.user_id
      WHERE u.id = auth.uid() 
      AND u.role = 'employee' 
      AND u.poc = e.poc
    )
  );

CREATE POLICY "Authenticated users can insert retailer tags" ON retailer_tags
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update retailer tags" ON retailer_tags
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

-- RLS Policies for complaint_tags table
CREATE POLICY "Everyone can read complaint tags" ON complaint_tags
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage complaint tags" ON complaint_tags
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for branch_accounts table
CREATE POLICY "Admins can access all branch accounts" ON branch_accounts
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_excel_data_user_id ON excel_data(user_id);
CREATE INDEX IF NOT EXISTS idx_excel_data_poc ON excel_data(poc);
CREATE INDEX IF NOT EXISTS idx_call_records_user_id ON call_records(user_id);
CREATE INDEX IF NOT EXISTS idx_call_records_created_by ON call_records(created_by);
CREATE INDEX IF NOT EXISTS idx_user_queries_user_id ON user_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_user_queries_status ON user_queries(status);
CREATE INDEX IF NOT EXISTS idx_retailer_tags_user_id ON retailer_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_poc ON users(poc);

-- Insert default complaint tags
INSERT INTO complaint_tags (tag_name, created_by) VALUES
  ('Validation Delay', (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
  ('Tracking Issue', (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
  ('Retailer not Live', (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
  ('Major cancellation : E Comm', (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
  ('Major cancellation : Finance', (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
  ('Better Rates on Competitors', (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
  ('Miscellaneous', (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
  ('Low Conversion on EK', (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
  ('Affiliaters Issue', (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
  ('Product Issue', (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
  ('Amazon Disapproval', (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
  ('Payment Related', (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
  ('Zero Comission', (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
  ('Other', (SELECT id FROM users WHERE role = 'admin' LIMIT 1)),
  ('Paid Posts', (SELECT id FROM users WHERE role = 'admin' LIMIT 1))
ON CONFLICT (tag_name) DO NOTHING;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_excel_data_updated_at BEFORE UPDATE ON excel_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_call_records_updated_at BEFORE UPDATE ON call_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_queries_updated_at BEFORE UPDATE ON user_queries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_retailer_tags_updated_at BEFORE UPDATE ON retailer_tags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_complaint_tags_updated_at BEFORE UPDATE ON complaint_tags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branch_accounts_updated_at BEFORE UPDATE ON branch_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();