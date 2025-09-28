# Recruiter Applications Dashboard Implementation Guide

## Overview
This guide explains the complete flow of the recruiter applications dashboard, from viewing applications to managing candidates through the entire hiring process.

## Flow Overview
1. **Access Applications** → 2. **View Application Lists** → 3. **Top 5 & Waiting List** → 4. **Candidate Actions** → 5. **View Candidate Details** → 6. **Schedule Interviews** → 7. **Manage Shortlist**

---

## Step 1: Access Applications Dashboard

### Entry Points
- **Main Dashboard**: Click "View Applications" button from dashboard
- **Direct URL**: `/companies/{companyId}/applications`
- **Job-specific**: `/companies/{companyId}/jobs/{jobId}/applications`

### Authentication Requirements
- User must be authenticated with recruiter role
- Valid access token required for all API calls
- Company ID must match user's company

---

## Step 2: Fetch Applications Data

### Endpoint for Job-Specific Applications
```
GET https://server.umemployed.com/api/company/company/{companyId}/job/{jobId}/applications/
```

### Endpoint for Company-Wide Applications
```
GET https://server.umemployed.com/api/company/company/{companyId}/applications/
```

### Headers
```javascript
{
  "Authorization": "Bearer {access_token}",
  "Content-Type": "application/json"
}
```

### Expected Response Structure
```javascript
{
  "top_5_candidates": [
    {
      "user_id": 123,
      "full_name": "John Doe",
      "email": "john@example.com",
      "matchingPercentage": 85,
      "quizScore": 92,
      "isShortlisted": false,
      "created_at": "2024-01-15T10:30:00Z",
      "profile": {
        "firstName": "John",
        "lastName": "Doe",
        "location": "San Francisco, CA",
        "jobTitle": "Senior Developer",
        "profileImage": "https://...",
        "coverLetter": "Experienced developer with 5+ years...",
        "skills": ["JavaScript", "React", "Node.js"],
        "contacts": {
          "email": "john@example.com",
          "phone": "+1234567890"
        },
        "experiences": [
          {
            "company": "Tech Corp",
            "position": "Senior Developer",
            "duration": "2020-2024",
            "description": "Led development team..."
          }
        ],
        "languages": ["English", "Spanish"]
      }
    }
  ],
  "waiting_list_candidates": [
    // Same structure as top_5_candidates
  ]
}
```

### Implementation Steps
1. Fetch job details first to get job title
2. Call applications endpoint to get basic application data
3. Fetch shortlisted candidates to determine shortlist status
4. For each candidate, fetch detailed profile using user profile endpoint
5. Combine and transform all data into unified candidate objects
6. Sort by creation date (newest first)
7. Handle empty states gracefully

### Additional Endpoint for Candidate Details
```
GET https://server.umemployed.com/api/resume/user-profile/{user_id}/
```

### Headers
```javascript
{
  "Authorization": "Bearer {access_token}",
  "Content-Type": "application/json"
}
```

### Expected Response Structure
```javascript
{
  "contact_info": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "city": "San Francisco",
    "country": "USA",
    "job_title_name": "Senior Developer"
  },
  "profile_image": "https://...",
  "description": "Experienced developer with 5+ years...",
  "skills": [
    { "name": "JavaScript" },
    { "name": "React" },
    { "name": "Node.js" }
  ],
  "work_experience": [
    {
      "role": "Senior Developer",
      "start_date": "2020-01-01",
      "end_date": "2024-01-01"
    }
  ],
  "languages": [
    { "name": "English" },
    { "name": "Spanish" }
  ]
}
```

### Shortlisted Candidates Endpoint
```
GET https://server.umemployed.com/api/company/company/{companyId}/job/{jobId}/shortlisted/
```

### Headers
```javascript
{
  "Authorization": "Bearer {access_token}",
  "Content-Type": "application/json"
}
```

### Expected Response
```javascript
[
  {
    "candidate_id": 123,
    "shortlisted_date": "2024-01-15T10:30:00Z"
  }
]
```

---

## Step 3: Display Application Statistics

### Statistics to Calculate
```javascript
const stats = {
  totalApplications: applications.length,
  shortlistedCount: applications.filter(app => app.isShortlisted).length,
  pendingReview: applications.filter(app => !app.isShortlisted).length
};
```

### Display Format
- **Total Applications**: Show count with Users icon
- **Shortlisted**: Show count with Star icon (yellow)
- **Pending Review**: Show count with Clock icon (gray)

---

## Step 4: Top 5 Candidates Section

