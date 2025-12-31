import MeetingRequestsBase from '../../Components/MeetingRequestsBase';

export default function ConfirmedMeetings({ updateRequestStatus, updateMeetingRequest, deleteMeetingRequest, saveMeetingResult }) {
  return (
    <MeetingRequestsBase
      title="Confirmed Meetings"
      status="confirmed"
      updateRequestStatus={updateRequestStatus}
      updateMeetingRequest={updateMeetingRequest}
      deleteMeetingRequest={deleteMeetingRequest}
      saveMeetingResult={saveMeetingResult}
    />
  );
}