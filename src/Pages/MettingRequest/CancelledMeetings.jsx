import MeetingRequestsBase from '../../Components/MeetingRequestsBase';

export default function CancelledMeetings({ updateRequestStatus, updateMeetingRequest, deleteMeetingRequest }) {
  return (
    <MeetingRequestsBase
      title="Cancelled Meetings"
      status="cancelled"
      updateRequestStatus={updateRequestStatus}
      updateMeetingRequest={updateMeetingRequest}
      deleteMeetingRequest={deleteMeetingRequest}
    />
  );
}