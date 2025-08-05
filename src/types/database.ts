// Database types for Supabase integration
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          role: 'admin' | 'employee';
          name: string;
          poc: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          username: string;
          role: 'admin' | 'employee';
          name: string;
          poc?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          role?: 'admin' | 'employee';
          name?: string;
          poc?: string | null;
          updated_at?: string;
        };
      };
      excel_data: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          name: string;
          poc: string;
          potential: number;
          last_30_days: number;
          pro_rated_ach: number;
          short_fall: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          name: string;
          poc: string;
          potential: number;
          last_30_days: number;
          pro_rated_ach: number;
          short_fall: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          name?: string;
          poc?: string;
          potential?: number;
          last_30_days?: number;
          pro_rated_ach?: number;
          short_fall?: number;
          updated_at?: string;
        };
      };
      call_records: {
        Row: {
          id: string;
          user_id: string;
          status: 'call connected' | 'call not connected' | 'switched off' | 'call later';
          comment: string;
          complaint_tag: string | null;
          timestamp: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status: 'call connected' | 'call not connected' | 'switched off' | 'call later';
          comment: string;
          complaint_tag?: string | null;
          timestamp: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: 'call connected' | 'call not connected' | 'switched off' | 'call later';
          comment?: string;
          complaint_tag?: string | null;
          timestamp?: string;
          updated_at?: string;
        };
      };
      user_queries: {
        Row: {
          id: string;
          user_id: string;
          user_name: string;
          complaint_tag: string;
          comment: string;
          status: 'open' | 'in-progress' | 'resolved';
          timestamp: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          user_name: string;
          complaint_tag: string;
          comment: string;
          status?: 'open' | 'in-progress' | 'resolved';
          timestamp: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          user_name?: string;
          complaint_tag?: string;
          comment?: string;
          status?: 'open' | 'in-progress' | 'resolved';
          timestamp?: string;
          updated_at?: string;
        };
      };
      retailer_tags: {
        Row: {
          id: string;
          user_id: string;
          user_name: string;
          retailers: string[];
          timestamp: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          user_name: string;
          retailers: string[];
          timestamp: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          user_name?: string;
          retailers?: string[];
          timestamp?: string;
          updated_at?: string;
        };
      };
      complaint_tags: {
        Row: {
          id: string;
          tag_name: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tag_name: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tag_name?: string;
          updated_at?: string;
        };
      };
      branch_accounts: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          department: string;
          role: string;
          branch: string;
          username: string;
          password_hash: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          department: string;
          role: string;
          branch: string;
          username: string;
          password_hash: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string | null;
          department?: string;
          role?: string;
          branch?: string;
          username?: string;
          password_hash?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'admin' | 'employee';
      call_status: 'call connected' | 'call not connected' | 'switched off' | 'call later';
      query_status: 'open' | 'in-progress' | 'resolved';
    };
  };
}