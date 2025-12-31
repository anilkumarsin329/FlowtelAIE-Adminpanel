import { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiMail, FiPhone, FiCalendar, FiClock, FiUser, FiMessageSquare, FiPlus, FiX } from 'react-icons/fi';

export default function MeetingRequestsBase({ 
  title, 
  status, 
  updateRequestStatus, 
  updateMeetingRequest, 
  deleteMeetingRequest,
  saveMeetingResult
}) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  console.log('MeetingRequestsBase props:', { title, status, updateRequestStatus, updateMeetingRequest, deleteMeetingRequest });

  useEffect(() => {
    fetchMeetings();
  }, [status]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/meetings/requests?status=${status}`);
      if (!response.ok) {
        throw new Error('Failed to fetch meetings');
      }
      
      const data = await response.json();
      console.log('Fetched meetings:', data);
      setMeetings(data.data || []);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (meetingId, newStatus, reason = '') => {
    try {
      console.log('Updating status:', { meetingId, newStatus, reason });
      await updateRequestStatus(meetingId, newStatus, reason);
      fetchMeetings(); // Refresh data
    } catch (error) {
      console.error('Error updating status:', error);
    }
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
      fetchMeetings();
    } catch (error) {
      console.error('Error saving result:', error);
    }
  };

  const handleDelete = async (meetingId) => {
    try {
      console.log('Deleting meeting:', meetingId);
      await deleteMeetingRequest(meetingId);
      fetchMeetings(); // Refresh data
    } catch (error) {
      console.error('Error deleting meeting:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error: {error}</p>
        <button 
          onClick={fetchMeetings}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <p className="text-gray-600 mt-1">{meetings.length} meetings found</p>
        </div>

        {meetings.length === 0 ? (
          <div className="text-center py-12">
            <FiCalendar className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">No meetings found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {meetings.map((meeting) => (
              <div key={meeting._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <FiUser className="text-gray-600" />
                        <span className="font-semibold">{meeting.clientName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiCalendar className="text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {new Date(meeting.date).toLocaleDateString()} at {meeting.time}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 mb-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FiMail className="text-gray-500" />
                        <span>{meeting.clientEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiPhone className="text-gray-500" />
                        <span>{meeting.clientPhone}</span>
                      </div>
                    </div>
                    
                    {meeting.message && (
                      <div className="flex items-start gap-2 mb-3">
                        <FiMessageSquare className="text-gray-500 mt-0.5" size={16} />
                        <p className="text-sm text-gray-700">{meeting.message}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        meeting.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        meeting.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        meeting.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        meeting.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {meeting.status}
                      </span>
                      {meeting.bookedAt && (
                        <span className="text-xs text-gray-500">
                          Booked: {new Date(meeting.bookedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {meeting.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(meeting._id, 'confirmed')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Cancellation reason:');
                            if (reason) handleStatusUpdate(meeting._id, 'cancelled', reason);
                          }}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    
                    {meeting.status === 'confirmed' && (
                      <button
                        onClick={() => handleMarkCompleted(meeting)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Mark Complete
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDelete(meeting._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Result Modal */}
      {showResultModal && selectedMeeting && (
        <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
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
                      <span className="ml-2 font-medium">{selectedMeeting.clientName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <span className="ml-2">{new Date(selectedMeeting.date).toLocaleDateString()} at {selectedMeeting.time}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2">{selectedMeeting.clientEmail}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-2">{selectedMeeting.clientPhone}</span>
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