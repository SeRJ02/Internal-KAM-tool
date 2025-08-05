import { v4 as uuidv4 } from 'uuid';
import { Database } from '../types/database';

// Transform Excel data for Supabase
export const transformExcelDataForSupabase = (
  excelData: any[],
  createdBy?: string
): Database['public']['Tables']['excel_data']['Insert'][] => {
  return excelData.map(item => ({
    user_id: String(item.UserID),
    date: item.Date,
    name: item.Name,
    poc: item.POC,
    potential: Number(item.Potential),
    last_30_days: Number(item['Last 30 days']),
    pro_rated_ach: Number(item.ProRatedAch),
    short_fall: Number(item.ShortFall),
  }));
};

// Transform call record for Supabase
export const transformCallRecordForSupabase = (
  callRecord: any,
  createdBy: string
): Database['public']['Tables']['call_records']['Insert'] => {
  return {
    id: uuidv4(),
    user_id: callRecord.userId,
    status: callRecord.status,
    comment: callRecord.comment || '',
    complaint_tag: callRecord.complaintTag || null,
    timestamp: callRecord.timestamp,
    created_by: createdBy,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

// Transform user query for Supabase
export const transformUserQueryForSupabase = (
  userQuery: any,
  createdBy: string
): Database['public']['Tables']['user_queries']['Insert'] => {
  return {
    id: userQuery.id || uuidv4(),
    user_id: userQuery.userId,
    user_name: userQuery.userName,
    complaint_tag: userQuery.complaintTag,
    comment: userQuery.comment || '',
    status: userQuery.status || 'open',
    timestamp: userQuery.timestamp,
    created_by: createdBy,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

// Transform retailer tag for Supabase
export const transformRetailerTagForSupabase = (
  retailerTag: any,
  createdBy: string
): Database['public']['Tables']['retailer_tags']['Insert'] => {
  return {
    id: uuidv4(),
    user_id: retailerTag.userId,
    user_name: retailerTag.userName,
    retailers: retailerTag.retailers,
    timestamp: retailerTag.timestamp,
    created_by: createdBy,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

// Transform branch account for Supabase
export const transformBranchAccountForSupabase = (
  account: any,
  createdBy: string
): Database['public']['Tables']['branch_accounts']['Insert'] => {
  return {
    id: uuidv4(),
    first_name: account.firstName,
    last_name: account.lastName,
    email: account.email,
    phone: account.phone || null,
    department: account.department,
    role: account.role,
    branch: account.branch,
    username: account.username,
    password_hash: account.password, // In production, this should be hashed
    created_by: createdBy,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

// Transform Supabase data back to frontend format
export const transformSupabaseToExcelData = (
  supabaseData: Database['public']['Tables']['excel_data']['Row'][]
) => {
  return supabaseData.map(item => ({
    UserID: item.user_id,
    Date: item.date,
    Name: item.name,
    POC: item.poc,
    Potential: item.potential,
    'Last 30 days': item.last_30_days,
    ProRatedAch: item.pro_rated_ach,
    ShortFall: item.short_fall
  }));
};

export const transformSupabaseToCallRecord = (
  supabaseData: Database['public']['Tables']['call_records']['Row'][]
) => {
  return supabaseData.map(item => ({
    userId: item.user_id,
    status: item.status,
    comment: item.comment,
    complaintTag: item.complaint_tag,
    timestamp: item.timestamp
  }));
};

export const transformSupabaseToUserQuery = (
  supabaseData: Database['public']['Tables']['user_queries']['Row'][]
) => {
  return supabaseData.map(item => ({
    id: item.id,
    userId: item.user_id,
    userName: item.user_name,
    complaintTag: item.complaint_tag,
    comment: item.comment,
    status: item.status,
    timestamp: item.timestamp
  }));
};

export const transformSupabaseToRetailerTag = (
  supabaseData: Database['public']['Tables']['retailer_tags']['Row'][]
) => {
  return supabaseData.map(item => ({
    userId: item.user_id,
    userName: item.user_name,
    retailers: item.retailers,
    timestamp: item.timestamp
  }));
};