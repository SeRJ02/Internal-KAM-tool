import React from 'react';
import { Users, Target, TrendingUp, AlertCircle, Phone, Tag, MessageSquare, Vibrate as Strategy, Shield } from 'lucide-react';

interface FilteredData {
  excelData: any[];
  callRecords: any[];
  userQueries: any[];
  retailerTags: any[];
}

interface DashboardContentProps {
  onNavigateToRetailerTagging?: () => void;
  onNavigateToQueries?: () => void;
  onNavigateToPerformanceData?: () => void;
  onNavigateToUnderperformingUsers?: () => void;
  user?: any;
  filteredData?: FilteredData;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ 
  onNavigateToRetailerTagging, 
  onNavigateToQueries,
  onNavigateToPerformanceData,
  onNavigateToUnderperformingUsers,
  user,
  filteredData
}) => {
  // Calculate stats based on filtered data
  const calculateStats = () => {
    if (!filteredData) {
      return {
        activeAccounts: '0',
        underperforming: '0',
        callsCompleted: '0',
        successRate: '0%'
      };
    }

    const { excelData, callRecords } = filteredData;
    const activeAccounts = excelData.length;
    const underperforming = excelData.filter(item => item.ProRatedAch < 50).length;
    const callsCompleted = callRecords.length;
    const connectedCalls = callRecords.filter(record => record.status === 'call connected').length;
    const successRate = callsCompleted > 0 ? ((connectedCalls / callsCompleted) * 100).toFixed(1) : '0';

    return {
      activeAccounts: activeAccounts.toString(),
      underperforming: underperforming.toString(),
      callsCompleted: callsCompleted.toString(),
      successRate: `${successRate}%`
    };
  };

  const calculatedStats = calculateStats();

  const stats = [
    {
      title: 'Assigned Users',
      value: calculatedStats.activeAccounts,
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'from-[#9CE882] to-[#82E89C]'
    },
    {
      title: 'Underperforming Users',
      value: calculatedStats.underperforming,
      change: '-5%',
      changeType: 'negative',
      icon: AlertCircle,
      color: 'from-[#CFE882] to-[#9CE882]'
    },
    {
      title: 'Calls Completed',
      value: calculatedStats.callsCompleted,
      change: '+23%',
      changeType: 'positive',
      icon: Phone,
      color: 'from-[#9C82E8] to-[#82E89C]'
    },
    {
      title: 'Success Rate',
      value: calculatedStats.successRate,
      change: '+8%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'from-[#E882CF] to-[#9C82E8]'
    }
  ];

  // Calculate quick action counts based on filtered data
  const calculateQuickActionCounts = () => {
    if (!filteredData) {
      return {
        pendingReviews: '0',
        untaggedUsers: '0',
        newQueries: '0'
      };
    }

    const { excelData, userQueries, retailerTags } = filteredData;
    const pendingReviews = excelData.filter(item => item.ProRatedAch < 50).length;
    const taggedUserIds = new Set(retailerTags.map(tag => tag.userId));
    const untaggedUsers = excelData.filter(item => !taggedUserIds.has(item.UserID)).length;
    const newQueries = userQueries.filter(query => query.status === 'open').length;

    return {
      pendingReviews: pendingReviews.toString(),
      untaggedUsers: untaggedUsers.toString(),
      newQueries: newQueries.toString()
    };
  };

  const actionCounts = calculateQuickActionCounts();

  const quickActions = [
    {
      title: 'User Performance Review',
      description: 'Review users with <50% achievement',
      icon: Target,
      color: 'bg-gradient-to-r from-[#9CE882] to-[#82E89C]',
      count: `${actionCounts.pendingReviews} pending`
    },
    {
      title: 'Retailer Tagging',
      description: 'Tag users with their primary retailers',
      icon: Tag,
      color: 'bg-gradient-to-r from-[#CFE882] to-[#9CE882]',
      count: `${actionCounts.untaggedUsers} untagged`,
      onClick: onNavigateToRetailerTagging
    },
    {
      title: 'Query Management',
      description: 'Process and categorize user queries',
      icon: MessageSquare,
      color: 'bg-gradient-to-r from-[#9C82E8] to-[#82E89C]',
      count: `${actionCounts.newQueries} new queries`,
      onClick: onNavigateToQueries
    },
    {
      title: 'Strategy Development',
      description: 'Create strategies for user segments',
      icon: Strategy,
      color: 'bg-gradient-to-r from-[#E882CF] to-[#9C82E8]',
      count: '3 in progress'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {user?.name || 'User'}
            </h1>
            <p className="text-gray-600 mt-2">
              {user?.role === 'admin' 
                ? 'Manage all account operations efficiently' 
                : `Manage your assigned accounts (POC: ${user?.poc})`
              }
            </p>
            <div className="flex items-center mt-2">
              <Shield className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-500 capitalize">{user?.role} Access</span>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="bg-gradient-to-r from-[#9CE882] to-[#82E89C] rounded-lg p-4">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats and Underperforming Users Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Stats Grid - Takes 2 columns */}
        <div className="xl:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                onClick={index === 0 ? onNavigateToPerformanceData : index === 1 ? onNavigateToUnderperformingUsers : undefined}
                className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200 ${
                  (index === 0 || index === 1) ? 'cursor-pointer hover:scale-105 transform transition-transform' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className={`text-sm mt-2 ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Underperforming Users - Takes 1 column */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
              Top 5 Underperforming Users
            </h3>
            
            {filteredData && filteredData.excelData.length > 0 ? (
              <div className="space-y-3">
                {/* Get top 5 underperforming users */}
                {filteredData.excelData
                  .filter(user => user.ProRatedAch < 50)
                  .sort((a, b) => a.ProRatedAch - b.ProRatedAch)
                  .slice(0, 5)
                  .map((user, index) => (
                    <div 
                      key={user.UserID} 
                      className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors duration-200 cursor-pointer"
                      onClick={onNavigateToUnderperformingUsers}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{user.Name}</p>
                        <p className="text-xs text-gray-600">ID: {user.UserID}</p>
                        <p className="text-xs text-gray-500">POC: {user.POC}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          {user.ProRatedAch}%
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          #{index + 1}
                        </p>
                      </div>
                    </div>
                  ))}
                
                {/* Show message if no underperforming users */}
                {filteredData.excelData.filter(user => user.ProRatedAch < 50).length === 0 && (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-600">No underperforming users</p>
                    <p className="text-xs text-gray-500">All users above 50% achievement</p>
                  </div>
                )}
                
                {/* Show message if less than 5 underperforming users */}
                {filteredData.excelData.filter(user => user.ProRatedAch < 50).length > 0 && 
                 filteredData.excelData.filter(user => user.ProRatedAch < 50).length < 5 && (
                  <div className="text-center py-2">
                    <p className="text-xs text-gray-500">
                      Showing {filteredData.excelData.filter(user => user.ProRatedAch < 50).length} of 5 users
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No data available</p>
                <p className="text-xs text-gray-400">Import Excel data to see underperforming users</p>
              </div>
            )}
            
            {/* View All Button */}
            {filteredData && filteredData.excelData.filter(user => user.ProRatedAch < 50).length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={onNavigateToUnderperformingUsers}
                  className="w-full text-center text-sm text-[#9CE882] hover:text-[#8BD871] font-medium transition-colors duration-200"
                >
                  View All Underperforming Users →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <div 
              key={index} 
              onClick={action.onClick}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {action.count}
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-[#9CE882] to-[#82E89C] rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Account activity logged</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;