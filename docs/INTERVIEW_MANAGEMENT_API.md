# 📅 Interview Management API Endpoints

## ✅ **Available Endpoints for Interview Management**

Your backend now has comprehensive interview management APIs for both **recruiters** and **job seekers**.

---

## 🔍 **1. List All Interviews**

### **Endpoint:**
```
GET /api/company/interviews/
```

### **Authentication:** Required (Bearer token)

### **Query Parameters:**
- `role` (optional): Filter by role
  - `candidate` - Only interviews where user is the candidate
  - `recruiter` - Only interviews where user is the recruiter
  - No parameter - Shows all interviews for the user

### **Usage Examples:**

#### **For Recruiters (see interviews they created):**
```javascript
const getMyCreatedInterviews = async () => {
  const response = await fetch('/api/company/interviews/?role=recruiter', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};
```

#### **For Job Seekers (see interviews scheduled with them):**
```javascript
const getMyInterviews = async () => {
  const response = await fetch('/api/company/interviews/?role=candidate', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};
```

#### **All Interviews (both roles):**
```javascript
const getAllMyInterviews = async () => {
  const response = await fetch('/api/company/interviews/', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};
```

### **Response Format:**
```json
[
  {
    "id": 1,
    "candidate_name": "John Doe",
    "candidate_email": "john@example.com",
    "recruiter_name": "Jane Smith",
    "recruiter_email": "jane@company.com",
    "job_title": "Software Engineer",
    "company_name": "Tech Corp",
    "date": "2025-10-03",
    "time": "14:50",
    "timezone": "America/New_York",
    "interview_type": "google_meet",
    "meeting_link": "https://meet.google.com/abc-defg-hij",
    "note": "Technical interview",
    "status": "upcoming",
    "user_role": "recruiter"
  }
]
```

---

## 🎯 **2. Get Specific Interview Details**

### **Endpoint:**
```
GET /api/company/interviews/{interview_id}/
```

### **Authentication:** Required (Bearer token)

### **Authorization:** User must be either the candidate or recruiter for this interview

### **Usage Example:**
```javascript
const getInterviewDetails = async (interviewId) => {
  const response = await fetch(`/api/company/interviews/${interviewId}/`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return await response.json();
};
```

### **Response Format:**
```json
{
  "id": 1,
  "candidate_name": "John Doe",
  "candidate_email": "john@example.com", 
  "recruiter_name": "Jane Smith",
  "recruiter_email": "jane@company.com",
  "job_title": "Software Engineer",
  "company_name": "Tech Corp",
  "date": "2025-10-03",
  "time": "14:50",
  "timezone": "America/New_York",
  "interview_type": "google_meet",
  "meeting_link": "https://meet.google.com/abc-defg-hij",
  "note": "Technical interview",
  "status": "upcoming",
  "user_role": "candidate",
  "can_join": true
}
```

### **Key Features:**
- **Smart Meeting Link Access:** Only shows `meeting_link` if user can join (15 min before to 60 min after)
- **Status Detection:** `upcoming`, `in_progress`, or `completed`
- **Role Awareness:** Shows whether user is `candidate` or `recruiter`
- **Join Permission:** `can_join` indicates if meeting is accessible now

---

## 🚀 **3. Create Interview (Enhanced)**

### **Endpoint:**
```
POST /api/company/google/create-interview/
```

### **Enhanced Payload:**
```json
{
  "candidate_id": 1,
  "job_id": 2113,
  "company_id": 1534,
  "date": "2025-10-03",
  "time": "14:50",
  "timezone": "America/New_York",
  "note": "Technical interview",
  "interview_type": "google_meet"
}
```

**Note:** Backend automatically extracts `job_title` from `job_id`, so you don't need to send `job_title` separately.

---

## 📊 **Frontend Integration Examples**

### **1. Recruiter Dashboard - My Created Interviews**
```typescript
const RecruiterInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  
  useEffect(() => {
    fetchMyInterviews();
  }, []);
  
  const fetchMyInterviews = async () => {
    try {
      const response = await fetch('/api/company/interviews/?role=recruiter', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setInterviews(data);
    } catch (error) {
      console.error('Failed to fetch interviews:', error);
    }
  };

  return (
    <div className="interviews-list">
      <h2>My Scheduled Interviews</h2>
      {interviews.map(interview => (
        <div key={interview.id} className="interview-card">
          <h3>{interview.job_title}</h3>
          <p><strong>Candidate:</strong> {interview.candidate_name}</p>
          <p><strong>Date:</strong> {interview.date} at {interview.time}</p>
          <p><strong>Status:</strong> {interview.status}</p>
          {interview.meeting_link && (
            <a href={interview.meeting_link} target="_blank">
              Join Google Meet
            </a>
          )}
        </div>
      ))}
    </div>
  );
};
```

