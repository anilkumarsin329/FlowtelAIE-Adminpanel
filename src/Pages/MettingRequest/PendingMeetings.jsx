import MeetingRequestsBase from '../../Components/MeetingRequestsBase';

export default function PendingMeetings({ updateRequestStatus, updateMeetingRequest, deleteMeetingRequest }) {
  return (
    <MeetingRequestsBase
      title="Pending Meetings"
      status="pending"
      updateRequestStatus={updateRequestStatus}
      updateMeetingRequest={updateMeetingRequest}
      deleteMeetingRequest={deleteMeetingRequest}
    />
  );
}