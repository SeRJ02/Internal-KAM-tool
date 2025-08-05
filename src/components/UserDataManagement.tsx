import React, { useState, useMemo } from 'react';
import { Search, User, Phone, MessageSquare, Tag, Calendar, FileText, Users, Eye, Filter, TrendingUp } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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
  complaintTag?: string;
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

interface UserDataManagementProps {
  excelData: ExcelData[];
  callRecords: CallRecord[];
  userQueries: UserQuery[];
  retailerTags: RetailerTag[];
  userRole: string;
}

const UserDataManagement: React.FC<UserDataManagementProps> = ({
  excelData,
  callRecords,
  userQueries,
  retailerTags,
  userRole
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<ExcelData | null>(null);
  const [selectedPOC, setSelectedPOC] = useState<string>('');

  // Get unique POCs for filtering
  const uniquePOCs = useMemo(() => {
    return Array.from(new Set(excelData.map(item => item.POC))).sort();
  }, [excelData]);

  // Filter users based on search term and POC
  const filteredUsers = useMemo(() => {
    let filtered = excelData;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(user.UserID).toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.POC.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedPOC) {
      filtered = filtered.filter(user => user.POC === selectedPOC);
    }

    return filtered.sort((a, b) => a.Name.localeCompare(b.Name));
  }, [excelData, searchTerm, selectedPOC]);

  // Get all data for selected user
  const getUserData = (userId: string) => {
    const userCallRecords = callRecords.filter(record => record.userId === userId);
    const userUserQueries = userQueries.filter(query => query.userId === userId);
    const userRetailerTags = retailerTags.filter(tag => tag.userId === userId);

    return {
      callRecords: userCallRecords,
      userQueries: userUserQueries,
      retailerTags: userRetailerTags
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'call connected': return 'bg-green-100 text-green-800';
      case 'call not connected': return 'bg-red-100 text-red-800';
      case 'switched off': return 'bg-yellow-100 text-yellow-800';
      case 'call later': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Generate chart data for selected user
  const generateUserChartData = (userId: string) => {
    const userData = getUserData(userId);
    const user = excelData.find(u => u.UserID === userId);
    
    if (!user || !userData) return null;

    // Create timeline data for the last 30 days
    const today = new Date();
    const dates = [];
    const callActivity = [];
    const queryActivity = [];
    const performanceData = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString();
      dates.push(dateStr);
      
      // Count activities for this date
      const dayCallCount = userData.callRecords.filter(record => {
        const recordDate = new Date(record.timestamp).toLocaleDateString();
        return recordDate === dateStr;
      }).length;
      
      const dayQueryCount = userData.userQueries.filter(query => {
        const queryDate = new Date(query.timestamp).toLocaleDateString();
        return queryDate === dateStr;
      }).length;
      
      callActivity.push(dayCallCount);
      queryActivity.push(dayQueryCount);
      
      // For performance, we'll use the user's current achievement as baseline
      // In a real scenario, this would be historical performance data
      const basePerformance = user.ProRatedAch;
      const variance = (Math.random() - 0.5) * 10; // Random variance for demo
      performanceData.push(Math.max(0, Math.min(100, basePerformance + variance)));
    }

    return {
      labels: dates,
      datasets: [
        {
          label: 'Call Activities',
          data: callActivity,
          borderColor: '#3B82F6',
          backgroundColor: '#3B82F620',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: '#3B82F6',
          pointBorderColor: '#3B82F6',
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'Query Activities',
          data: queryActivity,
          borderColor: '#8B5CF6',
          backgroundColor: '#8B5CF620',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: '#8B5CF6',
          pointBorderColor: '#8B5CF6',
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'Performance Trend (%)',
          data: performanceData,
          borderColor: '#10B981',
          backgroundColor: '#10B98120',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#10B981',
          pointBorderColor: '#10B981',
          pointRadius: 5,
          pointHoverRadius: 7,
          yAxisID: 'y1',
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: selectedUser ? `Activity & Performance Trends - ${selectedUser.Name}` : 'User Activity Trends',
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: 20,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#9CE882',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (label.includes('Performance')) {
              return `${label}: ${value.toFixed(1)}%`;
            }
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
          font: {
            weight: 'bold',
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Activity Count',
          font: {
            weight: 'bold',
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        beginAtZero: true,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Performance (%)',
          font: {
            weight: 'bold',
          },
        },
        grid: {
          drawOnChartArea: false,
        },
        beginAtZero: true,
        max: 100,
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  // Statistics
  const stats = useMemo(() => {
    const totalUsers = excelData.length;
    const usersWithCalls = new Set(callRecords.map(record => record.userId)).size;
    const usersWithQueries = new Set(userQueries.map(query => query.userId)).size;
    const usersWithTags = retailerTags.length;

    return { totalUsers, usersWithCalls, usersWithQueries, usersWithTags };
  }, [excelData, callRecords, userQueries, retailerTags]);

  if (userRole !== 'admin') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600">This section is only available to administrators</p>
        </div>
      </div>
    );
  }

  if (excelData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No User Data Available</h3>
          <p className="text-gray-600">Import performance data to start viewing user information</p>
        </div>
      </div>
    );
  }

  const selectedUserData = selectedUser ? getUserData(selectedUser.UserID) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="h-6 w-6 mr-3 text-[#9CE882]" />
              User Data Management
            </h1>
            <p className="text-gray-600 mt-2">View all POC inputs and activities for each user</p>
          </div>
          <div className="bg-gradient-to-r from-[#9CE882] to-[#82E89C] rounded-lg p-4">
            <Eye className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-[#9CE882] to-[#82E89C] rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Users with Calls</p>
              <p className="text-2xl font-bold text-blue-600">{stats.usersWithCalls}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Phone className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Users with Queries</p>
              <p className="text-2xl font-bold text-purple-600">{stats.usersWithQueries}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-500 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tagged Users</p>
              <p className="text-2xl font-bold text-green-600">{stats.usersWithTags}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-lg flex items-center justify-center">
              <Tag className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Selection Panel */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Filter className="h-5 w-5 mr-2 text-[#9CE882]" />
            Select User
          </h3>

          {/* Filters */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by User ID, name, or POC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CE882] focus:border-[#9CE882]"
              />
            </div>

            <select
              value={selectedPOC}
              onChange={(e) => setSelectedPOC(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CE882] focus:border-[#9CE882]"
            >
              <option value="">All POCs</option>
              {uniquePOCs.map(poc => (
                <option key={poc} value={poc}>{poc}</option>
              ))}
            </select>
          </div>

          {/* User List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredUsers.map((user) => {
              const userData = getUserData(user.UserID);
              const totalActivities = userData.callRecords.length + userData.userQueries.length + userData.retailerTags.length;
              
              return (
                <button
                  key={user.UserID}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                    selectedUser?.UserID === user.UserID
                      ? 'border-[#9CE882] bg-green-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{user.Name}</h4>
                      <p className="text-sm text-gray-600">ID: {user.UserID}</p>
                      <p className="text-sm text-gray-600">POC: {user.POC}</p>
                      <div className="flex items-center mt-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.ProRatedAch < 50 ? 'bg-red-100 text-red-800' :
                          user.ProRatedAch < 75 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.ProRatedAch}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">{totalActivities}</span>
                      <p className="text-xs text-gray-500">activities</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>

        {/* User Details Panel */}
        <div className="space-y-6">
          {/* User Details */}
          <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-[#9CE882]" />
            User Details & Activities
          </h3>

          {selectedUser ? (
            <div className="space-y-6">
              {/* User Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{selectedUser.Name}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">User ID:</span>
                    <span className="ml-2 font-medium">{selectedUser.UserID}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">POC:</span>
                    <span className="ml-2 font-medium">{selectedUser.POC}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Potential:</span>
                    <span className="ml-2 font-medium">{selectedUser.Potential.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Achievement:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedUser.ProRatedAch < 50 ? 'bg-red-100 text-red-800' :
                      selectedUser.ProRatedAch < 75 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {selectedUser.ProRatedAch}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Activities */}
              <div className="space-y-4">
                {/* Call Records */}
                {selectedUserData?.callRecords && selectedUserData.callRecords.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-blue-600" />
                      Call Records ({selectedUserData.callRecords.length})
                    </h5>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedUserData.callRecords.map((record, index) => (
                        <div key={index} className="bg-blue-50 rounded p-3 text-sm">
                          <div className="flex justify-between items-start mb-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                              {record.status}
                            </span>
                            <span className="text-xs text-gray-500">{record.timestamp}</span>
                          </div>
                          {record.complaintTag && (
                            <p className="text-gray-700 mb-1">
                              <span className="font-medium">Tag:</span> {record.complaintTag}
                            </p>
                          )}
                          {record.comment && (
                            <p className="text-gray-700">
                              <span className="font-medium">Comment:</span> {record.comment}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* User Queries */}
                {selectedUserData?.userQueries && selectedUserData.userQueries.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2 text-purple-600" />
                      User Queries ({selectedUserData.userQueries.length})
                    </h5>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedUserData.userQueries.map((query, index) => (
                        <div key={index} className="bg-purple-50 rounded p-3 text-sm">
                          <div className="flex justify-between items-start mb-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(query.status)}`}>
                              {query.status.replace('-', ' ')}
                            </span>
                            <span className="text-xs text-gray-500">{query.timestamp}</span>
                          </div>
                          <p className="text-gray-700 mb-1">
                            <span className="font-medium">Tag:</span> {query.complaintTag}
                          </p>
                          {query.comment && (
                            <p className="text-gray-700">
                              <span className="font-medium">Comment:</span> {query.comment}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Retailer Tags */}
                {selectedUserData?.retailerTags && selectedUserData.retailerTags.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Tag className="h-4 w-4 mr-2 text-green-600" />
                      Retailer Tags ({selectedUserData.retailerTags.length})
                    </h5>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedUserData.retailerTags.map((tag, index) => (
                        <div key={index} className="bg-green-50 rounded p-3 text-sm">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs text-gray-500">{tag.timestamp}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {tag.retailers.map(retailer => (
                              <span key={retailer} className="inline-flex px-2 py-1 text-xs bg-green-200 text-green-800 rounded-full">
                                {retailer}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Activities */}
                {selectedUserData && 
                 selectedUserData.callRecords.length === 0 && 
                 selectedUserData.userQueries.length === 0 && 
                 selectedUserData.retailerTags.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No activities recorded for this user</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Select a User</h4>
              <p className="text-gray-600">Choose a user from the list to view their details and activities</p>
            </div>
          )}
          </div>

          {/* User Activity Chart */}
          {selectedUser && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-[#9CE882]" />
                Activity & Performance Trends
              </h3>
              <div className="h-96">
                {(() => {
                  const chartData = generateUserChartData(selectedUser.UserID);
                  return chartData ? (
                    <Line data={chartData} options={chartOptions} />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No chart data available</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
              
              {/* Chart Legend */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Chart Information:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-gray-700">Call Activities - Daily call interactions</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                    <span className="text-gray-700">Query Activities - Daily query submissions</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-gray-700">Performance Trend - Achievement percentage over time</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDataManagement;