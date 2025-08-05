import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Tag, AlertCircle, Check } from 'lucide-react';

interface ComplaintTagsManagementProps {
  userRole: string;
}

const ComplaintTagsManagement: React.FC<ComplaintTagsManagementProps> = ({ userRole }) => {
  const [complaintTags, setComplaintTags] = useState<string[]>(() => {
    try {
      const savedTags = localStorage.getItem('kam-complaint-tags');
      return savedTags ? JSON.parse(savedTags) : [
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
    } catch (error) {
      console.error('Error loading complaint tags from localStorage:', error);
      return [];
    }
  });

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Save tags to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('kam-complaint-tags', JSON.stringify(complaintTags));
  const handleStartEdit = (index: number, currentValue: string) => {
    setEditingIndex(index);
    setEditingValue(currentValue);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editingValue.trim()) {
      const updatedTags = [...complaintTags];
      updatedTags[editingIndex] = editingValue.trim();
      setComplaintTags(updatedTags);
      setEditingIndex(null);
      setEditingValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingValue('');
  };

  const handleAddNew = () => {
    if (newTag.trim() && !complaintTags.includes(newTag.trim())) {
      setComplaintTags([...complaintTags, newTag.trim()]);
      setNewTag('');
      setIsAddingNew(false);
    }
  };

  const handleDelete = (index: number) => {
    const updatedTags = complaintTags.filter((_, i) => i !== index);
    setComplaintTags(updatedTags);
    setDeleteConfirm(null);
  };

  const handleCancelAdd = () => {
    setNewTag('');
    setIsAddingNew(false);
  };

  if (userRole !== 'admin') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600">This section is only available to administrators</p>
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
              Complaint Tags Management
            </h1>
            <p className="text-gray-600 mt-2">Add, edit, and delete complaint tags used throughout the system</p>
          </div>
          <div className="bg-gradient-to-r from-[#9CE882] to-[#82E89C] rounded-lg p-4">
            <Edit2 className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tags</p>
              <p className="text-2xl font-bold text-gray-900">{complaintTags.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-[#9CE882] to-[#82E89C] rounded-lg flex items-center justify-center">
              <Tag className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recently Added</p>
              <p className="text-2xl font-bold text-blue-600">0</p>
              <p className="text-xs text-gray-500">This session</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Plus className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Status</p>
              <p className="text-lg font-bold text-green-600">Active</p>
              <p className="text-xs text-gray-500">All tags available</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-lg flex items-center justify-center">
              <Check className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Add New Tag Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Plus className="h-5 w-5 mr-2 text-[#9CE882]" />
          Add New Complaint Tag
        </h3>

        {!isAddingNew ? (
          <button
            onClick={() => setIsAddingNew(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#9CE882] transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Tag
          </button>
        ) : (
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Enter new complaint tag..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CE882] focus:border-[#9CE882]"
              onKeyPress={(e) => e.key === 'Enter' && handleAddNew()}
              autoFocus
            />
            <button
              onClick={handleAddNew}
              disabled={!newTag.trim() || complaintTags.includes(newTag.trim())}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                newTag.trim() && !complaintTags.includes(newTag.trim())
                  ? 'text-white bg-gradient-to-r from-[#9CE882] to-[#82E89C] hover:from-[#8BD871] hover:to-[#71D78B] shadow-md hover:shadow-lg'
                  : 'text-gray-400 bg-gray-100 cursor-not-allowed'
              }`}
            >
              <Save className="h-4 w-4 mr-1 inline" />
              Save
            </button>
            <button
              onClick={handleCancelAdd}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <X className="h-4 w-4 mr-1 inline" />
              Cancel
            </button>
          </div>
        )}

        {newTag.trim() && complaintTags.includes(newTag.trim()) && (
          <p className="text-sm text-red-600 mt-2">This tag already exists</p>
        )}
      </div>

      {/* Tags List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Tag className="h-5 w-5 mr-2 text-[#9CE882]" />
            Complaint Tags ({complaintTags.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {complaintTags.map((tag, index) => (
            <div key={index} className="p-4 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-center justify-between">
                {editingIndex === index ? (
                  <div className="flex items-center space-x-3 flex-1">
                    <input
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9CE882] focus:border-[#9CE882]"
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                      autoFocus
                    />
                    <button
                      onClick={handleSaveEdit}
                      disabled={!editingValue.trim()}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        editingValue.trim()
                          ? 'text-white bg-gradient-to-r from-[#9CE882] to-[#82E89C] hover:from-[#8BD871] hover:to-[#71D78B]'
                          : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                      }`}
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <span className="text-gray-900 font-medium">{tag}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleStartEdit(index, tag)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        title="Edit tag"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      {deleteConfirm === index ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-red-600">Delete?</span>
                          <button
                            onClick={() => handleDelete(index)}
                            className="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors duration-200"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors duration-200"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(index)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Delete tag"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {complaintTags.length === 0 && (
          <div className="text-center py-12">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Tags Available</h3>
            <p className="text-gray-600">Start by adding your first complaint tag</p>
          </div>
        )}
      </div>

      {/* Usage Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="text-lg font-medium text-blue-900 mb-3">Important Information</h4>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• Changes to complaint tags will affect all dropdowns throughout the system</p>
          <p>• Existing records with deleted tags will retain their original tag values</p>
          <p>• New tags will be immediately available in call records, user queries, and analytics</p>
          <p>• Tags are stored locally and will persist across browser sessions</p>
        </div>
      </div>
    </div>
  );
};

export default ComplaintTagsManagement;