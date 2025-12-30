import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './Components/Login';
import Sidebar from './Components/Sidebar';
import Navbar from './Components/Navbar';
import DashboardPage from './Pages/DashboardPage';
import MeetingRequestsPageImproved from './Pages/MettingRequest/MeetingRequestsPageImproved';
import MeetingSlotsPage from './Pages/MeetingSlotsPage';
import MeetingResultsPage from './Pages/MettingRequest/MeetingResultsPage';
import DemoRequestsPage from './Pages/DemoRequestsPage';
import NewsletterSubscribersPage from './Pages/NewsletterSubscribersPage';
import NotificationsPage from './Pages/NotificationsPage';
import './App.css';

function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [viewedNotifications, setViewedNotifications] = useState(new Set());
  const location = useLocation();
  
  // Data states
  const [demoRequests, setDemoRequests] = useState([]);
  const [newsletters, setNewsletters] = useState([]);
  const [meetingRequests, setMeetingRequests] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [meetingResults, setMeetingResults] = useState([]);
  const [resultStats, setResultStats] = useState({});

  // Get active tab from current route
  const getActiveTab = () => {
    const path = location.pathname.slice(1);
    return path || 'dashboard';
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      const credentials = btoa('admin:flowtel123');
      const headers = {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      };

      // Fetch all data with error handling
      const fetchWithFallback = async (url, fallback = []) => {
        try {
          const response = await fetch(url, { headers });
          if (response.ok) {
            const data = await response.json();
            return data.data || fallback;
          }
        } catch (error) {
          console.error(`Error fetching ${url}:`, error);
        }
        return fallback;
      };

      const [demos, newsletters, requests, slots, results, stats] = await Promise.all([
        fetchWithFallback(`${import.meta.env.VITE_API_BASE_URL}/api/demo`),
        fetchWithFallback(`${import.meta.env.VITE_API_BASE_URL}/api/newsletter`),
        fetchWithFallback(`${import.meta.env.VITE_API_BASE_URL}/api/meetings/requests`),
        fetchWithFallback(`${import.meta.env.VITE_API_BASE_URL}/api/meetings/date/${new Date().toISOString().split('T')[0]}`),
        fetchWithFallback(`${import.meta.env.VITE_API_BASE_URL}/api/meeting-results`),
        fetchWithFallback(`${import.meta.env.VITE_API_BASE_URL}/api/meeting-results/stats`, {})
      ]);

      setDemoRequests(demos);
      setNewsletters(newsletters);
      setMeetingRequests(requests);
      setMeetings(slots);
      setMeetingResults(results);
      setResultStats(stats);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update meeting request status
  const updateRequestStatus = async (requestId, newStatus, cancellationReason = null) => {
    try {
      const credentials = btoa('admin:flowtel123');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/meetings/requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus, cancellationReason })
      });
      
      if (response.ok) {
        fetchData();
        const currentDate = new Date().toISOString().split('T')[0];
        fetchMeetingsByDate(currentDate);
        
        const message = newStatus === 'confirmed' ? 'Meeting confirmed!' : 
                       newStatus === 'cancelled' ? 'Meeting cancelled!' :
                       newStatus === 'completed' ? 'Meeting marked as completed! You can now add results.' :
                       'Status updated successfully';
        alert(message);
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  // Create meeting slots
  const createMeetingSlots = async (date, customSlots = null) => {
    try {
      const credentials = btoa('admin:flowtel123');
      const defaultSlots = [
        '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30',
        '14:00', '14:30', '15:00', '15:30'
      ];
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/meetings/slots`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ date, slots: customSlots || defaultSlots })
      });
      
      if (response.ok) {
        fetchMeetingsByDate(date);
        alert('Meeting slots created successfully!');
      } else {
        const result = await response.json();
        alert(result.error || 'Failed to create slots. They may already exist.');
      }
    } catch (error) {
      console.error('Error creating slots:', error);
      alert('Failed to create slots');
    }
  };

  // Delete meeting slot
  const deleteMeetingSlot = async (slotId) => {
    if (!confirm('Are you sure you want to delete this slot?')) return;
    
    try {
      const credentials = btoa('admin:flowtel123');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/meetings/slots/${slotId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Refresh the current date's meetings
        const currentDate = new Date().toISOString().split('T')[0];
        fetchMeetingsByDate(currentDate);
        alert('Slot deleted successfully!');
      } else {
        const result = await response.json();
        alert(result.error || 'Failed to delete slot');
      }
    } catch (error) {
      console.error('Error deleting slot:', error);
      alert('Failed to delete slot');
    }
  };

  // Update meeting slot
  const updateMeetingSlot = async (slotId, updates) => {
    try {
      const credentials = btoa('admin:flowtel123');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/meetings/slots/${slotId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        fetchData();
        alert('Slot updated successfully!');
      } else {
        alert('Failed to update slot');
      }
    } catch (error) {
      console.error('Error updating slot:', error);
      alert('Failed to update slot');
    }
  };

  // Fetch meetings by date
  const fetchMeetingsByDate = async (date) => {
    try {
      const credentials = btoa('admin:flowtel123');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/meetings/date/${date}`, {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setMeetings(data.data);
        } else {
          setMeetings([]);
        }
      } else {
        setMeetings([]);
      }
    } catch (error) {
      console.error('Error fetching meetings by date:', error);
      setMeetings([]);
    }
  };

  // Delete all available slots for a date
  const deleteAllSlotsForDate = async (date) => {
    try {
      const credentials = btoa('admin:flowtel123');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/meetings/slots/date/${date}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        fetchMeetingsByDate(date);
        alert(`${result.deletedCount} available slots deleted successfully!`);
      } else {
        alert('Failed to delete slots');
      }
    } catch (error) {
      console.error('Error deleting all slots:', error);
      alert('Failed to delete slots');
    }
  };

  // Update demo request
  const updateDemoRequest = async (id, updates) => {
    try {
      const credentials = btoa('admin:flowtel123');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/demo/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        fetchData();
        alert('Demo request updated successfully!');
      } else {
        alert('Failed to update demo request');
      }
    } catch (error) {
      console.error('Error updating demo request:', error);
      alert('Failed to update demo request');
    }
  };

  // Delete demo request
  const deleteDemoRequest = async (id) => {
    try {
      const credentials = btoa('admin:flowtel123');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/demo/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        fetchData();
        alert('Demo request deleted successfully!');
      } else {
        alert('Failed to delete demo request');
      }
    } catch (error) {
      console.error('Error deleting demo request:', error);
      alert('Failed to delete demo request');
    }
  };

  // Update meeting request
  const updateMeetingRequest = async (id, updates) => {
    try {
      const credentials = btoa('admin:flowtel123');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/meetings/requests/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        // Send email notification to user about the update
        const request = meetingRequests.find(req => req._id === id);
        if (request && (updates.date || updates.time)) {
          await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/meetings/send-update-email`, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${credentials}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: request.email,
              name: request.name,
              oldDate: request.date,
              oldTime: request.time,
              newDate: updates.date || request.date,
              newTime: updates.time || request.time
            })
          });
        }
        fetchData();
        // Refresh meeting slots to reflect changes
        const currentDate = new Date().toISOString().split('T')[0];
        fetchMeetingsByDate(currentDate);
        alert('Meeting request updated successfully! Email sent to user.');
      } else {
        alert('Failed to update meeting request');
      }
    } catch (error) {
      console.error('Error updating meeting request:', error);
      alert('Failed to update meeting request');
    }
  };

  // Delete meeting request
  const deleteMeetingRequest = async (id) => {
    try {
      const credentials = btoa('admin:flowtel123');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/meetings/requests/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        fetchData();
        // Refresh meeting slots to reflect changes
        const currentDate = new Date().toISOString().split('T')[0];
        fetchMeetingsByDate(currentDate);
        alert('Meeting request deleted successfully!');
      } else {
        alert('Failed to delete meeting request');
      }
    } catch (error) {
      console.error('Error deleting meeting request:', error);
      alert('Failed to delete meeting request');
    }
  };

  // Delete newsletter subscriber
  const deleteNewsletterSubscriber = async (id) => {
    try {
      const credentials = btoa('admin:flowtel123');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/newsletter/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        fetchData();
        alert('Subscriber deleted successfully!');
      } else {
        alert('Failed to delete subscriber');
      }
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      alert('Failed to delete subscriber');
    }
  };

  // Save meeting result
  const saveMeetingResult = async (meetingId, resultData) => {
    try {
      const credentials = btoa('admin:flowtel123');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/meeting-results`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ meetingId, ...resultData })
      });
      
      if (response.ok) {
        fetchData();
        alert('Meeting result saved successfully!');
      } else {
        const result = await response.json();
        alert(result.error || 'Failed to save meeting result');
      }
    } catch (error) {
      console.error('Error saving meeting result:', error);
      alert('Failed to save meeting result');
    }
  };

  // Update follow-up status
  const updateFollowUpStatus = async (resultId, completed) => {
    try {
      const credentials = btoa('admin:flowtel123');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/meeting-results/${resultId}/follow-up`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ followUpCompleted: completed })
      });
      
      if (response.ok) {
        fetchData();
        alert('Follow-up status updated!');
      } else {
        alert('Failed to update follow-up status');
      }
    } catch (error) {
      console.error('Error updating follow-up:', error);
      alert('Failed to update follow-up status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    window.location.reload();
  };

  // Mark notifications as viewed
  const markNotificationsAsViewed = () => {
    const currentNotificationIds = new Set([
      ...meetingRequests.map(req => `meeting-${req._id}`),
      ...demoRequests.map(req => `demo-${req._id}`),
      ...newsletters.slice(0, 5).map(sub => `newsletter-${sub._id}`)
    ]);
    setViewedNotifications(currentNotificationIds);
  };

  // Delete single notification
  const deleteNotification = (type, id) => {
    const notificationId = `${type}-${id}`;
    setViewedNotifications(prev => {
      const newSet = new Set(prev);
      newSet.add(notificationId);
      return newSet;
    });
  };

  // Delete all notifications
  const deleteAllNotifications = () => {
    const allNotificationIds = new Set([
      ...meetingRequests.map(req => `meeting-${req._id}`),
      ...demoRequests.map(req => `demo-${req._id}`),
      ...newsletters.map(sub => `newsletter-${sub._id}`)
    ]);
    setViewedNotifications(allNotificationIds);
  };

  // Calculate stats
  const stats = {
    today: meetingRequests.filter(r => 
      new Date(r.createdAt).toDateString() === new Date().toDateString()
    ).length,
    pending: meetingRequests.filter(r => r.status === 'pending').length,
    confirmed: meetingRequests.filter(r => r.status === 'confirmed').length,
    completed: meetingRequests.filter(r => r.status === 'completed').length,
    newsletters: newsletters.length,
    demos: demoRequests.length,
    availableSlots: meetings.filter(m => m.status === 'available').length,
    bookedSlots: meetings.filter(m => m.status === 'booked' || m.status === 'pending' || m.status === 'confirmed').length,
    ...resultStats
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <Navbar 
          loading={loading}
          onRefresh={fetchData}
          stats={stats}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          setMobileOpen={setMobileMenuOpen}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          meetingRequests={meetingRequests}
          demoRequests={demoRequests}
          newsletters={newsletters}
          markNotificationsAsViewed={markNotificationsAsViewed}
          viewedNotifications={viewedNotifications}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route 
              path="/dashboard" 
              element={<DashboardPage stats={stats} recentActivity={meetingRequests} />} 
            />
            <Route 
              path="/requests" 
              element={
                <MeetingRequestsPageImproved 
                  meetingRequests={meetingRequests}
                  loading={loading}
                  onRefresh={fetchData}
                  updateRequestStatus={updateRequestStatus}
                  updateMeetingRequest={updateMeetingRequest}
                  deleteMeetingRequest={deleteMeetingRequest}
                />
              } 
            />
            <Route 
              path="/meetings" 
              element={
                <MeetingSlotsPage 
                  meetings={meetings} 
                  stats={stats} 
                  createMeetingSlots={createMeetingSlots}
                  deleteMeetingSlot={deleteMeetingSlot}
                  updateMeetingSlot={updateMeetingSlot}
                  fetchMeetingsByDate={fetchMeetingsByDate}
                  deleteAllSlotsForDate={deleteAllSlotsForDate}
                />
              } 
            />
            <Route 
              path="/results" 
              element={
                <MeetingResultsPage 
                  meetingResults={meetingResults || []}
                  saveMeetingResult={saveMeetingResult}
                  updateFollowUpStatus={updateFollowUpStatus}
                  completedMeetings={meetingRequests.filter(r => r.status === 'completed' && !meetingResults.find(mr => mr.meetingId === r._id)) || []}
                />
              } 
            />
            <Route 
              path="/demos" 
              element={
                <DemoRequestsPage 
                  demoRequests={demoRequests} 
                  updateDemoRequest={updateDemoRequest}
                  deleteDemoRequest={deleteDemoRequest}
                />
              } 
            />
            <Route 
              path="/newsletters" 
              element={
                <NewsletterSubscribersPage 
                  newsletters={newsletters}
                  deleteNewsletterSubscriber={deleteNewsletterSubscriber}
                />
              } 
            />
            <Route 
              path="/notifications" 
              element={
                <NotificationsPage 
                  meetingRequests={meetingRequests}
                  demoRequests={demoRequests}
                  newsletters={newsletters}
                  viewedNotifications={viewedNotifications}
                  deleteNotification={deleteNotification}
                  deleteAllNotifications={deleteAllNotifications}
                />
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Analytics Overview</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                      <div className="text-3xl font-bold text-blue-600 mb-2">{meetingRequests.length}</div>
                      <div className="text-gray-700">Total Meeting Requests</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                      <div className="text-3xl font-bold text-green-600 mb-2">{demoRequests.length}</div>
                      <div className="text-gray-700">Demo Requests</div>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                      <div className="text-3xl font-bold text-purple-600 mb-2">{newsletters.length}</div>
                      <div className="text-gray-700">Newsletter Subscribers</div>
                    </div>
                  </div>
                </div>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">System Settings</h2>
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Email Configuration</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Server</label>
                          <input type="text" value="smtp.gmail.com" disabled className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                          <input type="email" value="anilkumarsingh43425@gmail.com" disabled className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50" />
                        </div>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-gray-200">
                      <button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-6 py-3 rounded-lg transition-all">
                        Save Settings
                      </button>
                    </div>
                  </div>
                </div>
              } 
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const authStatus = localStorage.getItem('adminAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return <Login onLogin={setIsAuthenticated} />;
  }

  return (
    <Router>
      <AdminLayout />
    </Router>
  );
}

export default App;