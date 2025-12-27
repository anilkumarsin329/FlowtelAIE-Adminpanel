import { useState, useEffect } from 'react';
import { FiUsers, FiMail, FiCalendar, FiRefreshCw } from 'react-icons/fi';
import Login from './Login';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Dashboard from './Dashboard';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Data states
  const [demoRequests, setDemoRequests] = useState([]);
  const [newsletters, setNewsletters] = useState([]);
  const [meetingRequests, setMeetingRequests] = useState([]);
  const [meetings, setMeetings] = useState([]);

  // Check authentication on mount
  useEffect(() => {
    const authStatus = localStorage.getItem('adminAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      fetchData();
    }
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
          console.log('🔄 Fetching:', url);
          const response = await fetch(url, { headers });
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Success:', url, 'Data length:', data.data?.length || 0);
            return data.data || fallback;
          } else {
            console.log('❌ Failed:', url, response.status);
          }
        } catch (error) {
          console.error(`❌ Error fetching ${url}:`, error);
        }
        return fallback;
      };

      const [demos, newsletters, requests, slots] = await Promise.all([
        fetchWithFallback(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/demo`),
        fetchWithFallback(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/newsletter`),
        fetchWithFallback(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/meetings/requests`),
        fetchWithFallback(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/meetings/date/${new Date().toISOString().split('T')[0]}`)
      ]);

      setDemoRequests(demos);
      setNewsletters(newsletters);
      setMeetingRequests(requests);
      setMeetings(slots);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update meeting request status
  const updateRequestStatus = async (requestId, newStatus, cancellationReason = '') => {
    try {
      const credentials = btoa('admin:flowtel123');
      const body = { status: newStatus };
      if (cancellationReason) {
        body.cancellationReason = cancellationReason;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/meetings/requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        fetchData();
        alert('Status updated successfully');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  // Create meeting slots
  const createMeetingSlots = async (date, slots) => {
    try {
      const credentials = btoa('admin:flowtel123');
      const defaultSlots = slots || [
        '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', 
        '14:00', '14:30', '15:00', '15:30'
      ];
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/meetings/slots`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ date, slots: defaultSlots })
      });
      
      if (response.ok) {
        fetchData();
        alert('Meeting slots created successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create slots');
      }
    } catch (error) {
      console.error('Error creating slots:', error);
      alert('Failed to create slots');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  // Calculate stats
  const stats = {
    today: meetingRequests.filter(r => 
      new Date(r.createdAt).toDateString() === new Date().toDateString()
    ).length,
    pending: meetingRequests.filter(r => r.status === 'pending').length,
    confirmed: meetingRequests.filter(r => r.status === 'confirmed').length,
    newsletters: newsletters.length,
    demos: demoRequests.length,
    availableSlots: meetings.filter(m => m.status === 'available').length,
    bookedSlots: meetings.filter(m => m.status === 'booked').length
  };

  if (!isAuthenticated) {
    return <Login onLogin={setIsAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar 
          loading={loading}
          onRefresh={fetchData}
          stats={stats}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          setMobileOpen={setMobileOpen}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          meetingRequests={meetingRequests}
          demoRequests={demoRequests}
        />

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === 'dashboard' && (
            <Dashboard stats={stats} recentActivity={meetingRequests} />
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Analytics Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="font-semibold mb-4 text-gray-800">Meeting Request Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Pending</span>
                      <span className="font-bold text-orange-600">{stats.pending}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Confirmed</span>
                      <span className="font-bold text-green-600">{stats.confirmed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Cancelled</span>
                      <span className="font-bold text-red-600">{meetingRequests.filter(r => r.status === 'cancelled').length}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="font-semibold mb-4 text-gray-800">Meeting Slots Today</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Available</span>
                      <span className="font-bold text-green-600">{stats.availableSlots}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Booked</span>
                      <span className="font-bold text-orange-600">{stats.bookedSlots}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total</span>
                      <span className="font-bold text-gray-800">{meetings.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">Meeting Requests ({meetingRequests.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meeting</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {meetingRequests.map((request) => (
                      <tr key={request._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{request.name}</div>
                          <div className="text-sm text-gray-500">{new Date(request.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{request.email}</div>
                          <div className="text-sm text-gray-500">{request.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{request.date}</div>
                          <div className="text-sm text-gray-500">{request.time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            request.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            request.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {request.status === 'pending' ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateRequestStatus(request._id, 'confirmed')}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-xs transition-colors"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => updateRequestStatus(request._id, 'cancelled')}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-xs transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => updateRequestStatus(request._id, 'pending')}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md text-xs transition-colors"
                            >
                              Reset
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'meetings' && (
            <div className="space-y-6">
              {/* Create Slots */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Create Meeting Slots</h3>
                    <p className="text-gray-600">Add default time slots for today</p>
                  </div>
                  <button
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0];
                      createMeetingSlots(today);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg transition-all"
                  >
                    Create Today's Slots
                  </button>
                </div>
              </div>

              {/* Meeting Slots Display */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-800">Meeting Slots - Today</h2>
                  <p className="text-gray-600 mt-1">
                    Available: <span className="text-green-600 font-semibold">{stats.availableSlots}</span> | 
                    Booked: <span className="text-orange-600 font-semibold">{stats.bookedSlots}</span>
                  </p>
                </div>
                <div className="p-6">
                  {meetings.length === 0 ? (
                    <div className="text-center py-12">
                      <FiCalendar className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-gray-500 text-lg">No meeting slots available for today</p>
                      <p className="text-gray-400 mt-2">Click "Create Today's Slots" to add default time slots</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {meetings.map((meeting) => (
                        <div
                          key={meeting._id || meeting.id}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            meeting.status === 'available'
                              ? 'border-green-200 bg-green-50 hover:border-green-300'
                              : 'border-orange-200 bg-orange-50'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-bold text-lg text-gray-800">{meeting.time}</p>
                              {meeting.clientName && (
                                <p className="text-sm text-gray-600 mt-1">{meeting.clientName}</p>
                              )}
                            </div>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              meeting.status === 'available'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {meeting.status === 'available' ? 'Available' : 'Booked'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'demos' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">Demo Requests ({demoRequests.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hotel Details</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {demoRequests.map((request) => (
                      <tr key={request._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{request.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{request.email}</div>
                          <div className="text-sm text-gray-500">{request.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{request.hotel}</div>
                          <div className="text-sm text-gray-500">{request.rooms} rooms</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'newsletters' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">Newsletter Subscribers ({newsletters.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscribed Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {newsletters.map((subscriber) => (
                      <tr key={subscriber._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{subscriber.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            subscriber.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {subscriber.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(subscriber.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">System Settings</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Email Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Server</label>
                      <input
                        type="text"
                        value="smtp.gmail.com"
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value="anilkumarsingh43425@gmail.com"
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Meeting Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Default Meeting Duration</label>
                      <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option>30 minutes</option>
                        <option>45 minutes</option>
                        <option>60 minutes</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" className="rounded" />
                      <label className="text-sm text-gray-700">Automatically confirm meeting requests</label>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg transition-all">
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}