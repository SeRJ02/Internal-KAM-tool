import React from 'react';
import { BarChart3, Users, UserPlus, Upload, Shield, PieChart, MessageSquare, Tag, Settings } from 'lucide-react';

interface SidebarProps {
  activeTab: 'dashboard' | 'data' | 'analytics' | 'queries' | 'retailer-tagging' | 'user-data' | 'complaint-tags';
  onTabChange: (tab: 'dashboard' | 'data' | 'analytics' | 'queries' | 'retailer-tagging' | 'user-data' | 'complaint-tags') => void;
  onCreateAccount: () => void;
  onImportExcel: () => void;
  hasData: boolean;
  userRole: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onCreateAccount,
  onImportExcel,
  hasData,
  userRole
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      onClick: () => onTabChange('dashboard'),
      active: activeTab === 'dashboard',
      disabled: false
    },
    {
      id: 'performance-data',
      label: 'Performance Data',
      icon: Users,
      onClick: () => onTabChange('data'),
      active: activeTab === 'data',
      disabled: !hasData,
      badge: hasData ? 'New' : null
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: PieChart,
      onClick: () => onTabChange('analytics'),
      active: activeTab === 'analytics',
      disabled: !hasData,
      badge: null
    },
    {
      id: 'user-data',
      label: 'User Data',
      icon: Users,
      onClick: () => onTabChange('user-data'),
      active: activeTab === 'user-data',
      disabled: !hasData || userRole !== 'admin',
      badge: null
    },
    {
      id: 'queries',
      label: 'User Queries',
      icon: MessageSquare,
      onClick: () => onTabChange('queries'),
      active: activeTab === 'queries',
      disabled: false,
      badge: null
    },
    {
      id: 'retailer-tagging',
      label: 'Retailer Tagging',
      icon: Tag,
      onClick: () => onTabChange('retailer-tagging'),
      active: activeTab === 'retailer-tagging',
      disabled: !hasData,
      badge: null
    },
    {
      id: 'complaint-tags',
      label: 'Complaint Tags',
      icon: Settings,
      onClick: () => onTabChange('complaint-tags'),
      active: activeTab === 'complaint-tags',
      disabled: userRole !== 'admin',
      badge: null
    },
    ...(userRole === 'admin' ? [{
      id: 'create-account',
      label: 'Create Account',
      icon: UserPlus,
      onClick: onCreateAccount,
      active: false,
      disabled: false
    }] : []),
    ...(userRole === 'admin' ? [{
      id: 'import-excel',
      label: 'Import Excel',
      icon: Upload,
      onClick: onImportExcel,
      active: false,
      disabled: false
    }] : [])
  ];

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 h-full flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-lg overflow-hidden flex items-center justify-center bg-white border border-gray-200">
            <img 
              src="/channels4_profile.jpg" 
              alt="Company Logo" 
              className="h-full w-full object-cover"
            />
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-bold text-gray-900">Key Account</h1>
            <p className="text-sm text-gray-500">Management</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              disabled={item.disabled}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                item.active
                  ? 'bg-gradient-to-r from-[#9CE882] to-[#82E89C] text-white shadow-md'
                  : item.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>Internal Dashboard</p>
          <p className="mt-1 capitalize">{userRole} Access</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;