### Layout Structure
- **Header**: "Top 5 Candidates" with gradient indicator
- **Badge**: Show count of candidates
- **Cards**: Display first 5 candidates from applications array
- **Empty State**: Show message if no candidates

### Candidate Card Components
Each candidate card should display:
- **Profile Image**: Avatar with fallback to initials
- **Name**: Full name from profile
- **Location**: From profile.location
- **Match Score**: matchingPercentage with color coding
- **Quiz Score**: quizScore percentage
- **Skills Preview**: First 3 skills as badges
- **Action Buttons**: View Details, Shortlist/Remove

### Color Coding for Match Scores
- **90-100%**: Green (Excellent match)
- **80-89%**: Blue (Good match)
- **70-79%**: Yellow (Fair match)
- **Below 70%**: Red (Poor match)

---

## Step 5: Waiting List Section

### Layout Structure
- **Header**: "Waiting List" with yellow gradient indicator
- **Badge**: Show count of remaining candidates
- **Cards**: Display candidates from index 5 onwards
- **Empty State**: Show "No Waiting List" message

### Implementation Logic
```javascript
const topCandidates = applications.slice(0, 5);
const waitingList = applications.slice(5);
```

---

## Step 6: Candidate Actions

### Available Actions

#### For Non-Shortlisted Candidates
1. **View Full Profile**: Opens candidate modal
2. **Add to Shortlist**: Calls shortlist API
3. **Schedule Interview**: Opens interview modal (if shortlisted)

#### For Shortlisted Candidates
1. **View Full Profile**: Opens candidate modal
2. **Remove from Shortlist**: Calls unshortlist API
3. **Schedule Interview**: Opens interview modal
4. **View Resume**: Link to resume (if available)

### Action Loading States
- Show loading spinner during API calls
- Disable buttons during processing
- Update UI immediately on success/failure

---

## Step 7: Shortlist Management

### Shortlist Candidate
```
POST https://server.umemployed.com/api/company/company/{companyId}/job/{jobId}/shortlist/
```

### Headers
```javascript
{
  "Authorization": "Bearer {access_token}",
  "Content-Type": "application/json"
}
```

### Request Body
```javascript
{
  "candidate_id": 123
}
```

### Expected Response
```javascript
{
  "success": true,
  "message": "Candidate shortlisted successfully"
}
```

### Implementation Steps
1. Show loading state on button
2. Call shortlist API
3. Update local state (set isShortlisted: true)
4. Show success toast
5. Hide loading state

### Unshortlist Candidate
- Similar process but removes from shortlist
- Updates isShortlisted: false in local state

---

## Step 8: Candidate Details Modal

### Modal Content Structure
1. **Header Section**:
   - Profile image with fallback to initials
   - Full name and location
   - Match percentage with color coding
   - Contact information (email, phone)

2. **About Section**:
   - Cover letter/description
   - Skills list with badges
   - Languages spoken

3. **Experience Section**:
   - Work history with company, position, duration
   - Job descriptions and achievements

4. **Education Section**:
   - Degrees, universities, graduation years

5. **Actions Section**:
   - Shortlist/Unshortlist button
   - Schedule Interview button
   - Message button (if implemented)

### Modal Features
- **Responsive Design**: Works on mobile and desktop
- **Scrollable Content**: Handle long profiles
- **Close Actions**: Click outside, X button, or Escape key

---

## Step 9: Schedule Interview Modal

### Modal Form Fields
1. **Interview Date**: Date picker (required)
2. **Interview Time**: Time picker (required)
3. **Timezone**: Dropdown with common timezones (required)
4. **Notes**: Textarea for additional information (optional)

### Timezone Options
- UTC
- America/New_York
- America/Los_Angeles
- Europe/London
- Asia/Tokyo

### API Endpoint
```
POST https://server.umemployed.com/api/company/create-interview/
```

### Headers
```javascript
{
  "Authorization": "Bearer {access_token}",
  "Content-Type": "application/json"
}
```

### Request Body
```javascript
{
  "candidate_id": 123,
  "job_id": 456,
  "company_id": 789,
  "date": "2024-01-20",
  "time": "14:30",
  "timezone": "America/New_York",
  "notes": "Technical interview focusing on React skills"
}
```

### Expected Response
```javascript
{
  "success": true,
  "message": "Interview scheduled successfully",
  "interview_id": 101
}
```

### Implementation Steps
1. Validate all required fields
2. Show loading state during submission
3. Call create-interview API
4. Show success toast with candidate name
5. Close modal on success
6. Handle errors gracefully

---

## Step 10: Shortlist Tab Management

