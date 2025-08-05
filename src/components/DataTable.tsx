import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, Filter, Users, AlertTriangle, TrendingDown, Phone, Check, Clock, X } from 'lucide-react';

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

interface BranchAccount {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  branch: string;
  username: string;
}

interface DataTableProps {
  data: ExcelData[];
  branchAccounts: BranchAccount[];
  onCallUpdate?: (callRecord: CallRecord) => void;
}

type SortField = keyof ExcelData;
type SortDirection = 'asc' | 'desc';

const DataTable: React.FC<DataTableProps> = ({ data, branchAccounts, onCallUpdate }) => {
  const [sortField, setSortField] = useState<SortField>('ProRatedAch');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPOC, setSelectedPOC] = useState<string>('');
  const [performanceFilter, setPerformanceFilter] = useState<'all' | 'underperforming' | 'good'>('all');
  const [callRecords, setCallRecords] = useState<Record<string, CallRecord>>({});
  const [activeCallDropdown, setActiveCallDropdown] = useState<string | null>(null);
  const [callComments, setCallComments] = useState<Record<string, string>>({});
  const [complaintTags, setComplaintTags] = useState<Record<string, string>>({});

  // Listen for performance filter events
  React.useEffect(() => {
    const handleSetPerformanceFilter = (event: CustomEvent) => {
      setPerformanceFilter(event.detail);
    };

    window.addEventListener('setPerformanceFilter', handleSetPerformanceFilter as EventListener);
    return () => {
      window.removeEventListener('setPerformanceFilter', handleSetPerformanceFilter as EventListener);
    };
  }, []);

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
    'Paid Posts',
    'You can sort or clean your list in a variety of ways.',
    'Hover over the menu items to see examples of what we can do.',
    'We also have some reference lists for you to play with in the \'Reference Lists\' section.'
  ];

  // Get unique POCs from data
  const uniquePOCs = useMemo(() => {
    return Array.from(new Set(data.map(item => item.POC))).sort();
  }, [data]);

  // Match POCs with branch accounts
  const pocAccountMap = useMemo(() => {
    const map: Record<string, BranchAccount | null> = {};
    uniquePOCs.forEach(poc => {
      const account = branchAccounts.find(account => 
        `${account.firstName} ${account.lastName}`.toLowerCase() === poc.toLowerCase() ||
        account.username.toLowerCase() === poc.toLowerCase()
      );
      map[poc] = account || null;
    });
    return map;
  }, [uniquePOCs, branchAccounts]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(item => {
      const matchesSearch = searchTerm === '' || 
        String(item.UserID).toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.POC.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPOC = selectedPOC === '' || item.POC === selectedPOC;
      
      const matchesPerformance = performanceFilter === 'all' ||
        (performanceFilter === 'underperforming' && item.ProRatedAch < 50) ||
        (performanceFilter === 'good' && item.ProRatedAch >= 50);
      
      return matchesSearch && matchesPOC && matchesPerformance;
    });

    return filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [data, sortField, sortDirection, searchTerm, selectedPOC, performanceFilter]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  const getPerformanceColor = (proRatedAch: number) => {
    if (proRatedAch < 50) return 'bg-red-100 text-red-800';
    if (proRatedAch < 75) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getCallStatusIcon = (userId: string) => {
    const record = callRecords[userId];
    if (!record) return null;

    switch (record.status) {
      case 'call connected':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'call not connected':
      case 'switched off':
      case 'call later':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const handleCallStatusChange = (userId: string, status: CallRecord['status']) => {
    const comment = callComments[userId] || '';
    const complaintTag = complaintTags[userId] || '';
    const timestamp = new Date().toLocaleString();
    
    const callRecord: CallRecord = {
      userId,
      status,
      comment,
      timestamp,
      complaintTag
    };

    setCallRecords(prev => ({
      ...prev,
      [userId]: callRecord
    }));

    if (onCallUpdate) {
      onCallUpdate(callRecord);
    }

    setActiveCallDropdown(null);
    setCallComments(prev => ({
      ...prev,
      [userId]: ''
    }));
    setComplaintTags(prev => ({
      ...prev,
      [userId]: ''
    }));
  };

  const handleCommentChange = (userId: string, comment: string) => {
    setCallComments(prev => ({
      ...prev,
      [userId]: comment
    }));
  };

  const handleComplaintTagChange = (userId: string, tag: string) => {
    setComplaintTags(prev => ({
      ...prev,
      [userId]: tag
    }));
  };

  // Statistics
  const stats = useMemo(() => {
    const total = filteredAndSortedData.length;
    const underperforming = filteredAndSortedData.filter(item => item.ProRatedAch < 50).length;
    const avgProRatedAch = total > 0 ? 
      filteredAndSortedData.reduce((sum, item) => sum + item.ProRatedAch, 0) / total : 0;
    
    return { total, underperforming, avgProRatedAch };
  }, [filteredAndSortedData]);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-600">Import an Excel file to view user performance data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-[#9CE882] to-[#82E89C] rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Underperforming</p>
              <p className="text-2xl font-bold text-red-600">{stats.underperforming}</p>
              <p className="text-xs text-gray-500">{'<50% achievement'}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-red-500 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Achievement</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgProRatedAch.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-[#9C82E8] to-[#82E89C] rounded-lg flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or POC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CE882] focus:border-[#9CE882]"
              />
            </div>

            {/* POC Filter */}
            <select
              value={selectedPOC}
              onChange={(e) => setSelectedPOC(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CE882] focus:border-[#9CE882]"
            >
              <option value="">All POCs</option>
              {uniquePOCs.map(poc => (
                <option key={poc} value={poc}>
                  {poc} {pocAccountMap[poc] ? '✓' : '⚠️'}
                </option>
              ))}
            </select>

            {/* Performance Filter */}
            <select
              value={performanceFilter}
              onChange={(e) => setPerformanceFilter(e.target.value as 'all' | 'underperforming' | 'good')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CE882] focus:border-[#9CE882]"
            >
              <option value="all">All Performance</option>
              <option value="underperforming">Underperforming (&lt;50%)</option>
              <option value="good">Good Performance (≥50%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Filter className="h-5 w-5 mr-2 text-[#9CE882]" />
            Performance Data ({filteredAndSortedData.length} records)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  { key: 'UserID', label: 'User ID' },
                  { key: 'Date', label: 'Date' },
                  { key: 'Name', label: 'Name' },
                  { key: 'POC', label: 'POC' },
                  { key: 'Potential', label: 'Potential' },
                  { key: 'Last 30 days', label: 'Last 30 Days' },
                  { key: 'ProRatedAch', label: 'Pro-Rated Achievement' },
                  { key: 'ShortFall', label: 'Call Status' }
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key as SortField)}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-1">
                      <span>{label}</span>
                      {getSortIcon(key as SortField)}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shortfall
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 bg-gray-50">{row.UserID}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.Date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.Name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.POC}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.Potential.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row['Last 30 days'].toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPerformanceColor(row.ProRatedAch)}`}>
                      {row.ProRatedAch}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative">
                      <button
                        onClick={() => setActiveCallDropdown(activeCallDropdown === row.UserID ? null : row.UserID)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#9CE882] transition-all duration-200"
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        {getCallStatusIcon(row.UserID)}
                        {callRecords[row.UserID] ? (
                          <span className="ml-1 text-xs">
                            {callRecords[row.UserID].status === 'call connected' ? 'Connected' : 'Pending'}
                          </span>
                        ) : (
                          <span className="ml-1 text-xs">Call</span>
                        )}
                      </button>

                      {activeCallDropdown === row.UserID && (
                        <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                          <div className="p-4 space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Call Status
                              </label>
                              <select
                                value={callRecords[row.UserID]?.status || ''}
                                onChange={(e) => setCallRecords(prev => ({
                                  ...prev,
                                  [row.UserID]: {
                                    ...prev[row.UserID],
                                    userId: row.UserID,
                                    status: e.target.value as CallRecord['status'],
                                    comment: prev[row.UserID]?.comment || callComments[row.UserID] || '',
                                    complaintTag: prev[row.UserID]?.complaintTag || complaintTags[row.UserID] || '',
                                    timestamp: new Date().toLocaleString()
                                  }
                                }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CE882] focus:border-[#9CE882] text-sm"
                              >
                                <option value="">Select call status...</option>
                                <option value="call connected">Call Connected</option>
                                <option value="call not connected">Call Not Connected</option>
                                <option value="switched off">Switched Off</option>
                                <option value="call later">Call Later</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Complaint Tag
                              </label>
                              <select
                                value={complaintTags[row.UserID] || ''}
                                onChange={(e) => handleComplaintTagChange(row.UserID, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CE882] focus:border-[#9CE882] text-sm"
                              >
                                <option value="">Select complaint tag...</option>
                                {complaintTagOptions.map(option => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Comments
                              </label>
                              <textarea
                                value={callComments[row.UserID] || ''}
                                onChange={(e) => handleCommentChange(row.UserID, e.target.value)}
                                placeholder="Add any comments about this call..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CE882] focus:border-[#9CE882] text-sm"
                                rows={3}
                              />
                            </div>

                            <div className="flex justify-between">
                              <button
                                onClick={() => setActiveCallDropdown(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => {
                                  const status = callRecords[row.UserID]?.status;
                                  const comment = callComments[row.UserID] || '';
                                  const complaintTag = complaintTags[row.UserID] || '';
                                  if (status) {
                                    handleCallStatusChange(row.UserID, status);
                                  }
                                }}
                                disabled={!callRecords[row.UserID]?.status}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                  callRecords[row.UserID]?.status
                                    ? 'text-white bg-gradient-to-r from-[#9CE882] to-[#82E89C] hover:from-[#8BD871] hover:to-[#71D78B] shadow-md hover:shadow-lg'
                                    : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                }`}
                              >
                                Submit
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.ShortFall.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {pocAccountMap[row.POC] ? (
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        <span className="text-xs text-green-600 font-medium">Matched</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                        <span className="text-xs text-yellow-600 font-medium">No Account</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedData.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No records match your current filters</p>
          </div>
        )}
      </div>

      {/* Call Records Summary */}
      {Object.keys(callRecords).length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Call Activity</h3>
          <div className="space-y-3">
            {Object.values(callRecords)
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, 10)
              .map((record, index) => {
                const user = data.find(u => u.UserID === record.userId);
                return (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {record.status === 'call connected' ? (
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Clock className="h-4 w-4 text-yellow-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.Name || record.userId} - {record.status}
                        </p>
                        <p className="text-xs text-gray-500">{record.timestamp}</p>
                      </div>
                      {record.comment && (
                        <p className="text-sm text-gray-600 mt-1">{record.comment}</p>
                      )}
                      {record.complaintTag && (
                        <p className="text-xs text-gray-500 mt-1">
                          <span className="font-medium">Tag:</span> {record.complaintTag}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
      {/* POC Account Matching Summary */}
      {uniquePOCs.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">POC Account Matching</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uniquePOCs.map(poc => (
              <div key={poc} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{poc}</h4>
                  {pocAccountMap[poc] ? (
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  ) : (
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  )}
                </div>
                {pocAccountMap[poc] ? (
                  <div className="text-sm text-gray-600">
                    <p>{pocAccountMap[poc]!.firstName} {pocAccountMap[poc]!.lastName}</p>
                    <p className="text-xs text-gray-500">{pocAccountMap[poc]!.branch}</p>
                  </div>
                ) : (
                  <p className="text-sm text-yellow-600">No matching account found</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;