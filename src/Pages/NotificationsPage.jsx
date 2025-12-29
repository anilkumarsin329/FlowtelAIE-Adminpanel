import { FiClock, FiUsers, FiMail, FiCalendar, FiArrowLeft, FiSearch, FiFilter, FiTrash2, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function NotificationsPage({ 
  meetingRequests, 
  demoRequests, 
  newsletters, 
  viewedNotifications, 
  deleteNotification, 
  deleteAllNotifications 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  // Combine all notifications with timestamps
  const allNotifications = [
    ...meetingRequests.map(req => ({
      id: req._id,
      type: 'meeting',
      title: `Meeting Request from ${req.name}`,
      description: `Meeting scheduled for ${req.date} at ${req.time}`,
      details: `Contact: ${req.email} | Phone: ${req.phone}`,
      status: req.status,
      timestamp: new Date(req.createdAt),
      icon: FiClock,
      color: 'blue',
      isRead: viewedNotifications?.has(`meeting-${req._id}`) || false
    })),
    ...demoRequests.map(req => ({
      id: req._id,
      type: 'demo',
      title: `Demo Request from ${req.name}`,
      description: `Demo requested for ${req.hotel}`,
      details: `${req.rooms} rooms | Contact: ${req.email}`,
      status: 'pending',
      timestamp: new Date(req.createdAt),
      icon: FiUsers,
      color: 'green',
      isRead: viewedNotifications?.has(`demo-${req._id}`) || false
    })),
    ...newsletters.slice(0, 10).map(sub => ({
      id: sub._id,
      type: 'newsletter',
      title: `New Newsletter Subscription`,
      description: `${sub.email} subscribed to newsletter`,
      details: `Status: ${sub.isActive ? 'Active' : 'Inactive'}`,
      status: sub.isActive ? 'active' : 'inactive',
      timestamp: new Date(sub.createdAt),
      icon: FiMail,
      color: 'purple',
      isRead: viewedNotifications?.has(`newsletter-${sub._id}`) || false
    }))
  ].sort((a, b) => b.timestamp - a.timestamp);

  // Filter notifications based on search and filters
  const filteredNotifications = allNotifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || notification.type === filterType;
    
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'read' && notification.isRead) ||
                         (filterStatus === 'unread' && !notification.isRead);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (type, status) => {
    if (type === 'meeting') {
      return status === 'confirmed' ? 'bg-green-100 text-green-800' :
             status === 'cancelled' ? 'bg-red-100 text-red-800' :
             'bg-yellow-100 text-yellow-800';
    }
    if (type === 'demo') return 'bg-blue-100 text-blue-800';
    if (type === 'newsletter') {
      return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getIconColor = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600'
    };
    return colors[color] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions - Moved to Top */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link 
          to="/requests"
          className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiClock className="text-blue-600" size={16} />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Meeting Requests</h3>
              <p className="text-sm text-gray-600">{meetingRequests.length} total</p>
            </div>
          </div>
        </Link>
        
        <Link 
          to="/demos"
          className="p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <FiUsers className="text-green-600" size={16} />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Demo Requests</h3>
              <p className="text-sm text-gray-600">{demoRequests.length} total</p>
            </div>
          </div>
        </Link>
        
        <Link 
          to="/newsletters"
          className="p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiMail className="text-purple-600" size={16} />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Newsletter Subscribers</h3>
              <p className="text-sm text-gray-600">{newsletters.length} total</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link 
            to="/dashboard"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">All Notifications</h1>
            <p className="text-gray-600">{filteredNotifications.length} of {allNotifications.length} notifications</p>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
            />
          </div>
          
          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="meeting">Meetings</option>
              <option value="demo">Demos</option>
              <option value="newsletter">Newsletter</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
          
          {/* Delete All Button */}
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete all notifications?')) {
                deleteAllNotifications();
              }
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <FiTrash2 size={16} />
            <span className="hidden sm:inline">Delete All</span>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <FiCalendar className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                ? 'No matching notifications' 
                : 'No Notifications'
              }
            </h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : "You're all caught up! No notifications to show."
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => {
              const IconComponent = notification.icon;
              return (
                <div key={`${notification.type}-${notification.id}`} className={`p-4 transition-colors ${
                  notification.isRead ? 'hover:bg-gray-50' : 'bg-blue-50/30 hover:bg-blue-50/50 border-l-4 border-blue-500'
                }`}>
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getIconColor(notification.color)}`}>
                      <IconComponent size={18} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className={`font-medium ${
                              notification.isRead ? 'text-gray-800' : 'text-gray-900 font-semibold'
                            }`}>{notification.title}</h3>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.details}</p>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(notification.type, notification.status)}`}>
                            {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                          </span>
                          <button
                            onClick={() => deleteNotification(notification.type, notification.id)}
                            className="p-1 hover:bg-red-100 rounded text-red-600 hover:text-red-700 transition-colors"
                            title="Delete notification"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {notification.timestamp.toLocaleDateString()} {notification.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}