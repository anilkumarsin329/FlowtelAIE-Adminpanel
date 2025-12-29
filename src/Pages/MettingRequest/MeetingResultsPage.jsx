import { useState, useEffect } from 'react';
import { FiPlus, FiEye, FiCalendar, FiUser, FiMail, FiPhone, FiFileText, FiTarget, FiArrowRight, FiClock, FiX, FiCheck } from 'react-icons/fi';

export default function MeetingResultsPage({ 
  meetingResults, 
  saveMeetingResult, 
  updateFollowUpStatus,
  completedMeetings 
}) {
  console.log('MeetingResultsPage props:', { meetingResults, completedMeetings });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
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

  const outcomes = [
    { value: 'Interested', color: 'bg-green-100 text-green-800' },
    { value: 'Not Interested', color: 'bg-red-100 text-red-800' },
    { value: 'Need Time', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Deal Closed', color: 'bg-blue-100 text-blue-800' }
  ];

  const nextActions = [
    'Follow-up Call',
    'Proposal Send', 
    'Demo Required',
    'None'
  ];

  const handleAddResult = (meeting) => {
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
    setShowAddModal(true);
  };

  const handleViewResult = (result) => {
    setSelectedResult(result);
    setShowViewModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await saveMeetingResult(selectedMeeting._id, formData);
      setShowAddModal(false);
      setSelectedMeeting(null);
    } catch (error) {
      console.error('Error saving result:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUpToggle = async (resultId, completed) => {
    await updateFollowUpStatus(resultId, completed);
  };

  const getOutcomeStyle = (outcome) => {
    const outcomeObj = outcomes.find(o => o.value === outcome);
    return outcomeObj ? outcomeObj.color : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Meeting Results</h1>
            <p className="text-gray-600 mt-1">Track meeting outcomes and follow-ups</p>
          </div>
        </div>
      </div>

      {/* Completed Meetings Awaiting Results */}
      {completedMeetings && completedMeetings.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Completed Meetings - Add Results</h2>
          <div className="grid gap-4">
            {completedMeetings.map((meeting) => (
              <div key={meeting._id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FiUser className="text-blue-600" />
                    <span className="font-medium">{meeting.clientName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiCalendar className="text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {new Date(meeting.date).toLocaleDateString()} at {meeting.time}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleAddResult(meeting)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiPlus size={16} />
                  Add Result
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meeting Results List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">All Meeting Results</h2>
        
        {meetingResults.length === 0 ? (
          <div className="text-center py-12">
            <FiFileText className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">No meeting results yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {meetingResults.map((result) => (
              <div key={result._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <FiUser className="text-gray-600" />
                        <span className="font-semibold">{result.clientName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiCalendar className="text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {new Date(result.meetingDate).toLocaleDateString()} at {result.meetingTime}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getOutcomeStyle(result.outcome)}`}>
                        {result.outcome}
                      </span>
                      {result.nextAction !== 'None' && (
                        <div className="flex items-center gap-2">
                          <FiArrowRight className="text-gray-500" size={14} />
                          <span className="text-sm text-gray-600">{result.nextAction}</span>
                          {result.followUpDate && (
                            <span className="text-xs text-gray-500">
                              (Due: {new Date(result.followUpDate).toLocaleDateString()})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">
                      <strong>Requirement:</strong> {result.clientRequirement}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {result.nextAction !== 'None' && !result.followUpCompleted && (
                      <button
                        onClick={() => handleFollowUpToggle(result._id, true)}
                        className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        <FiCheck size={14} />
                        Mark Done
                      </button>
                    )}
                    <button
                      onClick={() => handleViewResult(result)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      <FiEye size={14} />
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Result Modal */}
      {showAddModal && selectedMeeting && (
        <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Add Meeting Result</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <FiX size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
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
                    {outcomes.map(outcome => (
                      <option key={outcome.value} value={outcome.value}>{outcome.value}</option>
                    ))}
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
                    {nextActions.map(action => (
                      <option key={action} value={action}>{action}</option>
                    ))}
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
                    placeholder="Internal admin notes (not visible to client)"
                  />
                </div>

                {/* Recording Section */}
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-800 mb-4">Meeting Recording (Optional)</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Recording Type</label>
                      <select
                        value={formData.recordingType}
                        onChange={(e) => setFormData({...formData, recordingType: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="audio">Audio Recording</option>
                        <option value="video">Video Recording</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                      <input
                        type="number"
                        value={formData.recordingDuration}
                        onChange={(e) => setFormData({...formData, recordingDuration: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 30"
                        min="1"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recording URL/Link</label>
                    <input
                      type="url"
                      value={formData.recordingUrl}
                      onChange={(e) => setFormData({...formData, recordingUrl: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/recording.mp4"
                    />
                    <p className="text-xs text-gray-500 mt-1">Paste the URL of your meeting recording (Google Drive, Dropbox, etc.)</p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Result'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Result Modal */}
      {showViewModal && selectedResult && (
        <div className="fixed inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Meeting Result Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <FiX size={20} />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Meeting Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-3">Meeting Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FiUser className="text-gray-500" />
                      <span>{selectedResult.clientName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiCalendar className="text-gray-500" />
                      <span>{new Date(selectedResult.meetingDate).toLocaleDateString()} at {selectedResult.meetingTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiMail className="text-gray-500" />
                      <span>{selectedResult.clientEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiPhone className="text-gray-500" />
                      <span>{selectedResult.clientPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Meeting Summary */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Meeting Summary</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedResult.meetingSummary}</p>
                </div>

                {/* Client Requirement */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Client Requirement</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedResult.clientRequirement}</p>
                </div>

                {/* Outcome & Next Action */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Outcome</h4>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getOutcomeStyle(selectedResult.outcome)}`}>
                      {selectedResult.outcome}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Next Action</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">{selectedResult.nextAction}</span>
                      {selectedResult.followUpCompleted && selectedResult.nextAction !== 'None' && (
                        <span className="text-green-600 text-sm">Completed</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Follow-up Date */}
                {selectedResult.followUpDate && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Follow-up Date</h4>
                    <div className="flex items-center gap-2">
                      <FiClock className="text-gray-500" />
                      <span className="text-gray-700">{new Date(selectedResult.followUpDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}

                {/* Admin Notes */}
                {selectedResult.adminNotes && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Internal Notes</h4>
                    <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200">{selectedResult.adminNotes}</p>
                  </div>
                )}

                {/* Recording Section */}
                {selectedResult.recordingUrl && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Meeting Recording</h4>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {selectedResult.recordingType === 'video' ? 'Video Recording' : 'Audio Recording'}
                        </span>
                        {selectedResult.recordingDuration && (
                          <span className="text-xs text-gray-500">
                            Duration: {selectedResult.recordingDuration} minutes
                          </span>
                        )}
                      </div>
                      <a
                        href={selectedResult.recordingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        <FiEye size={14} />
                        View Recording
                      </a>
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="text-xs text-gray-500 border-t pt-4">
                  <p>Created: {new Date(selectedResult.createdAt).toLocaleString()}</p>
                  {selectedResult.updatedAt !== selectedResult.createdAt && (
                    <p>Updated: {new Date(selectedResult.updatedAt).toLocaleString()}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}