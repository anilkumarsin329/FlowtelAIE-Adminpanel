import { useState } from 'react';
import { FiUsers, FiCheck, FiClock, FiX, FiCheckCircle, FiBarChart3 } from 'react-icons/fi';
import AllMeetings from './AllMeetings';
import ConfirmedMeetings from './ConfirmedMeetings';
import CompletedMeetings from './CompletedMeetings';
import PendingMeetings from './PendingMeetings';
import CancelledMeetings from './CancelledMeetings';
import MeetingResultsPage from './MeetingResultsPage';

export default function MeetingRequestsNavigation({ 
  updateRequestStatus, 
  updateMeetingRequest, 
  deleteMeetingRequest,
  saveMeetingResult
}) {
  const [activeView, setActiveView] = useState('all');

  const navigationItems = [
    { id: 'all', label: 'All Meetings', icon: FiUsers, component: AllMeetings },
    { id: 'pending', label: 'Pending', icon: FiClock, component: PendingMeetings },
    { id: 'confirmed', label: 'Confirmed', icon: FiCheck, component: ConfirmedMeetings },
    { id: 'completed', label: 'Completed', icon: FiCheckCircle, component: CompletedMeetings },
    { id: 'cancelled', label: 'Cancelled', icon: FiX, component: CancelledMeetings },
    { id: 'results', label: 'Results', icon: FiBarChart3, component: MeetingResultsPage }
  ];

  const ActiveComponent = navigationItems.find(item => item.id === activeView)?.component || AllMeetings;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 sm:h-16">
            <h1 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">Meeting Management</h1>
            <nav className="flex flex-wrap gap-1 w-full sm:w-auto">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-1 sm:flex-none justify-center sm:justify-start ${
                      activeView === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{item.label}</span>
                    <span className="sm:hidden text-xs">{item.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Active Component */}
      <ActiveComponent
        updateRequestStatus={updateRequestStatus}
        updateMeetingRequest={updateMeetingRequest}
        deleteMeetingRequest={deleteMeetingRequest}
        saveMeetingResult={saveMeetingResult}
      />
    </div>
  );
}