### Shortlist Tab Features
- **Dedicated View**: Show only shortlisted candidates
- **Enhanced Actions**: Focus on interview scheduling
- **Status Tracking**: Show interview status if scheduled
- **Bulk Actions**: Select multiple candidates (optional)

### Navigation
- **Tab Switching**: Between "Candidates" and "Shortlist"
- **URL Updates**: Update browser URL when switching tabs
- **State Persistence**: Maintain tab state during session

---

## Step 11: Error Handling

### Common Error Scenarios
1. **Authentication Errors**: 401 Unauthorized
2. **Permission Errors**: 403 Forbidden
3. **Not Found**: 404 for invalid company/job IDs
4. **Server Errors**: 500 Internal Server Error
5. **Network Errors**: Connection timeouts

### Error Handling Strategy
- **Toast Notifications**: Show user-friendly error messages
- **Retry Mechanisms**: Allow retry for failed actions
- **Fallback States**: Show appropriate empty states
- **Loading States**: Prevent multiple submissions

### Error Messages
```javascript
const errorMessages = {
  401: "Please sign in to continue",
  403: "You don't have permission to view applications",
  404: "Job or company not found",
  500: "Server error. Please try again later",
  network: "Connection error. Please check your internet"
};
```

---

## Step 12: Real-time Updates

### WebSocket Integration (Optional)
- **Connection**: Connect to WebSocket for real-time updates
- **Events**: Listen for new applications, status changes
- **Updates**: Refresh data when notifications received
- **Fallback**: Use polling if WebSocket unavailable

### Polling Strategy
- **Interval**: Poll every 30 seconds for updates
- **Smart Polling**: Only poll when tab is active
- **Background Updates**: Update data silently

---

## Step 13: Mobile Responsiveness

### Mobile Layout Considerations
1. **Card Layout**: Stack candidate cards vertically
2. **Touch Targets**: Ensure buttons are touch-friendly
3. **Modal Sizing**: Full-screen modals on mobile
4. **Navigation**: Collapsible sidebar navigation
5. **Actions**: Simplified action buttons

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

---

## Step 14: Performance Optimization

### Data Management
- **Pagination**: Load applications in batches
- **Caching**: Cache application data locally
- **Debouncing**: Debounce search and filter inputs
- **Lazy Loading**: Load candidate profiles on demand

### UI Optimization
- **Virtual Scrolling**: For large candidate lists
- **Image Optimization**: Compress profile images
- **Bundle Splitting**: Code split by feature
- **Memoization**: Memoize expensive calculations

---

## Implementation Checklist

### Phase 1: Basic Structure
- [ ] Set up authentication and routing
- [ ] Create applications listing page
- [ ] Implement basic candidate cards
- [ ] Add loading and error states

### Phase 2: Core Features
- [ ] Implement Top 5 and Waiting List sections
- [ ] Add shortlist/unshortlist functionality
- [ ] Create candidate details modal
- [ ] Add application statistics

### Phase 3: Advanced Features
- [ ] Implement interview scheduling
- [ ] Add shortlist tab management
- [ ] Create responsive mobile layout
- [ ] Add real-time updates (optional)

### Phase 4: Polish
- [ ] Add comprehensive error handling
- [ ] Implement performance optimizations
- [ ] Add accessibility features
- [ ] Test across different browsers and devices

---

## Key Implementation Notes

1. **Always validate authentication** before making API calls
2. **Handle empty states gracefully** with appropriate messaging
3. **Use optimistic updates** for better user experience
4. **Implement proper loading states** for all async operations
5. **Cache application data** to reduce API calls
6. **Use color coding** for match scores and status indicators
7. **Ensure mobile responsiveness** from the start
8. **Add proper error boundaries** for React components
9. **Implement proper form validation** for interview scheduling
10. **Use consistent styling** across all components

## API Endpoints Summary

1. **Applications**: `GET https://server.umemployed.com/api/company/company/{companyId}/job/{jobId}/applications/`
2. **Company Applications**: `GET https://server.umemployed.com/api/company/company/{companyId}/applications/`
3. **Candidate Details**: `GET https://server.umemployed.com/api/resume/user-profile/{user_id}/`
4. **Shortlisted Candidates**: `GET https://server.umemployed.com/api/company/company/{companyId}/job/{jobId}/shortlisted/`
5. **Shortlist**: `POST https://server.umemployed.com/api/company/company/{companyId}/job/{jobId}/shortlist/`
6. **Create Interview**: `POST https://server.umemployed.com/api/company/create-interview/`
7. **Job Details**: `GET https://server.umemployed.com/api/job/jobs/{jobId}/`

This guide provides the complete flow and implementation details for building a recruiter applications dashboard from scratch.