### **2. Job Seeker Dashboard - My Interviews**
```typescript
const CandidateInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  
  useEffect(() => {
    fetchMyInterviews();
  }, []);
  
  const fetchMyInterviews = async () => {
    try {
      const response = await fetch('/api/company/interviews/?role=candidate', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setInterviews(data);
    } catch (error) {
      console.error('Failed to fetch interviews:', error);
    }
  };

  return (
    <div className="interviews-list">
      <h2>My Upcoming Interviews</h2>
      {interviews.map(interview => (
        <div key={interview.id} className="interview-card">
          <h3>{interview.job_title}</h3>
          <p><strong>Company:</strong> {interview.company_name}</p>
          <p><strong>Recruiter:</strong> {interview.recruiter_name}</p>
          <p><strong>Date:</strong> {interview.date} at {interview.time}</p>
          <p><strong>Status:</strong> {interview.status}</p>
          {interview.can_join && interview.meeting_link && (
            <a href={interview.meeting_link} target="_blank" className="btn btn-primary">
              Join Interview
            </a>
          )}
          {!interview.can_join && interview.status === 'upcoming' && (
            <p className="text-gray-500">
              Join button will be available 15 minutes before the interview
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
```

### **3. Interview Detail Page**
```typescript
const InterviewDetailPage = ({ interviewId }) => {
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchInterviewDetails();
  }, [interviewId]);
  
  const fetchInterviewDetails = async () => {
    try {
      const response = await fetch(`/api/company/interviews/${interviewId}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setInterview(data);
    } catch (error) {
      console.error('Failed to fetch interview details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!interview) return <div>Interview not found</div>;

  return (
    <div className="interview-detail">
      <h1>{interview.job_title} Interview</h1>
      
      <div className="interview-info">
        <h3>Interview Details</h3>
        <p><strong>Date:</strong> {interview.date}</p>
        <p><strong>Time:</strong> {interview.time} ({interview.timezone})</p>
        <p><strong>Type:</strong> {interview.interview_type}</p>
        <p><strong>Status:</strong> {interview.status}</p>
        
        {interview.user_role === 'candidate' && (
          <div>
            <p><strong>Company:</strong> {interview.company_name}</p>
            <p><strong>Recruiter:</strong> {interview.recruiter_name}</p>
          </div>
        )}
        
        {interview.user_role === 'recruiter' && (
          <div>
            <p><strong>Candidate:</strong> {interview.candidate_name}</p>
            <p><strong>Email:</strong> {interview.candidate_email}</p>
          </div>
        )}
        
        {interview.note && (
          <div>
            <h4>Notes:</h4>
            <p>{interview.note}</p>
          </div>
        )}
      </div>
      
      {interview.can_join && interview.meeting_link && (
        <div className="join-section">
          <a 
            href={interview.meeting_link} 
            target="_blank" 
            className="btn btn-primary btn-lg"
          >
            🎥 Join Google Meet
          </a>
        </div>
      )}
      
      {!interview.can_join && interview.status === 'upcoming' && (
        <div className="join-info">
          <p>The meeting will be available to join 15 minutes before the scheduled time.</p>
        </div>
      )}
    </div>
  );
};
```

---

## 📋 **Summary of Available Endpoints**

```bash
# Interview Management
GET  /api/company/interviews/                    # List all interviews
GET  /api/company/interviews/?role=recruiter     # Recruiter's created interviews  
GET  /api/company/interviews/?role=candidate     # Candidate's scheduled interviews
GET  /api/company/interviews/{id}/               # Specific interview details

# Google Meet Integration
GET  /api/company/google/check-connection/       # Check Google connection
GET  /api/company/google/connect/                # Connect Google (direct redirect)
GET  /api/company/google/auth-url/               # Get Google auth URL (API)
POST /api/company/google/create-interview/       # Create Google Meet interview
DELETE /api/company/google/disconnect/           # Disconnect Google
```

## 🎉 **Ready for Frontend Implementation!**

Both **recruiters** and **job seekers** now have complete API access to:
- ✅ **View their interviews** (with role-specific information)
- ✅ **Get detailed interview information**
- ✅ **Join meetings** (with time-based access control)
- ✅ **See interview status** (upcoming/in-progress/completed)
- ✅ **Access meeting links** (only when appropriate)

The APIs handle all the security, authorization, and business logic - your frontend just needs to consume them! 🚀
