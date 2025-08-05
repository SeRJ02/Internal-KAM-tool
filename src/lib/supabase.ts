import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

// Get environment variables with fallbacks and validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable. Please check your .env file.');
}

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable. Please check your .env file.');
}

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Auth helpers
export const auth = {
  signUp: async (email: string, password: string, userData: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { data, error };
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Database helpers
export const db = {
  // Excel data operations
  insertExcelData: async (data: Database['public']['Tables']['excel_data']['Insert'][]) => {
    const { data: result, error } = await supabase
      .from('excel_data')
      .insert(data)
      .select();
    return { data: result, error };
  },

  getExcelData: async (pocFilter?: string) => {
    let query = supabase.from('excel_data').select('*');
    
    if (pocFilter) {
      query = query.eq('poc', pocFilter);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },

  // Call records operations
  insertCallRecord: async (record: Database['public']['Tables']['call_records']['Insert']) => {
    const { data, error } = await supabase
      .from('call_records')
      .insert(record)
      .select()
      .single();
    return { data, error };
  },

  getCallRecords: async (userIds?: string[]) => {
    let query = supabase.from('call_records').select('*');
    
    if (userIds && userIds.length > 0) {
      query = query.in('user_id', userIds);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },

  // User queries operations
  insertUserQuery: async (query: Database['public']['Tables']['user_queries']['Insert']) => {
    const { data, error } = await supabase
      .from('user_queries')
      .insert(query)
      .select()
      .single();
    return { data, error };
  },

  getUserQueries: async (userIds?: string[]) => {
    let query = supabase.from('user_queries').select('*');
    
    if (userIds && userIds.length > 0) {
      query = query.in('user_id', userIds);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },

  updateQueryStatus: async (id: string, status: Database['public']['Tables']['user_queries']['Row']['status']) => {
    const { data, error } = await supabase
      .from('user_queries')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  // Retailer tags operations
  upsertRetailerTag: async (tag: Database['public']['Tables']['retailer_tags']['Insert']) => {
    const { data, error } = await supabase
      .from('retailer_tags')
      .upsert(tag, { onConflict: 'user_id' })
      .select()
      .single();
    return { data, error };
  },

  getRetailerTags: async (userIds?: string[]) => {
    let query = supabase.from('retailer_tags').select('*');
    
    if (userIds && userIds.length > 0) {
      query = query.in('user_id', userIds);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },

  // Complaint tags operations
  getComplaintTags: async () => {
    const { data, error } = await supabase
      .from('complaint_tags')
      .select('*')
      .order('tag_name');
    return { data, error };
  },

  insertComplaintTag: async (tagName: string, createdBy: string) => {
    const { data, error } = await supabase
      .from('complaint_tags')
      .insert({ tag_name: tagName, created_by: createdBy })
      .select()
      .single();
    return { data, error };
  },

  deleteComplaintTag: async (id: string) => {
    const { error } = await supabase
      .from('complaint_tags')
      .delete()
      .eq('id', id);
    return { error };
  },

  // Branch accounts operations
  insertBranchAccount: async (account: Database['public']['Tables']['branch_accounts']['Insert']) => {
    const { data, error } = await supabase
      .from('branch_accounts')
      .insert(account)
      .select()
      .single();
    return { data, error };
  },

  getBranchAccounts: async () => {
    const { data, error } = await supabase
      .from('branch_accounts')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // User profile operations
  insertUser: async (userData: {
    id: string;
    email: string;
    username: string;
    name: string;
    role?: 'admin' | 'employee';
    poc?: string;
  }) => {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userData.id,
        email: userData.email,
        username: userData.username,
        name: userData.name,
        role: userData.role || 'employee',
        poc: userData.poc || userData.name,
      })
      .select()
      .single();
    return { data, error };
  },

  getUserProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  }
};