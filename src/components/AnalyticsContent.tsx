import React, { useState, useMemo } from 'react';
import { PieChart, BarChart3, Search, Filter, TrendingUp, Users, Calendar, MessageSquare, Tag } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie, Scatter } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
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

interface AnalyticsContentProps {
  callRecords: CallRecord[];
  excelData: ExcelData[];
  userQueries: UserQuery[];
  retailerTags: RetailerTag[];
}

const AnalyticsContent: React.FC<AnalyticsContentProps> = ({ callRecords, excelData, userQueries, retailerTags }) => {
  const [selectedComplaints, setSelectedComplaints] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');

  const complaintTagOptions = [
    'Validation Delay',
    'Tracking Issue',
    'Retailer not Live',
    'Major cancellation : E Comm',
    'Major cancellation : Finance',
    'Better Rates on Competitors',
    'Miscellaneous',
    'Low Conversion on EK',
    'Affiliaters Issue',
    'Product Issue',
    'Amazon Disapproval',
    'Payment Related',
    'Zero Comission',
    'Other',
    'Paid Posts'
  ];

  // Process complaint tag data for charts
  const complaintTagData = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    
    // Count from call records
    callRecords.forEach(record => {
      if (record.complaintTag && record.complaintTag.trim()) {
        tagCounts[record.complaintTag] = (tagCounts[record.complaintTag] || 0) + 1;
      }
    });

    // Count from user queries
    userQueries.forEach(query => {
      if (query.complaintTag && query.complaintTag.trim()) {
        tagCounts[query.complaintTag] = (tagCounts[query.complaintTag] || 0) + 1;
      }
    });

    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [callRecords, userQueries]);

  // Process retailer tag data for charts
  const retailerTagData = useMemo(() => {
    const retailerCounts: Record<string, number> = {};
    
    retailerTags.forEach(tag => {
      tag.retailers.forEach(retailer => {
        retailerCounts[retailer] = (retailerCounts[retailer] || 0) + 1;
      });
    });

    return Object.entries(retailerCounts)
      .map(([retailer, count]) => ({ retailer, count }))
      .sort((a, b) => b.count - a.count);
  }, [retailerTags]);

  // Process retailer performance correlation
  const retailerPerformanceData = useMemo(() => {
    const retailerPerformance: Record<string, { total: number; avgPerformance: number; users: number }> = {};
    
    retailerTags.forEach(tag => {
      const user = excelData.find(u => u.UserID === tag.userId);
      if (user) {
        tag.retailers.forEach(retailer => {
          if (!retailerPerformance[retailer]) {
            retailerPerformance[retailer] = { total: 0, avgPerformance: 0, users: 0 };
          }
          retailerPerformance[retailer].total += user.ProRatedAch;
          retailerPerformance[retailer].users += 1;
        });
      }
    });

    // Calculate averages
    Object.keys(retailerPerformance).forEach(retailer => {
      retailerPerformance[retailer].avgPerformance = 
        retailerPerformance[retailer].total / retailerPerformance[retailer].users;
    });

    return Object.entries(retailerPerformance)
      .map(([retailer, data]) => ({ 
        retailer, 
        avgPerformance: Math.round(data.avgPerformance * 100) / 100,
        users: data.users 
      }))
      .sort((a, b) => b.avgPerformance - a.avgPerformance);
  }, [retailerTags, excelData]);

  // Filter data based on selected complaints
  const filteredData = useMemo(() => {
    if (selectedComplaints.length === 0) return { callRecords, userQueries };
    
    const filteredCallRecords = callRecords.filter(record => 
      record.complaintTag && selectedComplaints.includes(record.complaintTag)
    );
    
    const filteredUserQueries = userQueries.filter(query => 
      selectedComplaints.includes(query.complaintTag)
    );
    
    return { callRecords: filteredCallRecords, userQueries: filteredUserQueries };
  }, [callRecords, userQueries, selectedComplaints]);

  // Process data for timeline chart
  const timelineData = useMemo(() => {
    const dailyCounts: Record<string, number> = {};
    
    // Process call records
    callRecords.forEach(record => {
      if (record.complaintTag) {
        const date = new Date(record.timestamp).toLocaleDateString();
        dailyCounts[date] = (dailyCounts[date] || 0) + 1;
      }
    });

    // Process user queries
    userQueries.forEach(query => {
      const date = new Date(query.timestamp).toLocaleDateString();
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    return Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [callRecords, userQueries]);

  // Get users associated with selected complaints
  const affectedUsers = useMemo(() => {
    const callUserIds = new Set(filteredData.callRecords.map(record => record.userId));
    const queryUserIds = new Set(filteredData.userQueries.map(query => query.userId));
    const userIds = new Set([...callUserIds, ...queryUserIds]);
    let users = excelData.filter(user => userIds.has(user.UserID));
    
    // Filter by user search term if provided
    if (userSearchTerm) {
      users = users.filter(user =>
        String(user.UserID).toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.Name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.POC.toLowerCase().includes(userSearchTerm.toLowerCase())
      );
    }
    
    return users;
  }, [filteredData, excelData, userSearchTerm]);

  // Chart data configurations
  const pieChartData = useMemo(() => {
    const colors = [
      '#9CE882', '#82E89C', '#9C82E8', '#E882CF', '#CFE882',
      '#E89C82', '#82CFE8', '#E8CF82', '#CF82E8', '#82E8CF'
    ];

    return {
      labels: complaintTagData.slice(0, 10).map(item => item.tag),
      datasets: [
        {
          label: 'Issues Count',
          data: complaintTagData.slice(0, 10).map(item => item.count),
          backgroundColor: colors,
          borderColor: colors.map(color => color + '80'),
          borderWidth: 2,
        },
      ],
    };
  }, [complaintTagData]);

  const barChartData = useMemo(() => {
    return {
      labels: complaintTagData.slice(0, 8).map(item => item.tag),
      datasets: [
        {
          label: 'Call Records',
          data: complaintTagData.slice(0, 8).map(item => {
            return callRecords.filter(record => record.complaintTag === item.tag).length;
          }),
          backgroundColor: '#9CE882',
          borderColor: '#82E89C',
          borderWidth: 2,
        },
        {
          label: 'User Queries',
          data: complaintTagData.slice(0, 8).map(item => {
            return userQueries.filter(query => query.complaintTag === item.tag).length;
          }),
          backgroundColor: '#9C82E8',
          borderColor: '#E882CF',
          borderWidth: 2,
        },
      ],
    };
  }, [complaintTagData, callRecords, userQueries]);

  const lineChartData = useMemo(() => {
    return {
      labels: timelineData.map(item => item.date),
      datasets: [
        {
          label: 'Total Issues',
          data: timelineData.map(item => item.count),
          borderColor: '#9CE882',
          backgroundColor: '#9CE88220',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#82E89C',
          pointBorderColor: '#9CE882',
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    };
  }, [timelineData]);

  const retailerDistributionData = useMemo(() => {
    const colors = [
      '#9CE882', '#82E89C', '#9C82E8', '#E882CF', '#CFE882',
      '#E89C82', '#82CFE8', '#E8CF82', '#CF82E8', '#82E8CF',
      '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#10B981'
    ];

    return {
      labels: retailerTagData.slice(0, 10).map(item => item.retailer),
      datasets: [
        {
          label: 'Users Tagged',
          data: retailerTagData.slice(0, 10).map(item => item.count),
          backgroundColor: colors,
          borderColor: colors.map(color => color + '80'),
          borderWidth: 2,
        },
      ],
    };
  }, [retailerTagData]);

  const retailerPerformanceChartData = useMemo(() => {
    return {
      labels: retailerPerformanceData.slice(0, 10).map(item => item.retailer),
      datasets: [
        {
          label: 'Average Performance (%)',
          data: retailerPerformanceData.slice(0, 10).map(item => item.avgPerformance),
          backgroundColor: '#9CE882',
          borderColor: '#82E89C',
          borderWidth: 2,
        },
        {
          label: 'Number of Users',
          data: retailerPerformanceData.slice(0, 10).map(item => item.users),
          backgroundColor: '#9C82E8',
          borderColor: '#E882CF',
          borderWidth: 2,
          yAxisID: 'y1',
        },
      ],
    };
  }, [retailerPerformanceData]);

  const scatterChartData = useMemo(() => {
    const scatterData = excelData.map(user => ({
      x: user.Potential,
      y: user.ProRatedAch,
      userId: user.UserID,
      name: user.Name,
    }));

    return {
      datasets: [
        {
          label: 'User Performance vs Potential',
          data: scatterData,
          backgroundColor: '#9CE88280',
          borderColor: '#9CE882',
          borderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    };
  }, [excelData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#9CE882',
        borderWidth: 1,
      },
    },
  };

  const scatterOptions = {
    ...chartOptions,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Potential',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Pro-Rated Achievement (%)',
        },
      },
    },
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        ...chartOptions.plugins.tooltip,
        callbacks: {
          label: function(context: any) {
            const point = context.raw;
            return `${point.name}: Potential ${point.x}, Achievement ${point.y}%`;
          },
        },
      },
    },
  };

  const retailerPerformanceOptions = {
    ...chartOptions,
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Average Performance (%)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Number of Users',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const handleComplaintToggle = (complaint: string) => {
    setSelectedComplaints(prev => 
      prev.includes(complaint)
        ? prev.filter(c => c !== complaint)
        : [...prev, complaint]
    );
  };

  const filteredComplaintOptions = complaintTagOptions.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (callRecords.length === 0 && userQueries.length === 0 && retailerTags.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600">Import performance data and add calls, queries, or retailer tags to see analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <PieChart className="h-6 w-6 mr-3 text-[#9CE882]" />
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Analyze complaint patterns and user interactions</p>
          </div>
          <div className="bg-gradient-to-r from-[#9CE882] to-[#82E89C] rounded-lg p-4">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Issues</p>
              <p className="text-2xl font-bold text-gray-900">{complaintTagData.reduce((sum, item) => sum + item.count, 0)}</p>
              <p className="text-xs text-gray-500">Calls + Queries</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-[#9CE882] to-[#82E89C] rounded-lg flex items-center justify-center">
              <Filter className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">User Queries</p>
              <p className="text-2xl font-bold text-gray-900">{userQueries.length}</p>
              <p className="text-xs text-gray-500">
                {userQueries.filter(q => q.status === 'open').length} open
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-[#E882CF] to-[#9C82E8] rounded-lg flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Tags</p>
              <p className="text-2xl font-bold text-gray-900">{complaintTagData.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-[#CFE882] to-[#9CE882] rounded-lg flex items-center justify-center">
              <PieChart className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Affected Users</p>
              <p className="text-2xl font-bold text-gray-900">{affectedUsers.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-[#9C82E8] to-[#82E89C] rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tagged Retailers</p>
              <p className="text-2xl font-bold text-gray-900">{retailerTagData.length}</p>
              <p className="text-xs text-gray-500">{retailerTags.length} users tagged</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-[#CFE882] to-[#9CE882] rounded-lg flex items-center justify-center">
              <Tag className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Issue Distribution</h3>
          <p className="text-sm text-gray-600 mb-4">Top complaint categories</p>
          <div className="h-80">
            {complaintTagData.length > 0 ? (
              <Pie data={pieChartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No issue data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Issues by Source</h3>
          <p className="text-sm text-gray-600 mb-4">Comparison of calls vs queries</p>
          <div className="h-80">
            {complaintTagData.length > 0 ? (
              <Bar data={barChartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No issue data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Retailer Distribution Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Retailer Distribution</h3>
          <p className="text-sm text-gray-600 mb-4">Users tagged by retailer</p>
          <div className="h-80">
            {retailerTagData.length > 0 ? (
              <Pie data={retailerDistributionData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Tag className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No retailer data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2 xl:col-span-1">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Issues Timeline</h3>
          <p className="text-sm text-gray-600 mb-4">Daily trend of all issues</p>
          <div className="h-80">
            {timelineData.length > 0 ? (
              <Line data={lineChartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No timeline data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Retailer Performance Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Retailer Performance Analysis</h3>
          <p className="text-sm text-gray-600 mb-4">Average user performance by retailer</p>
          <div className="h-80">
            {retailerPerformanceData.length > 0 ? (
              <Bar data={retailerPerformanceChartData} options={retailerPerformanceOptions} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No retailer performance data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scatter Plot */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance vs Potential</h3>
          <p className="text-sm text-gray-600 mb-4">User achievement correlation</p>
          <div className="h-80">
            {excelData.length > 0 ? (
              <Scatter data={scatterChartData} options={scatterOptions} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No performance data available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complaint Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filter by Complaint Tags</h3>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search complaint tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CE882] focus:border-[#9CE882]"
          />
        </div>

        {/* Complaint Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredComplaintOptions.map(complaint => (
            <label key={complaint} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedComplaints.includes(complaint)}
                onChange={() => handleComplaintToggle(complaint)}
                className="w-4 h-4 text-[#9CE882] border-gray-300 rounded focus:ring-[#9CE882]"
              />
              <span className="text-sm text-gray-700 flex-1">{complaint}</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {complaintTagData.find(item => item.tag === complaint)?.count || 0}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Affected Users Table */}
      {selectedComplaints.length > 0 && affectedUsers.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Affected Users ({affectedUsers.length})
          </h3>
          
          {/* User Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search affected users by User ID, name, or POC..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CE882] focus:border-[#9CE882]"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">POC</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Achievement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issues</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {affectedUsers.slice(0, 10).map((user, index) => {
                  const userCallComplaints = filteredData.callRecords
                    .filter(record => record.userId === user.UserID)
                    .map(record => record.complaintTag)
                    .filter(Boolean);
                  
                  const userQueryComplaints = filteredData.userQueries
                    .filter(query => query.userId === user.UserID)
                    .map(query => query.complaintTag);
                  
                  const allComplaints = [...userCallComplaints, ...userQueryComplaints];
                  const sources = [];
                  if (userCallComplaints.length > 0) sources.push('Calls');
                  if (userQueryComplaints.length > 0) sources.push('Queries');
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.Name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.POC}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.ProRatedAch < 50 ? 'bg-red-100 text-red-800' :
                          user.ProRatedAch < 75 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.ProRatedAch}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-wrap gap-1">
                          {Array.from(new Set(allComplaints)).slice(0, 2).map(complaint => (
                            <span key={complaint} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                              {complaint}
                            </span>
                          ))}
                          {allComplaints.length > 2 && (
                            <span className="inline-flex px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">
                              +{allComplaints.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-wrap gap-1">
                          {sources.map(source => (
                            <span key={source} className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              source === 'Calls' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {source}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {affectedUsers.length > 10 && (
            <p className="text-sm text-gray-500 mt-4 text-center">
              Showing first 10 of {affectedUsers.length} affected users
            </p>
          )}
        </div>
      )}

      {/* Retailer Insights */}
      {retailerTagData.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Retailer Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {retailerPerformanceData.slice(0, 6).map((retailer, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{retailer.retailer}</h4>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    retailer.avgPerformance >= 75 ? 'bg-green-100 text-green-800' :
                    retailer.avgPerformance >= 50 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {retailer.avgPerformance}%
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>{retailer.users} users tagged</p>
                  <p className="text-xs text-gray-500 mt-1">Average performance</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsContent;