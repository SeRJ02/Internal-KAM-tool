import React, { useState, useMemo } from 'react';
import { Search, Plus, X, Tag, Users, ShoppingBag, Check } from 'lucide-react';

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

interface RetailerTag {
  userId: string;
  userName: string;
  retailers: string[];
  timestamp: string;
}

interface RetailerTaggingProps {
  excelData: ExcelData[];
  onRetailerTagUpdate?: (tag: RetailerTag) => void;
}

const RetailerTagging: React.FC<RetailerTaggingProps> = ({ excelData, onRetailerTagUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTaggingUser, setActiveTaggingUser] = useState<string | null>(null);
  const [selectedRetailers, setSelectedRetailers] = useState<string[]>([]);
  const [retailerTags, setRetailerTags] = useState<RetailerTag[]>(() => {
    try {
      const savedTags = localStorage.getItem('kam-retailer-tags');
      return savedTags ? JSON.parse(savedTags) : [];
    } catch (error) {
      console.error('Error loading retailer tags from localStorage:', error);
      return [];
    }
  });

  const retailerOptions = [
    'Myntra',
    'Nykaa', 
    'Flipkart',
    'Amazon',
    'Truemeds',
    'Dot&Key',
    'Ajio',
    'OctaFX',
    'Scapia',
    'Rio',
    'FirstCry',
    'Cadbury',
    'Reliance Digital',
    'Other'
  ];

  // Save retailer tags to localStorage whenever they change
  React.useEffect(() => {
    try {
      localStorage.setItem('kam-retailer-tags', JSON.stringify(retailerTags));
    } catch (error) {
      console.error('Error saving retailer tags to localStorage:', error);
    }
  }, [retailerTags]);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return excelData;
    return excelData.filter(user =>
      user.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(user.UserID).toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.POC.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [excelData, searchTerm]);

  // Get existing tags for a user
  const getUserTags = (userId: string): string[] => {
    const userTag = retailerTags.find(tag => tag.userId === userId);
    return userTag ? userTag.retailers : [];
  };

  // Handle retailer selection
  const handleRetailerToggle = (retailer: string) => {
    setSelectedRetailers(prev => {
      if (prev.includes(retailer)) {
        return prev.filter(r => r !== retailer);
      } else if (prev.length < 3) {
        return [...prev, retailer];
      }
      return prev; // Don't add if already at max (3)
    });
  };

  // Save retailer tags for user
  const handleSaveRetailerTags = (userId: string, userName: string) => {
    if (selectedRetailers.length === 0) {
      alert('Please select at least one retailer');
      return;
    }

    const newTag: RetailerTag = {
      userId,
      userName,
      retailers: [...selectedRetailers],
      timestamp: new Date().toLocaleString()
    };

    setRetailerTags(prev => {
      const existingIndex = prev.findIndex(tag => tag.userId === userId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newTag;
        return updated;
      } else {
        return [...prev, newTag];
      }
    });

    if (onRetailerTagUpdate) {
      onRetailerTagUpdate(newTag);
    }

    // Reset state
    setActiveTaggingUser(null);
    setSelectedRetailers([]);
    
    alert('Retailer tags saved successfully!');
  };

  // Start tagging process
  const handleStartTagging = (userId: string) => {
    const existingTags = getUserTags(userId);
    setSelectedRetailers(existingTags);
    setActiveTaggingUser(userId);
  };

  // Cancel tagging
  const handleCancelTagging = () => {
    setActiveTaggingUser(null);
    setSelectedRetailers([]);
  };

  // Statistics
  const stats = useMemo(() => {
    const totalUsers = excelData.length;
    const taggedUsers = retailerTags.length;
    const untaggedUsers = totalUsers - taggedUsers;
    
    const retailerCounts: Record<string, number> = {};
    retailerTags.forEach(tag => {
      tag.retailers.forEach(retailer => {
        retailerCounts[retailer] = (retailerCounts[retailer] || 0) + 1;
      });
    });
    
    const topRetailer = Object.entries(retailerCounts)
      .sort(([,a], [,b]) => b - a)[0];
    
    return { totalUsers, taggedUsers, untaggedUsers, topRetailer };
  }, [excelData, retailerTags]);

  if (excelData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No User Data Available</h3>
          <p className="text-gray-600">Import performance data to start tagging retailers</p>
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
              <Tag className="h-6 w-6 mr-3 text-[#9CE882]" />
              Retailer Tagging
            </h1>
            <p className="text-gray-600 mt-2">Tag users with their primary retailers (1-3 retailers per user)</p>
          </div>
          <div className="bg-gradient-to-r from-[#9CE882] to-[#82E89C] rounded-lg p-4">
            <ShoppingBag className="h-8 w-8 text-white" />
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
              <p className="text-sm font-medium text-gray-600">Tagged Users</p>
              <p className="text-2xl font-bold text-green-600">{stats.taggedUsers}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-lg flex items-center justify-center">
              <Check className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Untagged Users</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.untaggedUsers}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
              <Plus className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Top Retailer</p>
              <p className="text-lg font-bold text-gray-900">
                {stats.topRetailer ? stats.topRetailer[0] : 'None'}
              </p>
              <p className="text-xs text-gray-500">
                {stats.topRetailer ? `${stats.topRetailer[1]} users` : ''}
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-[#9C82E8] to-[#82E89C] rounded-lg flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by User ID, name, or POC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CE882] focus:border-[#9CE882]"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2 text-[#9CE882]" />
            Users ({filteredUsers.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredUsers.map((user) => {
            const userTags = getUserTags(user.UserID);
            const isTagging = activeTaggingUser === user.UserID;
            
            return (
              <div key={user.UserID} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{user.Name}</h4>
                        <p className="text-sm text-gray-600">
                          ID: {user.UserID} | POC: {user.POC}
                        </p>
                        <div className="flex items-center mt-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.ProRatedAch < 50 ? 'bg-red-100 text-red-800' :
                            user.ProRatedAch < 75 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.ProRatedAch}% Achievement
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Current Tags Display */}
                    {userTags.length > 0 && !isTagging && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Current Retailers:</p>
                        <div className="flex flex-wrap gap-2">
                          {userTags.map(retailer => (
                            <span key={retailer} className="inline-flex px-3 py-1 text-sm bg-[#9CE882] text-white rounded-full">
                              {retailer}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Retailer Selection Interface */}
                    {isTagging && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-900">Select Retailers (1-3):</h5>
                          <span className="text-sm text-gray-500">
                            {selectedRetailers.length}/3 selected
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-4">
                          {retailerOptions.map(retailer => (
                            <button
                              key={retailer}
                              onClick={() => handleRetailerToggle(retailer)}
                              disabled={!selectedRetailers.includes(retailer) && selectedRetailers.length >= 3}
                              className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 ${
                                selectedRetailers.includes(retailer)
                                  ? 'bg-[#9CE882] text-white border-[#9CE882]'
                                  : selectedRetailers.length >= 3
                                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-[#9CE882] hover:bg-gray-50'
                              }`}
                            >
                              {retailer}
                            </button>
                          ))}
                        </div>

                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={handleCancelTagging}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveRetailerTags(user.UserID, user.Name)}
                            disabled={selectedRetailers.length === 0}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                              selectedRetailers.length > 0
                                ? 'text-white bg-gradient-to-r from-[#9CE882] to-[#82E89C] hover:from-[#8BD871] hover:to-[#71D78B] shadow-md hover:shadow-lg'
                                : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                            }`}
                          >
                            Save Tags
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  {!isTagging && (
                    <button
                      onClick={() => handleStartTagging(user.UserID)}
                      className="ml-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#9CE882] transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {userTags.length > 0 ? 'Edit Tags' : 'Add Tags'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      {/* Recent Tagging Activity */}
      {retailerTags.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Tagging Activity</h3>
          <div className="space-y-3">
            {retailerTags
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, 5)
              .map((tag, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{tag.userName}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tag.retailers.map(retailer => (
                        <span key={retailer} className="inline-flex px-2 py-1 text-xs bg-[#9CE882] text-white rounded-full">
                          {retailer}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">{tag.timestamp}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RetailerTagging;