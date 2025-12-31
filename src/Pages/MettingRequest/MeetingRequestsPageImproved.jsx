import { useState, useEffect } from 'react';
import { FiSearch, FiDownload, FiEdit2, FiTrash2, FiSave, FiX, FiSettings, FiCheck, FiXCircle, FiEye, FiUser, FiCalendar, FiFilter } from 'react-icons/fi';

export default function MeetingRequestsPageImproved({ 
  meetingRequests: propMeetingRequests = [],
  updateRequestStatus, 
  updateMeetingRequest, 
  deleteMeetingRequest,
  saveMeetingResult,
  loading: propLoading = false,
  onRefresh
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [customDateFilter, setCustomDateFilter] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelRequestId, setCancelRequestId] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [formData, setFormData] = useState({
    meetingSummary: '',
    clientRequirement: '',
    outcome: 'Interested',
    nextAction: 'Follow-up Call',
    followUpDate: '',
    adminNotes: '',
    recordingUrl: '',
    recordingType: 'audio',
    recordingDuration: ''
  });

  const tabs = [{ id: 'all', label: 'All' }, { id: 'confirmed', label: 'Confirmed' }, { id: 'completed', label: 'Completed' }, { id: 'pending', label: 'Pending' }, { id: 'cancelled', label: 'Cancelled' }];
  const cancellationReasons = ['Schedule conflict', 'Client unavailable', 'Technical issues', 'Emergency situation', 'Resource unavailable', 'Other'];

  // Filter data based on search, date, and tab
  const filteredRequests = propMeetingRequests.filter(request => {
    // Search filter
    const searchMatch = !searchTerm || 
      (request.clientName || request.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.clientEmail || request.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.clientPhone || request.phone || '').includes(searchTerm);
    
    // Status filter
    const statusMatch = activeTab === 'all' || request.status === activeTab;
    
    // Date filter
    let dateMatch = true;
    if (dateFilter !== 'all') {
      const requestDate = new Date(request.date);
      const today = new Date();
      
      if (dateFilter === 'today') {
        dateMatch = requestDate.toDateString() === today.toDateString();
      } else if (dateFilter === 'yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        dateMatch = requestDate.toDateString() === yesterday.toDateString();
      } else if (dateFilter === '7days') {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        dateMatch = requestDate >= sevenDaysAgo && requestDate <= today;
      }
    }
    
    // Custom date filter
    if (customDateFilter) {
      const requestDate = new Date(request.date).toDateString();
      const filterDate = new Date(customDateFilter).toDateString();
      dateMatch = requestDate === filterDate;
    }
    
    return searchMatch && statusMatch && dateMatch;
  });
  
  // Calculate tab counts
  const tabCounts = {
    all: propMeetingRequests.length,
    confirmed: propMeetingRequests.filter(r => r.status === 'confirmed').length,
    completed: propMeetingRequests.filter(r => r.status === 'completed').length,
    pending: propMeetingRequests.filter(r => r.status === 'pending').length,
    cancelled: propMeetingRequests.filter(r => r.status === 'cancelled').length
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchTerm('');
    setDateFilter('all');
    setCustomDateFilter('');
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleDateFilter = (filter) => {
    setDateFilter(filter);
    setCustomDateFilter('');
  };

  const handleCustomDateFilter = (date) => {
    setCustomDateFilter(date);
    setDateFilter('all');
  };

  const handleStatusUpdate = async (requestId, newStatus, reason = null) => {
    try {
      await updateRequestStatus(requestId, newStatus, reason);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleCancelRequest = (requestId) => {
    setCancelRequestId(requestId);
    setShowCancelModal(true);
  };

  const confirmCancellation = async () => {
    if (!cancellationReason && !customReason.trim()) return;
    const finalReason = customReason.trim() || cancellationReason;
    await handleStatusUpdate(cancelRequestId, 'cancelled', finalReason);
    setShowCancelModal(false);
    setCancelRequestId(null);
    setCancellationReason('');
    setCustomReason('');
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return '';
    try {
      if (typeof dateValue === 'string' && dateValue.includes('-') && dateValue.length === 10) {
        return dateValue;
      }
      return new Date(dateValue).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const handleEdit = (request) => {
    setEditingId(request._id);
    setEditData({
      date: formatDate(request.date),
      time: request.time || ''
    });
  };

  const handleSave = async () => {
    try {
      await updateMeetingRequest(editingId, editData);
      setEditingId(null);
      setEditData({});
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error updating meeting request:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleMarkCompleted = (meeting) => {
    setSelectedMeeting(meeting);
    setFormData({
      meetingSummary: '',
      clientRequirement: '',
      outcome: 'Interested',
      nextAction: 'Follow-up Call',
      followUpDate: '',
      adminNotes: '',
      recordingUrl: '',
      recordingType: 'audio',
      recordingDuration: ''
    });
    setShowResultModal(true);
  };

  const handleSubmitResult = async (e) => {
    e.preventDefault();
    try {
      // First mark as completed
      await updateRequestStatus(selectedMeeting._id, 'completed');
      // Then save result
      await saveMeetingResult(selectedMeeting._id, formData);
      setShowResultModal(false);
      setSelectedMeeting(null);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error saving result:', error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this meeting request?')) {
      try {
        await deleteMeetingRequest(id);
        if (onRefresh) onRefresh();
      } catch (error) {
        console.error('Error deleting meeting request:', error);
      }
    }
  };

  const getMenuActions = (request) => {
    const actions = [
      { label: 'View Details', action: () => handleViewRequest(request), icon: FiEye },
      { label: 'Delete', action: () => handleDelete(request._id), icon: FiTrash2 }
    ];

    // Only add Edit button if meeting is not completed
    if (request.status !== 'completed') {
      actions.splice(1, 0, { label: 'Edit', action: () => handleEdit(request), icon: FiEdit2 });
    }

    if (request.status === 'pending') {
      actions.push(
        { label: 'Confirm', action: () => handleStatusUpdate(request._id, 'confirmed'), icon: FiCheck },
        { label: 'Cancel', action: () => handleCancelRequest(request._id), icon: FiXCircle }
      );
    } else if (request.status === 'confirmed') {
      actions.push(
        { label: 'Mark Completed', action: () => handleMarkCompleted(request), icon: FiCheck },
        { label: 'Cancel', action: () => handleCancelRequest(request._id), icon: FiXCircle }
      );
    } else if (request.status !== 'completed') {
      actions.push({ label: 'Reset', action: () => handleStatusUpdate(request._id, 'pending'), icon: FiCheck });
    }

    return actions;
  };

  const statusColors = {
    confirmed: { dot: 'bg-green-400', badge: 'bg-green-100 text-green-800' },
    completed: { dot: 'bg-blue-400', badge: 'bg-blue-100 text-blue-800' },
    cancelled: { dot: 'bg-red-400', badge: 'bg-red-100 text-red-800' },
    pending: { dot: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-800' }
  };

  const getStatusColor = (status) => statusColors[status]?.dot || statusColors.pending.dot;
  const getStatusBadgeColor = (status) => statusColors[status]?.badge || statusColors.pending.badge;
  const getStatusLabel = (status) => status.charAt(0).toUpperCase() + status.slice(1);

  const exportToCSV = async () => {
    try {
      if (filteredRequests.length === 0) return alert('No data to export!');

      const headers = ['Name', 'Email', 'Phone', 'Date', 'Time', 'Status', 'Message', 'Created At'];
      const csvContent = [
        headers.join(','),
        ...filteredRequests.map(request => [
          `"${request.clientName || request.name || ''}"`,
          `"${request.clientEmail || request.email || ''}"`,
          `"${request.clientPhone || request.phone || ''}"`,
          `"${request.date || ''}"`,
          `"${request.time || ''}"`,
          `"${request.status || ''}"`,
          `"${request.message || ''}"`,
          `"${new Date(request.createdAt).toLocaleDateString()}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `meeting-requests-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (error) {
      alert('Failed to export data');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meeting Requests</h1>
          <p className="mt-2 text-gray-600">Manage and track all meeting requests</p>
        </div>

        {/* Search and Filters */}
        <div className="rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6" style={{background: 'linear-gradient(to right, #eff6ff, #eef2ff)'}}>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Left side - Search */}
            <div className="relative w-full sm:w-64">
              <FiSearch size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              />
            </div>

            {/* Middle - Date Filter Switches */}
            <div className="flex flex-wrap gap-2 items-center">
              {[
                { value: 'all', label: 'All' },
                { value: 'today', label: 'Today' },
                { value: 'yesterday', label: 'Yesterday' },
                { value: '7days', label: '7 Days' }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => handleDateFilter(filter.value)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    dateFilter === filter.value
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
              
              {/* Calendar Input */}
              <div className="flex items-center gap-2 ml-2">
                <FiCalendar size={16} className="text-gray-400" />
                <input
                  type="date"
                  value={customDateFilter}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                  onChange={(e) => handleCustomDateFilter(e.target.value)}
                />
              </div>
            </div>
            
            {/* Right side - Export */}
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
            >
              <FiDownload size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex space-x-1 px-6 py-2 min-w-max" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tabCounts[tab.id] || 0}
                  </span>
                </button>
              ))}
            </nav>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {propLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium">Loading meeting requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <FiCalendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No meeting requests found</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Try adjusting your search criteria' : 'No requests in this category'}
                </p>
              </div>
            ) : (
              <>
                {/* Responsive Table */}
                <div className="overflow-x-auto overflow-y-auto" style={{height: '500px'}}>
                  <div className="min-w-full">
                    <table className="w-full min-w-[800px]">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Client</th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">Contact</th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Date & Time</th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Purpose</th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Status</th>
                          <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredRequests.map((request) => (
                          <tr key={request._id} className="hover:bg-gray-50">
                            <td className="px-3 sm:px-6 py-4 min-w-[150px]" onClick={(e) => e.stopPropagation()}>
                            {editingId === request._id ? (
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {request.clientName || request.name || 'N/A'}
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                  <FiUser className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {request.clientName || request.name || 'N/A'}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-3 sm:px-6 py-4 min-w-[180px]" onClick={(e) => e.stopPropagation()}>
                            {editingId === request._id ? (
                              <div>
                                <div className="text-sm text-gray-900 truncate">{request.clientEmail || request.email || 'N/A'}</div>
                                <div className="text-xs text-gray-500 truncate">{request.clientPhone || request.phone || 'N/A'}</div>
                              </div>
                            ) : (
                              <div>
                                <div className="text-sm text-gray-900 truncate">{request.clientEmail || request.email || 'N/A'}</div>
                                <div className="text-xs text-gray-500 truncate">{request.clientPhone || request.phone || 'N/A'}</div>
                              </div>
                            )}
                          </td>
                          <td className="px-3 sm:px-6 py-4 min-w-[120px]" onClick={(e) => e.stopPropagation()}>
                            {editingId === request._id ? (
                              <div className="space-y-1">
                                <input
                                  type="date"
                                  value={editData.date}
                                  onChange={(e) => setEditData({...editData, date: e.target.value})}
                                  className="w-full px-2 py-1 text-xs border rounded"
                                />
                                <input
                                  type="time"
                                  value={editData.time}
                                  onChange={(e) => setEditData({...editData, time: e.target.value})}
                                  className="w-full px-2 py-1 text-xs border rounded"
                                />
                              </div>
                            ) : (
                              <div>
                                <div className="text-sm text-gray-900">
                                  {request.date ? new Date(request.date).toLocaleDateString('en-US', {
                                    month: 'short', day: 'numeric', year: 'numeric'
                                  }) : 'N/A'}
                                </div>
                                <div className="text-xs text-gray-500">{request.time || 'N/A'}</div>
                              </div>
                            )}
                          </td>
                          <td className="px-3 sm:px-6 py-4 min-w-[200px]" onClick={(e) => e.stopPropagation()}>
                            {editingId === request._id ? (
                              <div>
                                <div className="text-sm text-gray-900">
                                  <p className="line-clamp-2">{request.message || 'No purpose specified'}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-900">
                                <p className="line-clamp-2">{request.message || 'No purpose specified'}</p>
                              </div>
                            )}
                          </td>
                          <td className="px-3 sm:px-6 py-4 min-w-[100px]" onClick={() => handleViewRequest(request)}>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(request.status)}`}>
                              {getStatusLabel(request.status)}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-4 min-w-[80px]" onClick={(e) => e.stopPropagation()}>
                            {editingId === request._id ? (
                              <div className="flex space-x-1">
                                <button
                                  onClick={handleSave}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                >
                                  <FiSave size={14} />
                                </button>
                                <button
                                  onClick={handleCancel}
                                  className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                                >
                                  <FiX size={14} />
                                </button>
                              </div>
                            ) : (
                              <div className="relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(openMenuId === request._id ? null : request._id);
                                  }}
                                  className="p-1 rounded hover:bg-gray-50 text-gray-600"
                                >
                                  <FiSettings size={16} />
                                </button>
                                
                                {openMenuId === request._id && (
                                  <div className="absolute right-0 top-8 w-40 bg-white rounded-lg shadow-lg py-1 z-[9999]">
                                    {getMenuActions(request).map((action, index) => (
                                      <button
                                        key={index}
                                        onClick={() => {
                                          action.action();
                                          setOpenMenuId(null);
                                        }}
                                        className="w-full px-3 py-1 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                      >
                                        <action.icon size={14} />
                                        {action.label}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {openMenuId && (
        <div 
          className="fixed inset-0 z-[9998]" 
          onClick={() => setOpenMenuId(null)}
        />
      )}

      {/* View Details Modal */}
      {showViewModal && selectedRequest && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Meeting Request Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="text-gray-900">{selectedRequest.clientName || selectedRequest.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-gray-900">{selectedRequest.clientEmail || selectedRequest.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <p className="text-gray-900">{selectedRequest.clientPhone || selectedRequest.phone}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Meeting Purpose</label>
                <p className="text-gray-900">{selectedRequest.message || 'No purpose specified'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                <p className="text-gray-900">
                  {selectedRequest.date ? new Date(selectedRequest.date).toLocaleDateString('en-US', {
                    year: 'numeric', month: '2-digit', day: '2-digit'
                  }) : 'N/A'} at {selectedRequest.time || 'N/A'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                  selectedRequest.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  selectedRequest.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedRequest.status}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Created At</label>
                <p className="text-gray-900">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Meeting</h3>
            <p className="text-gray-600 mb-4">Please select a reason or add a message:</p>
            
            <select
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 mb-4"
            >
              <option value="">Select a reason...</option>
              {cancellationReasons.map((reason) => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cancellation Message:
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter cancellation message..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelRequestId(null);
                  setCancellationReason('');
                  setCustomReason('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmCancellation}
                disabled={!cancellationReason && !customReason.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Result Modal */}
      {showResultModal && selectedMeeting && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Complete Meeting & Add Result</h3>
                <button
                  onClick={() => setShowResultModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <FiX size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmitResult} className="space-y-6">
                {/* Meeting Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Meeting Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Client:</span>
                      <span className="ml-2 font-medium">{selectedMeeting.clientName || selectedMeeting.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <span className="ml-2">{new Date(selectedMeeting.date).toLocaleDateString()} at {selectedMeeting.time}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2">{selectedMeeting.clientEmail || selectedMeeting.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-2">{selectedMeeting.clientPhone || selectedMeeting.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Meeting Summary */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Summary *</label>
                  <textarea
                    value={formData.meetingSummary}
                    onChange={(e) => setFormData({...formData, meetingSummary: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="What was discussed in the meeting?"
                    required
                  />
                </div>

                {/* Client Requirement */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client Requirement *</label>
                  <textarea
                    value={formData.clientRequirement}
                    onChange={(e) => setFormData({...formData, clientRequirement: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="What does the client need?"
                    required
                  />
                </div>

                {/* Outcome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Outcome *</label>
                  <select
                    value={formData.outcome}
                    onChange={(e) => setFormData({...formData, outcome: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="Interested">Interested</option>
                    <option value="Not Interested">Not Interested</option>
                    <option value="Need Time">Need Time</option>
                    <option value="Deal Closed">Deal Closed</option>
                  </select>
                </div>

                {/* Next Action */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Next Action *</label>
                  <select
                    value={formData.nextAction}
                    onChange={(e) => setFormData({...formData, nextAction: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="Follow-up Call">Follow-up Call</option>
                    <option value="Proposal Send">Proposal Send</option>
                    <option value="Demo Required">Demo Required</option>
                    <option value="None">None</option>
                  </select>
                </div>

                {/* Follow-up Date */}
                {formData.nextAction !== 'None' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date</label>
                    <input
                      type="date"
                      value={formData.followUpDate}
                      onChange={(e) => setFormData({...formData, followUpDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                )}

                {/* Admin Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Internal Notes</label>
                  <textarea
                    value={formData.adminNotes}
                    onChange={(e) => setFormData({...formData, adminNotes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="Internal admin notes"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowResultModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Complete & Save Result
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}