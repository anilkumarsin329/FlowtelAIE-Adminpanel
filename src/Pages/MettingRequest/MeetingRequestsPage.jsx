import MeetingRequestsBase from '../../Components/MeetingRequestsBase';

export default function MeetingRequestsPage({ updateRequestStatus, updateMeetingRequest, deleteMeetingRequest }) {
  return (
    <MeetingRequestsBase
      title="Meeting Requests"
      status="all"
      updateRequestStatus={updateRequestStatus}
      updateMeetingRequest={updateMeetingRequest}
      deleteMeetingRequest={deleteMeetingRequest}
    />
  );
}