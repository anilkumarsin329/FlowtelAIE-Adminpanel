import MeetingRequestsBase from '../../Components/MeetingRequestsBase';

export default function AllMeetings({ updateRequestStatus, updateMeetingRequest, deleteMeetingRequest }) {
  return (
    <MeetingRequestsBase
      title="All Meeting Requests"
      status="all"
      updateRequestStatus={updateRequestStatus}
      updateMeetingRequest={updateMeetingRequest}
      deleteMeetingRequest={deleteMeetingRequest}
    />
  );
}