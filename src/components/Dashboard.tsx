import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import CreateAccountModal from './CreateAccountModal';
import DashboardContent from './DashboardContent';
import ExcelImport from './ExcelImport';
import DataTable from './DataTable';
import AnalyticsContent from './AnalyticsContent';
import UserQueriesContent from './UserQueriesContent';
import RetailerTagging from './RetailerTagging';
import UserDataManagement from './UserDataManagement';
import ComplaintTagsManagement from './ComplaintTagsManagement';

interface ExcelData {
  UserID: string;
  Date: string;
  Name: string;
  POC: string;
  Potential: number;
  'Last 30 days': number;
  ProRatedAch: number;
  ShortFall: number;
}

interface CallRecord {
  userId: string;
  status: 'call connected' | 'call not connected' | 'switched off' | 'call later';
  comment: string;
  timestamp: string;
}

interface UserQuery {
  id: string;
  userId: string;
  userName: string;
  complaintTag: string;
  comment: string;
  timestamp: string;
  status: 'open' | 'in-progress' | 'resolved';
}

interface RetailerTag {
  userId: string;
  userName: string;
  retailers: string[];
  timestamp: string;
}

interface BranchAccount {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  branch: string;
  username: string;
  password: string;
  confirmPassword: string;
}

interface DashboardProps {
  user: any;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState(false);
  const [isExcelImportOpen, setIsExcelImportOpen] = useState(false);
  const [excelData, setExcelData] = useState<ExcelData[]>(() => {
    try {
      const savedData = localStorage.getItem('kam-excel-data');
      return savedData ? JSON.parse(savedData) : [];
    } catch (error) {
      console.error('Error loading excel data from localStorage:', error);
      return [];
    }
  });
  const [branchAccounts, setBranchAccounts] = useState<BranchAccount[]>(() => {
    try {
      const savedAccounts = localStorage.getItem('kam-branch-accounts');
      return savedAccounts ? JSON.parse(savedAccounts) : [];
    } catch (error) {
      console.error('Error loading branch accounts from localStorage:', error);
      return [];
    }
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'data' | 'analytics' | 'queries' | 'retailer-tagging' | 'user-data' | 'complaint-tags'>('dashboard');
  const [callRecords, setCallRecords] = useState<CallRecord[]>(() => {
    try {
      const savedRecords = localStorage.getItem('kam-call-records');
      return savedRecords ? JSON.parse(savedRecords) : [];
    } catch (error) {
      console.error('Error loading call records from localStorage:', error);
      return [];
    }
  });
  const [userQueries, setUserQueries] = useState<UserQuery[]>(() => {
    try {
      const savedQueries = localStorage.getItem('kam-user-queries');
      return savedQueries ? JSON.parse(savedQueries) : [];
    } catch (error) {
      console.error('Error loading user queries from localStorage:', error);
      return [];
    }
  });
  const [retailerTags, setRetailerTags] = useState<RetailerTag[]>(() => {
    try {
      const savedTags = localStorage.getItem('kam-retailer-tags');
      return savedTags ? JSON.parse(savedTags) : [];
    } catch (error) {
      console.error('Error loading retailer tags from localStorage:', error);
      return [];
    }
  });

  // Filtered data based on user role and POC
  const [filteredExcelData, setFilteredExcelData] = useState<ExcelData[]>([]);
  const [filteredCallRecords, setFilteredCallRecords] = useState<CallRecord[]>([]);
  const [filteredUserQueries, setFilteredUserQueries] = useState<UserQuery[]>([]);
  const [filteredRetailerTags, setFilteredRetailerTags] = useState<RetailerTag[]>([]);

  // Save excel data to localStorage whenever it changes
  React.useEffect(() => {
    try {
      localStorage.setItem('kam-excel-data', JSON.stringify(excelData));
    } catch (error) {
      console.error('Error saving excel data to localStorage:', error);
    }
  }, [excelData]);

  // Filter data based on user role and POC
  React.useEffect(() => {
    if (user.role === 'admin') {
      // Admin sees all data
      setFilteredExcelData(excelData);
      setFilteredCallRecords(callRecords);
      setFilteredUserQueries(userQueries);
      setFilteredRetailerTags(retailerTags);
    } else if (user.role === 'employee' && user.poc) {
      // Employee sees only data for their POC
      const pocExcelData = excelData.filter(item => item.POC === user.poc);
      const pocUserIds = new Set(pocExcelData.map(item => item.UserID));
      
      setFilteredExcelData(pocExcelData);
      setFilteredCallRecords(callRecords.filter(record => pocUserIds.has(record.userId)));
      setFilteredUserQueries(userQueries.filter(query => pocUserIds.has(query.userId)));
      setFilteredRetailerTags(retailerTags.filter(tag => pocUserIds.has(tag.userId)));
    } else {
      // Default: no data
      setFilteredExcelData([]);
      setFilteredCallRecords([]);
      setFilteredUserQueries([]);
      setFilteredRetailerTags([]);
    }
  }, [user, excelData, callRecords, userQueries, retailerTags]);

  // Save branch accounts to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('kam-branch-accounts', JSON.stringify(branchAccounts));
    } catch (error) {
      console.error('Error saving branch accounts to localStorage:', error);
    }
  }, [branchAccounts]);

  // Save call records to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('kam-call-records', JSON.stringify(callRecords));
    } catch (error) {
      console.error('Error saving call records to localStorage:', error);
    }
  }, [callRecords]);

  // Save user queries to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('kam-user-queries', JSON.stringify(userQueries));
    } catch (error) {
      console.error('Error saving user queries to localStorage:', error);
    }
  }, [userQueries]);

  // Save retailer tags to localStorage whenever they change
  React.useEffect(() => {
    try {
      localStorage.setItem('kam-retailer-tags', JSON.stringify(retailerTags));
    } catch (error) {
      console.error('Error saving retailer tags to localStorage:', error);
    }
  }, [retailerTags]);

  const handleDataImported = (data: ExcelData[]) => {
    setExcelData(data);
    setActiveTab('data');
    alert('Data imported successfully!');
  };

  const handleAccountCreated = (accountData: BranchAccount) => {
    setBranchAccounts(prev => [...prev, accountData]);
  };

  const handleCallUpdate = (callRecord: CallRecord) => {
    setCallRecords(prev => {
      const existingIndex = prev.findIndex(record => record.userId === callRecord.userId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = callRecord;
        return updated;
      } else {
        return [...prev, callRecord];
      }
    });
  };

  const handleQueryUpdate = (query: UserQuery) => {
    setUserQueries(prev => {
      const existingIndex = prev.findIndex(q => q.id === query.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = query;
        return updated;
      } else {
        return [query, ...prev];
      }
    });
  };

  const handleRetailerTagUpdate = (tag: RetailerTag) => {
    setRetailerTags(prev => {
      const existingIndex = prev.findIndex(t => t.userId === tag.userId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = tag;
        return updated;
      } else {
        return [...prev, tag];
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreateAccount={() => setIsCreateAccountModalOpen(true)}
        onImportExcel={() => setIsExcelImportOpen(true)}
        hasData={filteredExcelData.length > 0}
        userRole={user.role}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <TopBar user={user} onLogout={onLogout} />
        
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' ? (
              <DashboardContent 
                onNavigateToRetailerTagging={() => setActiveTab('retailer-tagging')}
                onNavigateToQueries={() => setActiveTab('queries')}
                onNavigateToPerformanceData={() => setActiveTab('data')}
                onNavigateToUnderperformingUsers={() => {
                  setActiveTab('data');
                  // Set performance filter to underperforming after navigation
                  setTimeout(() => {
                    const event = new CustomEvent('setPerformanceFilter', { detail: 'underperforming' });
                    window.dispatchEvent(event);
                  }, 100);
                }}
                user={user}
                filteredData={{
                  excelData: filteredExcelData,
                  callRecords: filteredCallRecords,
                  userQueries: filteredUserQueries,
                  retailerTags: filteredRetailerTags
                }}
              />
            ) : activeTab === 'analytics' ? (
              <AnalyticsContent 
                callRecords={filteredCallRecords}
                excelData={filteredExcelData}
                userQueries={filteredUserQueries}
                retailerTags={filteredRetailerTags}
              />
            ) : activeTab === 'queries' ? (
              <UserQueriesContent 
                excelData={filteredExcelData}
                onQueryUpdate={handleQueryUpdate}
              />
            ) : activeTab === 'retailer-tagging' ? (
              <RetailerTagging 
                excelData={filteredExcelData}
                onRetailerTagUpdate={handleRetailerTagUpdate}
              />
            ) : activeTab === 'user-data' ? (
              <UserDataManagement 
                excelData={filteredExcelData}
                callRecords={callRecords}
                userQueries={userQueries}
                retailerTags={retailerTags}
                userRole={user.role}
              />
            ) : activeTab === 'complaint-tags' ? (
              <ComplaintTagsManagement 
                userRole={user.role}
              />
            ) : (
              <DataTable 
                data={filteredExcelData} 
                branchAccounts={branchAccounts} 
                onCallUpdate={handleCallUpdate}
              />
            )}
          </div>
          </div>
        </main>
      </div>

      {/* Only show modals for admin users */}
      {user.role === 'admin' && (
        <CreateAccountModal
          isOpen={isCreateAccountModalOpen}
          onClose={() => setIsCreateAccountModalOpen(false)}
          onAccountCreated={handleAccountCreated}
        />
      )}

      {user.role === 'admin' && (
        <ExcelImport
          isOpen={isExcelImportOpen}
          onClose={() => setIsExcelImportOpen(false)}
          onDataImported={handleDataImported}
        />
      )}
    </div>
  );
};

export default Dashboard;