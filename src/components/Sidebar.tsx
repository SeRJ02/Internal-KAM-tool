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
  const [isExpanded, setIsExpanded] = React.useState(false);

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
    <div 
      className={`fixed left-0 top-0 h-screen bg-white shadow-lg border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out z-50 ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo Section */}
      <div className={`border-b border-gray-200 transition-all duration-300 ${isExpanded ? 'p-6' : 'p-4'}`}>
        <div className="flex items-center">
          <div className={`rounded-lg overflow-hidden flex items-center justify-center bg-white border border-gray-200 transition-all duration-300 ${
            isExpanded ? 'h-10 w-10' : 'h-8 w-8'
          }`}>
            <img 
              src="/channels4_profile.jpg" 
              alt="Company Logo" 
              className="h-full w-full object-cover"
            />
          </div>
          {isExpanded && (
            <div className="ml-3 transition-opacity duration-300">
              <h1 className="text-lg font-bold text-gray-900">Key Account</h1>
              <p className="text-sm text-gray-500">Management</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className={`flex-1 space-y-2 transition-all duration-300 ${isExpanded ? 'p-4' : 'p-2'}`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              disabled={item.disabled}
              className={`w-full flex items-center text-sm font-medium rounded-lg transition-all duration-200 ${
                isExpanded ? 'px-4 py-3' : 'px-3 py-3 justify-center'
              } ${
                item.active
                  ? 'bg-gradient-to-r from-[#9CE882] to-[#82E89C] text-white shadow-md'
                  : item.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              title={!isExpanded ? item.label : undefined}
            >
              <Icon className={`h-5 w-5 transition-all duration-200 ${isExpanded ? 'mr-3' : ''}`} />
              {isExpanded && (
                <span className="flex-1 text-left transition-opacity duration-300">{item.label}</span>
              )}
              {isExpanded && item.badge && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full transition-opacity duration-300">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-200 transition-opacity duration-300">
          <div className="text-xs text-gray-500 text-center">
            <p>Internal Dashboard</p>
            <p className="mt-1 capitalize">{userRole} Access</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;