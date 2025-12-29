import { useState, useEffect } from 'react';
import { FiSearch, FiDownload, FiEdit2, FiTrash2, FiSave, FiX, FiSettings, FiCheck, FiXCircle, FiEye, FiUser, FiCalendar, FiFilter } from 'react-icons/fi';

export default function MeetingRequestsBase({ 
  title,
  status = 'all',
  updateRequestStatus, 
  updateMeetingRequest, 
  deleteMeetingRequest 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [meetingRequests, setMeetingRequests] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelRequestId, setCancelRequestId] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const itemsPerPage = 10;
  const cancellationReasons = ['Schedule conflict', 'Client unavailable', 'Technical issues', 'Emergency situation', 'Resource unavailable', 'Other'];

  const getDateRange = (filter) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    switch (filter) {
      case 'today':
        return { start: today.toISOString().split('T')[0], end: today.toISOString().split('T')[0] };
      case 'yesterday':
        return { start: yesterday.toISOString().split('T')[0], end: yesterday.toISOString().split('T')[0] };
      case '7days':
        return { start: sevenDaysAgo.toISOString().split('T')[0], end: today.toISOString().split('T')[0] };
      default:
        return null;
    }
  };

  const fetchMeetingRequests = async (page = 1, search = '', dateFilterValue = dateFilter) => {
    setLoading(true);
    try {
      const credentials = btoa('admin:flowtel123');
      const params = new URLSearchParams({ page: page.toString(), limit: itemsPerPage.toString() });
      if (status !== 'all') params.append('status', status);
      if (search.trim()) params.append('search', search.trim());
      
      const dateRange = getDateRange(dateFilterValue);
      if (dateRange) {
        params.append('dateFrom', dateRange.start);
        params.append('dateTo', dateRange.end);
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/meetings/requests?${params}`, {
        headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        setMeetingRequests(data.data || []);
        setTotalItems(data.total || 0);
      } else {
        setMeetingRequests([]);
        setTotalItems(0);
      }
    } catch (error) {
      setMeetingRequests([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetingRequests(currentPage, searchTerm, dateFilter);
  }, [status, dateFilter]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
    fetchMeetingRequests(1, term, dateFilter);
  };

  const handleDateFilter = (filter) => {
    setDateFilter(filter);
    setCurrentPage(1);
    fetchMeetingRequests(1, searchTerm, filter);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchMeetingRequests(page, searchTerm, dateFilter);
  };

  const handleStatusUpdate = async (requestId, newStatus, reason = null) => {
    try {
      await updateRequestStatus(requestId, newStatus, reason);
      fetchMeetingRequests(currentPage, searchTerm, dateFilter);
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
      clientName: request.clientName || request.name || '',
      clientEmail: request.clientEmail || request.email || '',
      clientPhone: request.clientPhone || request.phone || '',
      date: formatDate(request.date),
      time: request.time || '',
      message: request.message || ''
    });
  };

  const handleSave = async () => {
    try {
      await updateMeetingRequest(editingId, editData);
      setEditingId(null);
      setEditData({});
      fetchMeetingRequests(currentPage, searchTerm, dateFilter);
    } catch (error) {
      console.error('Error updating meeting request:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this meeting request?')) {
      try {
        await deleteMeetingRequest(id);
        fetchMeetingRequests(currentPage, searchTerm, dateFilter);
      } catch (error) {
        console.error('Error deleting meeting request:', error);
      }
    }
  };

  const getMenuActions = (request) => {
    const actions = [
      { label: 'View Details', action: () => handleViewRequest(request), icon: FiEye },
      { label: 'Edit', action: () => handleEdit(request), icon: FiEdit2 },
      { label: 'Delete', action: () => handleDelete(request._id), icon: FiTrash2 }
    ];

    if (request.status === 'pending') {
      actions.push(
        { label: 'Confirm', action: () => handleStatusUpdate(request._id, 'confirmed'), icon: FiCheck },
        { label: 'Cancel', action: () => handleCancelRequest(request._id), icon: FiXCircle }
      );
    } else if (request.status === 'confirmed') {
      actions.push(
        { label: 'Mark Completed', action: () => handleStatusUpdate(request._id, 'completed'), icon: FiCheck },
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
      const credentials = btoa('admin:flowtel123');
      const params = new URLSearchParams({ export: 'true' });
      if (status !== 'all') params.append('status', status);
      if (searchTerm.trim()) params.append('search', searchTerm.trim());

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/meetings/requests?${params}`, {
        headers: { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        const requests = data.data || [];
        if (requests.length === 0) return alert('No data to export!');

        const headers = ['Name', 'Email', 'Phone', 'Date', 'Time', 'Status', 'Message', 'Created At'];
        const csvContent = [
          headers.join(','),
          ...requests.map(request => [
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
        link.download = `meeting-requests-${status}-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
      }
    } catch (error) {
      alert('Failed to export data');
    }
  };

  const PaginationComponent = () => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    return (
      <div className="flex items-center justify-between px-6 py-6 border-t border-gray-100 bg-gray-50">
        <div className="text-sm font-medium text-gray-700">
          Showing {startIndex + 1} to {endIndex} of {totalItems} results
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-xl hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm font-medium text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-xl hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="mt-2 text-gray-600">Manage and track meeting requests</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <FiSearch size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div className="relative">
                <FiFilter size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={dateFilter}
                  onChange={(e) => handleDateFilter(e.target.value)}
                  className="pl-12 pr-8 py-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white min-w-[140px]"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="7days">Last 7 Days</option>
                </select>
              </div>
            </div>
            
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
            >
              <FiDownload size={16} />
              Export
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="p-6">
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium">Loading meeting requests...</p>
              </div>
            ) : meetingRequests.length === 0 ? (
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
                <div className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date & Time</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Purpose</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {meetingRequests.map((request) => (
                          <tr key={request._id} className="hover:bg-gray-50 transition-colors h-20">
                            <td className="px-6 py-5">
                              {editingId === request._id ? (
                                <input
                                  type="text"
                                  value={editData.clientName}
                                  onChange={(e) => setEditData({...editData, clientName: e.target.value})}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              ) : (
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                    <FiUser className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div className="text-sm font-semibold text-gray-900">
                                    {request.clientName || request.name || 'N/A'}
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-5">
                              {editingId === request._id ? (
                                <div className="space-y-2">
                                  <input
                                    type="email"
                                    value={editData.clientEmail}
                                    onChange={(e) => setEditData({...editData, clientEmail: e.target.value})}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Email"
                                  />
                                  <input
                                    type="tel"
                                    value={editData.clientPhone}
                                    onChange={(e) => setEditData({...editData, clientPhone: e.target.value})}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Phone"
                                  />
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <div className="text-sm font-medium text-gray-900">{request.clientEmail || request.email || 'N/A'}</div>
                                  <div className="text-sm text-gray-600">{request.clientPhone || request.phone || 'N/A'}</div>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-5">
                              {editingId === request._id ? (
                                <div className="space-y-2">
                                  <input
                                    type="date"
                                    value={editData.date}
                                    onChange={(e) => setEditData({...editData, date: e.target.value})}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                  <input
                                    type="time"
                                    value={editData.time}
                                    onChange={(e) => setEditData({...editData, time: e.target.value})}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <div className="text-sm font-medium text-gray-900">
                                    {request.date ? new Date(request.date).toLocaleDateString('en-US', {
                                      year: 'numeric', month: 'short', day: 'numeric'
                                    }) : 'N/A'}
                                  </div>
                                  <div className="text-sm text-gray-600">{request.time || 'N/A'}</div>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-5">
                              {editingId === request._id ? (
                                <textarea
                                  value={editData.message}
                                  onChange={(e) => setEditData({...editData, message: e.target.value})}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                  rows={3}
                                />
                              ) : (
                                <div className="text-sm text-gray-900 max-w-xs">
                                  <p className="line-clamp-2">{request.message || 'No purpose specified'}</p>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-5">
                              <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full ${getStatusBadgeColor(request.status)}`}>
                                <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(request.status)}`}></div>
                                {getStatusLabel(request.status)}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              {editingId === request._id ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={handleSave}
                                    className="p-2.5 text-green-600 hover:bg-green-50 rounded-xl transition-colors border border-green-200"
                                  >
                                    <FiSave size={16} />
                                  </button>
                                  <button
                                    onClick={handleCancel}
                                    className="p-2.5 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors border border-gray-200"
                                  >
                                    <FiX size={16} />
                                  </button>
                                </div>
                              ) : (
                                <div className="relative">
                                  <button
                                    onClick={() => setOpenMenuId(openMenuId === request._id ? null : request._id)}
                                    className="p-2.5 rounded-xl transition-colors hover:bg-gray-50 text-gray-600 border border-gray-200"
                                  >
                                    <FiSettings size={18} />
                                  </button>
                                  
                                  {openMenuId === request._id && (
                                    <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                                      {getMenuActions(request).map((action, index) => (
                                        <button
                                          key={index}
                                          onClick={() => {
                                            action.action();
                                            setOpenMenuId(null);
                                          }}
                                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                        >
                                          <action.icon size={16} />
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
                <PaginationComponent />
              </>
            )}
          </div>
        </div>
      </div>

      {openMenuId && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setOpenMenuId(null)}
        />
      )}

      {showViewModal && selectedRequest && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl border border-gray-200 relative z-10 pointer-events-auto">
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

      {showCancelModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl border border-gray-200 relative z-10 pointer-events-auto">
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
    </div>
  );
}