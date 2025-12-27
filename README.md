# FlowtelAI AdminPanel

Modern admin dashboard for managing meeting requests, demo bookings, and newsletter subscriptions.

## Features

- **Meeting Management**: View, edit, confirm, and cancel meeting requests
- **Real-time Dashboard**: Analytics and statistics overview
- **Mobile Responsive**: Optimized for all device sizes
- **Email Notifications**: Automated booking confirmations and updates
- **Export Functionality**: CSV export for meeting data
- **Inline Editing**: Direct table editing for dates and times

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS + PrimeReact
- **Icons**: React Icons
- **Backend**: Node.js + Express + MongoDB

## Environment Variables

Create a `.env` file with:

```
VITE_API_BASE_URL=https://your-backend-url.com
```

## Installation

```bash
npm install
npm run dev
```

## Deployment

### Vercel Deployment

1. Connect GitHub repository to Vercel
2. Set environment variable:
   - `VITE_API_BASE_URL`: Your backend API URL
3. Deploy automatically

## Admin Credentials

- **Username**: admin
- **Password**: flowtel123

## API Integration

The admin panel connects to the FlowtelAI backend for:
- Meeting request management
- Demo booking handling
- Newsletter subscription tracking
- Email notification services

## Project Structure

```
src/
├── Components/
│   ├── AdminPanel.jsx      # Main admin component
│   ├── Login.jsx          # Authentication
│   ├── Sidebar.jsx        # Navigation
│   ├── Navbar.jsx         # Top navigation
│   └── Dashboard.jsx      # Analytics dashboard
├── Pages/
│   ├── MeetingRequestsPage.jsx  # Meeting management
│   └── MeetingSlotsPage.jsx     # Slot creation
└── main.jsx               # App entry point
```

## Features Overview

### Meeting Requests
- View all meeting requests with filtering
- Inline editing for date/time
- Status management (pending/confirmed/cancelled)
- Detailed view modal with complete information
- Export to CSV functionality

### Dashboard Analytics
- Real-time statistics
- Meeting status breakdown
- Recent activity tracking
- Visual indicators and charts

### Mobile Optimization
- Responsive card layout for mobile
- Touch-friendly interface
- Optimized spacing and typography
- Collapsible navigation

## Backend Integration

Connects to: `https://flowtelaiebackend-ai.onrender.com`

API endpoints used:
- `GET /api/meetings/requests` - Fetch meeting requests
- `PUT /api/meetings/requests/:id/status` - Update status
- `POST /api/meetings/slots` - Create time slots
- `GET /api/demo` - Demo requests
- `GET /api/newsletter` - Newsletter subscribers