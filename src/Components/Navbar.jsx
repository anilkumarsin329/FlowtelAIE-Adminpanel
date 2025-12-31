import { FiRefreshCw, FiBell, FiUser, FiMenu, FiChevronLeft, FiChevronRight, FiX, FiClock, FiUsers, FiMail } from 'react-icons/fi';
import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ 
  loading, 
  onRefresh, 
  stats, 
  sidebarCollapsed, 
  setSidebarCollapsed, 
  setMobileOpen, 
  showNotifications, 
  setShowNotifications, 
  meetingRequests, 
  demoRequests,
  newsletters,
  markNotificationsAsViewed,
  viewedNotifications
}) {
  const notificationRef = useRef(null);
  const navigate = useNavigate();
  
  // Calculate unread notifications count
  const unreadCount = [
    ...meetingRequests?.map(req => `meeting-${req._id}`) || [],
    ...demoRequests?.map(req => `demo-${req._id}`) || [],
    ...newsletters?.slice(0, 5).map(sub => `newsletter-${sub._id}`) || []
  ].filter(id => !viewedNotifications?.has(id)).length;
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications, setShowNotifications]);
  const currentTime = new Date().toLocaleString();

  const handleSidebarToggle = () => {
    if (setSidebarCollapsed) {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const handleMobileToggle = () => {
    if (setMobileOpen) {
      setMobileOpen(true);
    }
  };

  return (
    <div className="sticky top-0 z-30 bg-gradient-to-r from-slate-800 to-slate-900 shadow-lg border-b border-slate-700 px-3 lg:px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-2">
          {/* Desktop Sidebar Toggle */}
          <button
            onClick={handleSidebarToggle}
            className="hidden lg:flex p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 hover:text-white items-center justify-center"
          >
            {sidebarCollapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
          </button>
          
          {/* Mobile Menu Button */}
          <button
            onClick={handleMobileToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 hover:text-white flex items-center justify-center"
          >
            <FiMenu size={20} />
          </button>
          
          {/* Title for mobile */}
          <div className="lg:hidden ml-2">
            <h1 className="text-lg font-semibold text-white">FlowtelAI</h1>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 lg:gap-8">
          {/* Stats (Hidden on small screens) */}
          <div className="hidden xl:flex items-center gap-8 text-sm mr-6">
            <div className="text-center px-3 py-1 bg-slate-700/50 rounded-lg">
              <p className="text-slate-400 text-xs">Pending</p>
              <p className="font-bold text-amber-400">{stats?.pending || 0}</p>
            </div>
            <div className="text-center px-3 py-1 bg-slate-700/50 rounded-lg">
              <p className="text-slate-400 text-xs">Today</p>
              <p className="font-bold text-indigo-400">{stats?.today || 0}</p>
            </div>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => {
                if (!showNotifications) {
                  // Opening notifications - mark current ones as viewed
                  if (markNotificationsAsViewed) {
                    markNotificationsAsViewed();
                  }
                }
                setShowNotifications(!showNotifications);
              }}
              className="relative p-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <FiBell className="text-slate-300 hover:text-white" size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popup */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-w-[calc(100vw-2rem)] mx-2 sm:mx-0">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <FiX size={16} className="text-gray-500" />
                  </button>
                </div>
                
                <div className="max-h-80 sm:max-h-96 overflow-y-auto">
                  {(() => {
                    // Combine all notifications and sort by creation date
                    const allNotifications = [
                      ...meetingRequests?.filter(req => 
                        req.status === 'pending' && !viewedNotifications?.has(`meeting-${req._id}`)
                      ).map(req => ({ ...req, type: 'meeting', createdAt: req.createdAt })) || [],
                      
                      ...demoRequests?.filter(req => 
                        !viewedNotifications?.has(`demo-${req._id}`)
                      ).map(req => ({ ...req, type: 'demo', createdAt: req.createdAt })) || [],
                      
                      ...newsletters?.filter(sub => 
                        !viewedNotifications?.has(`newsletter-${sub._id}`)
                      ).map(sub => ({ ...sub, type: 'newsletter', createdAt: sub.createdAt })) || []
                    ];
                    
                    // Sort by creation date (newest first) and take only latest 2
                    const latestNotifications = allNotifications
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .slice(0, 2);
                    
                    return latestNotifications.length > 0 ? (
                      latestNotifications.map((notification) => {
                        if (notification.type === 'meeting') {
                          return (
                            <div 
                              key={`meeting-${notification._id}`}
                              className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => {
                                setShowNotifications(false);
                                navigate('/notifications');
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <FiClock className="text-blue-600" size={14} />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-800">{notification.name}</p>
                                  <p className="text-xs text-gray-600">Meeting Request - {notification.date} at {notification.time}</p>
                                  <p className="text-xs text-gray-500 mt-1">Purpose: Meeting discussion</p>
                                </div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              </div>
                            </div>
                          );
                        } else if (notification.type === 'demo') {
                          return (
                            <div 
                              key={`demo-${notification._id}`}
                              className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => {
                                setShowNotifications(false);
                                navigate('/notifications');
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <FiUsers className="text-green-600" size={14} />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-800">{notification.name}</p>
                                  <p className="text-xs text-gray-600">Demo Request - {notification.hotel}</p>
                                  <p className="text-xs text-gray-500 mt-1">Purpose: Product demonstration for {notification.rooms} rooms</p>
                                </div>
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              </div>
                            </div>
                          );
                        } else if (notification.type === 'newsletter') {
                          return (
                            <div key={`newsletter-${notification._id}`} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                  <FiMail className="text-purple-600" size={14} />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-800">New Subscription</p>
                                  <p className="text-xs text-gray-600">{notification.email}</p>
                                  <p className="text-xs text-gray-500 mt-1">Newsletter subscription</p>
                                </div>
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })
                    ) : (
                      // If no unread notifications, show latest 2 notifications (including read ones)
                      (() => {
                        const allNotificationsIncludingRead = [
                          ...meetingRequests?.map(req => ({ ...req, type: 'meeting', createdAt: req.createdAt })) || [],
                          ...demoRequests?.map(req => ({ ...req, type: 'demo', createdAt: req.createdAt })) || [],
                          ...newsletters?.map(sub => ({ ...sub, type: 'newsletter', createdAt: sub.createdAt })) || []
                        ];
                        
                        const latest2Notifications = allNotificationsIncludingRead
                          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                          .slice(0, 2);
                        
                        return latest2Notifications.length > 0 ? (
                          latest2Notifications.map((notification) => {
                            if (notification.type === 'meeting') {
                              return (
                                <div 
                                  key={`meeting-${notification._id}`}
                                  className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                  onClick={() => {
                                    setShowNotifications(false);
                                    navigate('/notifications');
                                  }}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                      <FiClock className="text-blue-600" size={14} />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-800">{notification.name}</p>
                                      <p className="text-xs text-gray-600">Meeting Request - {notification.date} at {notification.time}</p>
                                      <p className="text-xs text-gray-500 mt-1">Purpose: Meeting discussion</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            } else if (notification.type === 'demo') {
                              return (
                                <div 
                                  key={`demo-${notification._id}`}
                                  className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                  onClick={() => {
                                    setShowNotifications(false);
                                    navigate('/notifications');
                                  }}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                      <FiUsers className="text-green-600" size={14} />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-800">{notification.name}</p>
                                      <p className="text-xs text-gray-600">Demo Request - {notification.hotel}</p>
                                      <p className="text-xs text-gray-500 mt-1">Purpose: Product demonstration for {notification.rooms} rooms</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            } else if (notification.type === 'newsletter') {
                              return (
                                <div key={`newsletter-${notification._id}`} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                                  <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                      <FiMail className="text-purple-600" size={14} />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-800">New Subscription</p>
                                      <p className="text-xs text-gray-600">{notification.email}</p>
                                      <p className="text-xs text-gray-500 mt-1">Newsletter subscription</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })
                        ) : (
                          <div className="p-6 text-center text-gray-500">
                            <FiBell className="mx-auto mb-2" size={24} />
                            <p className="text-sm">No notifications available</p>
                          </div>
                        );
                      })()
                    );
                  })()}
                </div>
                
                <div className="p-3 border-t border-gray-200">
                  <Link 
                    to="/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="w-full block text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2 hover:bg-blue-50 rounded transition-colors"
                  >
                    View All Notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1 lg:gap-2 px-4 lg:px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 transition-all text-sm ml-4"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} size={16} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-4 lg:gap-5 pl-6 lg:pl-8 border-l border-slate-600 ml-4">
            <div className="hidden lg:block text-right">
              <p className="text-sm font-medium text-white">Administrator</p>
              <p className="text-xs text-slate-400">admin@gmail.com</p>
            </div>
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full flex items-center justify-center">
              <FiUser className="text-white" size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}