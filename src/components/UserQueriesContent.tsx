import React, { useState, useMemo } from 'react';
import { Search, MessageSquare, User, Plus, Calendar, Tag, FileText } from 'lucide-react';

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

interface UserQuery {
  id: string;
  userId: string;
  userName: string;
  complaintTag: string;
  comment: string;
  timestamp: string;
  status: 'open' | 'in-progress' | 'resolved';
}

interface UserQueriesContentProps {
  excelData: ExcelData[];
  onQueryUpdate?: (query: UserQuery) => void;
}

const UserQueriesContent: React.FC<UserQueriesContentProps> = ({ excelData, onQueryUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<ExcelData | null>(null);
  const [complaintTag, setComplaintTag] = useState('');
  const [comment, setComment] = useState('');
  const [userQueries, setUserQueries] = useState<UserQuery[]>(() => {
    try {
      const savedQueries = localStorage.getItem('kam-user-queries');
      return savedQueries ? JSON.parse(savedQueries) : [];
    } catch (error) {
      console.error('Error loading user queries from localStorage:', error);
      return [];
    }
  });

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

  // Save queries to localStorage whenever they change
  React.useEffect(() => {
    try {
      localStorage.setItem('kam-user-queries', JSON.stringify(userQueries));
    } catch (error) {
      console.error('Error saving user queries to localStorage:', error);
    }
  }, [userQueries]);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return excelData;
    return excelData.filter(user =>
      user.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(user.UserID).toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.POC.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [excelData, searchTerm]);

  const handleUserSelect = (user: ExcelData) => {
    setSelectedUser(user);
    setSearchTerm(user.Name);
  };

  const handleSubmitQuery = () => {
    if (!selectedUser || !complaintTag.trim()) {
      alert('Please select a user and complaint tag');
      return;
    }

    const newQuery: UserQuery = {
      id: Date.now().toString(),
      userId: selectedUser.UserID,
      userName: selectedUser.Name,
      complaintTag,
      comment: comment.trim(),
      timestamp: new Date().toLocaleString(),
      status: 'open'
    };

    setUserQueries(prev => [newQuery, ...prev]);
    
    // Notify parent component
    if (onQueryUpdate) {
      onQueryUpdate(newQuery);
    }
    
    // Reset form
    setSelectedUser(null);
    setSearchTerm('');
    setComplaintTag('');
    setComment('');
    
    alert('User query added successfully!');
  };

  const handleStatusChange = (queryId: string, newStatus: 'open' | 'in-progress' | 'resolved') => {
    setUserQueries(prev =>
      prev.map(query =>
        query.id === queryId ? { ...query, status: newStatus } : query
      )
    );
    
    // Notify parent component of the updated query
    if (onQueryUpdate) {
      const updatedQuery = userQueries.find(q => q.id === queryId);
      if (updatedQuery) {
        onQueryUpdate({ ...updatedQuery, status: newStatus });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = useMemo(() => {
    const total = userQueries.length;
    const open = userQueries.filter(q => q.status === 'open').length;
    const inProgress = userQueries.filter(q => q.status === 'in-progress').length;
    const resolved = userQueries.filter(q => q.status === 'resolved').length;
    
    return { total, open, inProgress, resolved };
  }, [userQueries]);

  if (excelData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No User Data Available</h3>
          <p className="text-gray-600">Import performance data to start managing user queries</p>
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
              <MessageSquare className="h-6 w-6 mr-3 text-[#9CE882]" />
              User Queries Management
            </h1>
            <p className="text-gray-600 mt-2">Search users and manage their queries and complaints</p>
          </div>
          <div className="bg-gradient-to-r from-[#9CE882] to-[#82E89C] rounded-lg p-4">
            <User className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Queries</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-[#9CE882] to-[#82E89C] rounded-lg flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open</p>
              <p className="text-2xl font-bold text-red-600">{stats.open}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-red-500 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-lg flex items-center justify-center">
              <Tag className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Add New Query Form */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
          <Plus className="h-5 w-5 mr-2 text-[#9CE882]" />
          Add New User Query
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Search */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search User
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, ID, or POC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CE882] focus:border-[#9CE882]"
                />
              </div>

              {/* User Search Results */}
              {searchTerm && !selectedUser && (
                <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-lg">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.slice(0, 10).map((user) => (
                      <button
                        key={user.UserID}
                        onClick={() => handleUserSelect(user)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{user.Name}</p>
                            <p className="text-sm text-gray-500">ID: {user.UserID} | POC: {user.POC}</p>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.ProRatedAch < 50 ? 'bg-red-100 text-red-800' :
                            user.ProRatedAch < 75 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.ProRatedAch}%
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-500 text-center">
                      No users found matching "{searchTerm}"
                    </div>
                  )}
                </div>
              )}

              {/* Selected User Display */}
              {selectedUser && (
                <div className="mt-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-green-900">{selectedUser.Name}</p>
                      <p className="text-sm text-green-700">ID: {selectedUser.UserID} | POC: {selectedUser.POC}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedUser(null);
                        setSearchTerm('');
                      }}
                      className="text-green-600 hover:text-green-800 text-sm underline"
                    >
                      Change User
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Query Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complaint Tag *
              </label>
              <select
                value={complaintTag}
                onChange={(e) => setComplaintTag(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CE882] focus:border-[#9CE882]"
              >
                <option value="">Select complaint tag...</option>
                {complaintTagOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Comments
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add any additional details about this query..."
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CE882] focus:border-[#9CE882]"
                rows={4}
              />
            </div>

            <button
              onClick={handleSubmitQuery}
              disabled={!selectedUser || !complaintTag}
              className={`w-full py-3 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
                selectedUser && complaintTag
                  ? 'text-white bg-gradient-to-r from-[#9CE882] to-[#82E89C] hover:from-[#8BD871] hover:to-[#71D78B] shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                  : 'text-gray-400 bg-gray-100 cursor-not-allowed'
              }`}
            >
              <Plus className="h-4 w-4 mr-2 inline" />
              Add Query
            </button>
          </div>
        </div>
      </div>

      {/* Queries List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-[#9CE882]" />
            User Queries ({userQueries.length})
          </h3>
        </div>

        {userQueries.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {userQueries.map((query) => (
              <div key={query.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{query.userName}</h4>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(query.status)}`}>
                        {query.status.replace('-', ' ')}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">User ID:</span> {query.userId}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Complaint:</span> {query.complaintTag}
                      </p>
                      {query.comment && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Comments:</span> {query.comment}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {query.timestamp}
                      </p>
                    </div>
                  </div>

                  <div className="ml-4">
                    <select
                      value={query.status}
                      onChange={(e) => handleStatusChange(query.id, e.target.value as 'open' | 'in-progress' | 'resolved')}
                      className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#9CE882] focus:border-[#9CE882]"
                    >
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Queries Yet</h3>
            <p className="text-gray-600">Start by adding a user query above</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserQueriesContent;