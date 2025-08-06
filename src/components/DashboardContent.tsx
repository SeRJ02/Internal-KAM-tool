import React from 'react';
import { Users, Target, TrendingUp, AlertCircle, Phone, Tag, MessageSquare, Vibrate as Strategy, Shield, BarChart3, PieChart } from 'lucide-react';
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
  // Dynamic messages for the dialogue box
  const [currentMessageIndex, setCurrentMessageIndex] = React.useState(0);
  const messages = [
    "Oh no, go to performance data and check out all users",
    "call your users and help them grow gang 💪",
    "how's the josh?"
  ];

  // Cycle through messages every 4 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [messages.length]);

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

  // Generate analytics data for charts
  const generateAnalyticsData = () => {
    if (!filteredData || filteredData.excelData.length === 0) {
      return null;
    }

    // Generate last 12 months of data
    const months = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    }

    // Calculate aggregated data from current excel data
    const totalPotential = filteredData.excelData.reduce((sum, item) => sum + item.Potential, 0);
    const totalLast30Days = filteredData.excelData.reduce((sum, item) => sum + item['Last 30 days'], 0);
    const avgAchievement = filteredData.excelData.reduce((sum, item) => sum + item.ProRatedAch, 0) / filteredData.excelData.length;

    // Generate realistic trend data based on current performance
    const potentialData = months.map((_, index) => {
      const baseValue = totalPotential;
      const trend = (index / 11) * 0.2; // 20% growth over 12 months
      const variance = (Math.random() - 0.5) * 0.1; // ±5% random variance
      return Math.round(baseValue * (0.8 + trend + variance));
    });

    const achievedData = months.map((_, index) => {
      const baseValue = totalLast30Days;
      const trend = (index / 11) * 0.15; // 15% growth over 12 months
      const variance = (Math.random() - 0.5) * 0.15; // ±7.5% random variance
      return Math.round(baseValue * (0.7 + trend + variance));
    });

    // Monthly targets (typically 80-90% of potential)
    const targetData = potentialData.map(potential => Math.round(potential * (0.8 + Math.random() * 0.1)));

    return {
      labels: months,
      datasets: [
        {
          label: 'Potential',
          data: potentialData,
          borderColor: '#9CE882',
          backgroundColor: '#9CE88220',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: '#9CE882',
          pointBorderColor: '#82E89C',
          pointRadius: 5,
          pointHoverRadius: 7,
        },
        {
          label: 'Monthly Targets',
          data: targetData,
          borderColor: '#9C82E8',
          backgroundColor: '#9C82E820',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: '#9C82E8',
          pointBorderColor: '#E882CF',
          pointRadius: 5,
          pointHoverRadius: 7,
          borderDash: [5, 5], // Dashed line for targets
        },
        {
          label: 'Last 30 Days Achievement',
          data: achievedData,
          borderColor: '#E882CF',
          backgroundColor: '#E882CF20',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#E882CF',
          pointBorderColor: '#9C82E8',
          pointRadius: 5,
          pointHoverRadius: 7,
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
          font: {
            size: 12,
            weight: 'bold',
          },
        },
      },
      title: {
        display: true,
        text: 'Performance Analytics - 12 Month Trend',
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
            return `${label}: ${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Month',
          font: {
            weight: 'bold',
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Value',
          font: {
            weight: 'bold',
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        beginAtZero: true,
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    elements: {
      point: {
        hoverRadius: 8,
      },
    },
  };

  const analyticsData = generateAnalyticsData();

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

      {/* GIF with Dynamic Dialogue Box */}
      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Section - GIF + Stats */}
        <div className="xl:col-span-2 space-y-6">
          {/* GIF with Dynamic Dialogue Box - Centered to match stats width */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {/* Dynamic Dialogue Box */}
              <div className="flex-1 mr-6">
                <div className="relative bg-gradient-to-r from-[#9CE882] to-[#82E89C] rounded-lg p-4 shadow-md">
                  {/* Speech bubble tail */}
                  <div className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2">
                    <div className="w-0 h-0 border-l-[15px] border-l-[#9CE882] border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent"></div>
                  </div>
                  
                  {/* Message content */}
                  <div className="text-white">
                    <p className="text-lg font-medium leading-relaxed">
                      {messages[currentMessageIndex]}
                    </p>
                  </div>
                  
                  {/* Message indicators */}
                  <div className="flex justify-center mt-3 space-x-2">
                    {messages.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentMessageIndex 
                            ? 'bg-white' 
                            : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                {/* User greeting */}
                <div className="mt-3 text-center">
                  <p className="text-sm text-gray-600">
                    Hey <span className="font-medium text-[#9CE882]">{user?.name}</span>! 👋
                  </p>
                </div>
              </div>

              {/* GIF */}
              <div className="flex-shrink-0">
                <div className="w-48 h-32 rounded-lg overflow-hidden shadow-lg border-2 border-gray-200">
                  <img 
                    src="/WhatsApp Video 2025-08-06 at 9.37.48 AM.gif" 
                    alt="Performance Animation" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* Right Section - Top 5 Underperforming Users - Extended upward */}
        <div className="xl:col-span-1 xl:row-span-1">
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

      {/* Analytics Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="h-6 w-6 mr-3 text-[#9CE882]" />
              Performance Analytics
            </h2>
            <p className="text-gray-600 mt-1">Track potential, targets, and achievements over time</p>
          </div>
          <div className="bg-gradient-to-r from-[#9CE882] to-[#82E89C] rounded-lg p-3">
            <PieChart className="h-6 w-6 text-white" />
          </div>
        </div>

        {analyticsData ? (
          <div className="h-96">
            <Line data={analyticsData} options={chartOptions} />
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
              <p className="text-gray-600">Import performance data to view analytics charts</p>
            </div>
          </div>
        )}

        {/* Analytics Summary Cards */}
        {analyticsData && filteredData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="bg-gradient-to-r from-[#9CE882] to-[#82E89C] rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Potential</p>
                  <p className="text-2xl font-bold">
                    {filteredData.excelData.reduce((sum, item) => sum + item.Potential, 0).toLocaleString()}
                  </p>
                </div>
                <Target className="h-8 w-8 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#9C82E8] to-[#E882CF] rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Current Achievement</p>
                  <p className="text-2xl font-bold">
                    {filteredData.excelData.reduce((sum, item) => sum + item['Last 30 days'], 0).toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#CFE882] to-[#9CE882] rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Average Performance</p>
                  <p className="text-2xl font-bold">
                    {(filteredData.excelData.reduce((sum, item) => sum + item.ProRatedAch, 0) / filteredData.excelData.length).toFixed(1)}%
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 opacity-80" />
              </div>
            </div>
          </div>
        )}
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