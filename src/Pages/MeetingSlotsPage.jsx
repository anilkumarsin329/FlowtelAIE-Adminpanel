import { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiPlus, FiRefreshCw, FiTrash2, FiChevronLeft, FiChevronRight, FiX, FiEye, FiUser, FiMail, FiPhone, FiMessageSquare } from 'react-icons/fi';

export default function MeetingSlotsPage({ 
  meetings, 
  stats, 
  createMeetingSlots, 
  deleteMeetingSlot, 
  updateMeetingSlot, 
  fetchMeetingsByDate, 
  deleteAllSlotsForDate 
}) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [selectedTime, setSelectedTime] = useState('10:00');

  const timeSlots = [
    '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30'
  ];

  useEffect(() => {
    fetchMeetingsByDate(selectedDate);
  }, [selectedDate]);

  const fetchSlots = () => {
    fetchMeetingsByDate(selectedDate);
  };

  const createAllSlots = () => {
    createMeetingSlots(selectedDate, timeSlots);
  };

  const createSingleSlot = (time) => {
    createMeetingSlots(selectedDate, [time]);
  };

  const deleteSingleSlot = (slotId) => {
    deleteMeetingSlot(slotId);
  };

  const getSlotStatus = (time) => {
    const slot = meetings.find(s => s.time === time);
    if (!slot) return 'NOT_CREATED';
    
    // Map backend status to frontend status
    if (slot.status === 'available') return 'AVAILABLE';
    if (slot.status === 'pending' || slot.status === 'confirmed' || slot.status === 'booked') return 'BOOKED';
    
    return slot.status;
  };

  const getSlotInfo = (time) => {
    const slot = meetings.find(s => s.time === time);
    if (!slot) return null;
    
    // Transform backend data to match frontend expectations
    return {
      ...slot,
      user: slot.clientName ? {
        name: slot.clientName,
        email: slot.clientEmail,
        phone: slot.clientPhone
      } : null,
      notes: slot.message
    };
  };

  const renderSlotButton = (time, status, slotInfo) => {
    switch (status) {
      case 'NOT_CREATED':
        return (
          <button
            onClick={() => createSingleSlot(time)}
            className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            <FiPlus size={14} />
            Create Slot
          </button>
        );
      
      case 'AVAILABLE':
        return (
          <button
            onClick={() => deleteSingleSlot(slotInfo._id)}
            className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
          >
            <FiTrash2 size={14} />
            Delete
          </button>
        );
      
      case 'BOOKED':
        return (
          <div className="space-y-2">
            <div className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded font-medium">
              BOOKED
            </div>
            <button
              onClick={() => handleViewSlot(slotInfo)}
              className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
            >
              <FiEye size={14} />
              View Details
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Calendar functions
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = date.getMonth() === month;
      const isPast = date < today;
      const isToday = date.toDateString() === today.toDateString();
      
      const dateYear = date.getFullYear();
      const dateMonth = String(date.getMonth() + 1).padStart(2, '0');
      const dateDay = String(date.getDate()).padStart(2, '0');
      const dateString = `${dateYear}-${dateMonth}-${dateDay}`;
      
      const isSelected = selectedDate === dateString;
      
      days.push({
        date,
        day: date.getDate(),
        isCurrentMonth,
        isPast,
        isToday,
        isSelected,
        dateString
      });
    }
    
    return days;
  };

  const handleDateSelect = (dateString) => {
    setSelectedDate(dateString);
  };

  const handleViewSlot = (slotInfo) => {
    setSelectedSlot(slotInfo);
    setShowViewModal(true);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Meeting Slots Management</h1>
            <p className="text-gray-600 mt-1">Manage available time slots for meetings</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FiCalendar className="text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <button
              onClick={fetchSlots}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Date</h2>
        
        {/* Calendar */}
        <div className="max-w-md">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiChevronLeft size={20} />
            </button>
            <h3 className="text-lg font-semibold">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiChevronRight size={20} />
            </button>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays().map((day, index) => (
              <button
                key={index}
                onClick={() => !day.isPast && day.isCurrentMonth && handleDateSelect(day.dateString)}
                disabled={day.isPast || !day.isCurrentMonth}
                className={`p-3 text-sm rounded-lg transition-colors ${
                  day.isPast || !day.isCurrentMonth
                    ? 'text-gray-400 cursor-not-allowed'
                    : day.isSelected
                    ? 'bg-blue-600 text-white'
                    : day.isToday
                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    : 'hover:bg-gray-100'
                }`}
              >
                {day.day}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Create Single Slot */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Create Single Slot</h3>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              {timeSlots.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => createSingleSlot(selectedTime)}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <FiPlus />
            Create Slot
          </button>
        </div>
        <div className="mt-4">
          <button
            onClick={createAllSlots}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <FiPlus />
            Create All Slots for {new Date(selectedDate).toLocaleDateString()}
          </button>
        </div>
      </div>

      {/* Slots Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Time Slots for {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
          
          {/* Legend */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded"></div>
              <span>Not Created</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Booked</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading slots...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {timeSlots.map((time) => {
              const status = getSlotStatus(time);
              const slotInfo = getSlotInfo(time);
              
              return (
                <div
                  key={time}
                  className={`p-4 rounded-lg border-2 text-center ${
                    status === 'BOOKED'
                      ? 'bg-red-50 border-red-300'
                      : status === 'AVAILABLE'
                      ? 'bg-green-50 border-green-300'
                      : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 mb-3">
                    <FiClock size={16} className={status === 'BOOKED' ? 'text-red-600' : status === 'AVAILABLE' ? 'text-green-600' : 'text-gray-500'} />
                    <span className="font-medium text-gray-800">{time}</span>
                  </div>
                  
                  <div className="text-sm mb-4">
                    {status === 'BOOKED' && slotInfo?.user ? (
                      <div className="text-left">
                        <div className="font-medium text-gray-800 truncate">{slotInfo.user.name}</div>
                        <div className="text-gray-600 text-xs truncate">{slotInfo.user.email}</div>
                      </div>
                    ) : (
                      <div className={`font-medium ${
                        status === 'AVAILABLE' ? 'text-green-700' : 
                        status === 'BOOKED' ? 'text-red-700' : 'text-gray-500'
                      }`}>
                        {status === 'NOT_CREATED' ? 'Not Created' : 
                         status === 'AVAILABLE' ? 'Available' : 'Booked'}
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-center">
                    {renderSlotButton(time, status, slotInfo)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* View Meeting Details Modal */}
      {showViewModal && selectedSlot && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Meeting Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <FiX size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FiClock className="text-blue-600" size={18} />
                <div>
                  <p className="text-sm text-gray-600">Time Slot</p>
                  <p className="font-medium">{selectedSlot.time} on {new Date(selectedSlot.date).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <FiUser className="text-green-600" size={18} />
                <div>
                  <p className="text-sm text-gray-600">Client Name</p>
                  <p className="font-medium">{selectedSlot.user?.name || selectedSlot.clientName}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <FiMail className="text-purple-600" size={18} />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{selectedSlot.user?.email || selectedSlot.clientEmail}</p>
                </div>
              </div>
              
              {(selectedSlot.user?.phone || selectedSlot.clientPhone) && (
                <div className="flex items-center gap-3">
                  <FiPhone className="text-orange-600" size={18} />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{selectedSlot.user?.phone || selectedSlot.clientPhone}</p>
                  </div>
                </div>
              )}
              
              {selectedSlot.notes && (
                <div className="flex items-start gap-3">
                  <FiMessageSquare className="text-indigo-600 mt-1" size={18} />
                  <div>
                    <p className="text-sm text-gray-600">Meeting Purpose</p>
                    <p className="font-medium">{selectedSlot.notes}</p>
                  </div>
                </div>
              )}
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
    </div>
  );
}