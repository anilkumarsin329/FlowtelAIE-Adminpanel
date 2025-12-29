import MeetingRequestsBase from '../../Components/MeetingRequestsBase';

export default function CompletedMeetings({ updateRequestStatus, updateMeetingRequest, deleteMeetingRequest }) {
  return (
    <MeetingRequestsBase
      title="Completed Meetings"
      status="completed"
      updateRequestStatus={updateRequestStatus}
      updateMeetingRequest={updateMeetingRequest}
      deleteMeetingRequest={deleteMeetingRequest}
    />
  );
}