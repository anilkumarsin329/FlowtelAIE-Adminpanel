# Meeting Request Components

Clean and organized meeting request management system.

## Structure

```
MettingRequest/
├── index.js                          # Export all components
├── MeetingRequestsNavigation.jsx      # Main navigation component
├── MeetingRequestsPageImproved.jsx    # Full-featured page with tabs
├── MeetingRequestsPage.jsx           # Simple page using base component
├── MeetingResultsPage.jsx            # Meeting results management
├── AllMeetings.jsx                   # All meetings view
├── PendingMeetings.jsx              # Pending meetings only
├── ConfirmedMeetings.jsx            # Confirmed meetings only
├── CompletedMeetings.jsx            # Completed meetings only
└── CancelledMeetings.jsx            # Cancelled meetings only
```

## Usage

### Option 1: Navigation Component (Recommended)
```jsx
import { MeetingRequestsNavigation } from './Pages/MettingRequest';

<MeetingRequestsNavigation
  updateRequestStatus={updateRequestStatus}
  updateMeetingRequest={updateMeetingRequest}
  deleteMeetingRequest={deleteMeetingRequest}
/>
```

### Option 2: Individual Pages
```jsx
import { AllMeetings, PendingMeetings } from './Pages/MettingRequest';

// Use individual components
<AllMeetings {...props} />
<PendingMeetings {...props} />
```

### Option 3: Full-Featured Page
```jsx
import { MeetingRequestsPageImproved } from './Pages/MettingRequest';

<MeetingRequestsPageImproved {...props} />
```

## Features

✅ **Clean Code** - Minimal, maintainable code
✅ **Reusable Components** - Shared base component
✅ **Connected Pages** - Easy navigation between views
✅ **Status Management** - Handle all meeting statuses
✅ **Search & Filter** - Find meetings quickly
✅ **Export Functionality** - CSV export
✅ **Responsive Design** - Works on all devices

## Props Required

```jsx
{
  updateRequestStatus: (id, status, reason) => Promise,
  updateMeetingRequest: (id, data) => Promise,
  deleteMeetingRequest: (id) => Promise
}
```

## Benefits

1. **Organized Structure** - All related files in one folder
2. **Clean Code** - Removed unnecessary complexity
3. **Easy Navigation** - Switch between different views
4. **Maintainable** - Single source of truth for shared logic
5. **Scalable** - Easy to add new features