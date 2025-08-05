import React, { useState } from 'react';
import { LogOut, User, UserPlus, ChevronDown, Shield, Settings, Upload, BarChart3 } from 'lucide-react';

interface NavbarProps {
  user: any;
  onLogout: () => void;
  onCreateAccount: () => void;
  onImportExcel: () => void;
  activeTab: 'dashboard' | 'data';
  onTabChange: (tab: 'dashboard' | 'data') => void;
  hasData: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  onLogout, 
  onCreateAccount, 
  onImportExcel, 
  activeTab, 
  onTabChange, 
  hasData 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-gradient-to-r from-[#9CE882] to-[#82E89C] rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-bold text-gray-900">Key Account Management</h1>
              <p className="text-sm text-gray-500">Internal Dashboard</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'dashboard'
                  ? 'bg-[#9CE882] text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="h-4 w-4 mr-2 inline" />
              Dashboard
            </button>
            <button
              onClick={() => onTabChange('data')}
              disabled={!hasData}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'data' && hasData
                  ? 'bg-[#9CE882] text-white shadow-md'
                  : hasData
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <User className="h-4 w-4 mr-2 inline" />
              Performance Data
              {hasData && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                  New
                </span>
              )}
            </button>
          </div>

          {/* Right side - Action Buttons and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Import Excel Button */}
            <button
              onClick={onImportExcel}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9CE882] transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Excel
            </button>

            {/* Create Account Button */}
            <button
              onClick={onCreateAccount}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-[#9CE882] to-[#82E89C] hover:from-[#8BD871] hover:to-[#71D78B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9CE882] transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Create Account
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9CE882] rounded-lg px-3 py-2 transition-all duration-200"
              >
                <div className="h-8 w-8 bg-gradient-to-r from-[#9C82E8] to-[#E882CF] rounded-full flex items-center justify-center">
                  <img 
                    src="/Screenshot 2025-08-04 114227.png" 
                    alt="User Avatar" 
                    className="h-full w-full object-cover rounded-full"
                  />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.username}</p>
                    </div>
                    
                    <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200">
                      <Settings className="h-4 w-4 mr-3 text-gray-400" />
                      Settings
                    </button>
                    
                    <button
                      onClick={onLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 hover:text-red-900 transition-colors duration-200"
                    >
                      <LogOut className="h-4 w-4 mr-3 text-red-400" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;