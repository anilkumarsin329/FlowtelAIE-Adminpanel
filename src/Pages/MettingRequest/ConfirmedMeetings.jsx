import MeetingRequestsBase from '../../Components/MeetingRequestsBase';

export default function ConfirmedMeetings({ updateRequestStatus, updateMeetingRequest, deleteMeetingRequest }) {
  return (
    <MeetingRequestsBase
      title="Confirmed Meetings"
      status="confirmed"
      updateRequestStatus={updateRequestStatus}
      updateMeetingRequest={updateMeetingRequest}
      deleteMeetingRequest={deleteMeetingRequest}
    />
  );
}