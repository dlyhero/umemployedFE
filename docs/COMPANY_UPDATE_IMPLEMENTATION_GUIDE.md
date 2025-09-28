# Company Update Implementation Guide

## Overview
This guide explains the complete flow for updating company information, from accessing the update page to submitting changes and managing company settings.

## Flow Overview
1. **Access Update Page** → 2. **Load Company Data** → 3. **Edit Information** → 4. **Validate & Submit** → 5. **Handle Response** → 6. **Redirect to Dashboard**

---

## Step 1: Access Company Update Page

### Entry Points
- **Direct URL**: `/companies/{companyId}/update`
- **Dashboard Navigation**: Click "Update Company" button from dashboard
- **Settings Integration**: Link from company settings page

### Authentication Requirements
- User must be authenticated with recruiter role
- User must belong to the company being updated
- Valid access token required for all API calls

### Authorization Check
```javascript
if (session?.user?.role !== 'recruiter') {
  toast.error('Only recruiters can update company profiles.');
  router.push('/select-role');
  return;
}
```

---

## Step 2: Fetch Company Data

### Endpoint
```
GET https://server.umemployed.com/api/company/company-details/{companyId}/
```

### Headers
```javascript
{
  "Authorization": "Bearer {access_token}"
}
```

### Expected Response Structure
```javascript
{
  "id": 123,
  "name": "UmEmployed",
  "industry": "Technology",
  "size": "51-200",
  "location": "San Francisco, CA",
  "founded": 2020,
  "website_url": "https://umemployed.com",
  "country": "US",
  "contact_email": "contact@umemployed.com",
  "contact_phone": "+1-555-0123",
  "description": "Leading job platform connecting talent with opportunities...",
  "mission_statement": "To democratize access to quality employment opportunities...",
  "linkedin": "https://linkedin.com/company/umemployed",
  "video_introduction": "https://youtube.com/watch?v=example",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### Implementation Steps
1. Check authentication status
2. Verify user role (recruiter only)
3. Fetch company data from API
4. Populate form fields with existing data
5. Handle loading and error states

---

## Step 3: Form Structure and Components

### Form Sections

#### 3.1 Company Information Section
**Fields:**
- **Company Name** (required): Text input with building icon
- **Industry**: Dropdown with predefined options
- **Company Size**: Dropdown with size ranges
- **Location**: Text input with map pin icon
- **Founded Year**: Number input with calendar icon
- **Website URL**: URL input with globe icon
- **Country**: Dropdown with country list

**Industry Options:**
```javascript
const industries = [
  'Technology', 'Finance', 'Healthcare', 'Education', 
  'Manufacturing', 'Retail', 'Hospitality', 'Construction', 
  'Transportation'
];
```

**Company Size Options:**
```javascript
const sizes = [
  '1-10', '11-50', '51-200', '201-500', 
  '501-1000', '1001-5000', '5001-10000', '10001+'
];
```

#### 3.2 Contact Information Section
**Fields:**
- **Contact Email**: Email input with envelope icon
- **Contact Phone**: Tel input with phone icon

#### 3.3 Company Description Section
**Fields:**
- **Description**: Textarea for company overview
- **Mission Statement**: Textarea for company mission

#### 3.4 Social Links & Media Section
**Fields:**
- **LinkedIn**: URL input with link icon
- **Video Introduction URL**: URL input with video icon

### Form Validation Rules
- **Company Name**: Required, minimum 2 characters
- **Country**: Required
- **Contact Email**: Valid email format (if provided)
- **Website URL**: Valid URL format (if provided)
- **LinkedIn**: Valid URL format (if provided)
- **Video URL**: Valid URL format (if provided)

---

## Step 4: Form State Management

### State Structure
```javascript
const [formData, setFormData] = useState({
  name: '',
  industry: '',
  size: '',
  location: '',
  founded: '',
  website_url: '',
  country: '',
  contact_email: '',
  contact_phone: '',
  description: '',
  mission_statement: '',
  linkedin: '',
  video_introduction: '',
});
```

### Input Change Handler
```javascript
const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
};
```

### Select Change Handler
```javascript
const handleSelectChange = (name, value) => {
  setFormData((prev) => ({ ...prev, [name]: value }));
};
```

---

## Step 5: Submit Company Updates

### Endpoint
```
PUT https://server.umemployed.com/api/company/update-company/{companyId}/
```

### Headers
```javascript
{
  "Authorization": "Bearer {access_token}",
  "Content-Type": "application/json"
}
```

### Request Body Preparation
```javascript
const payload = {};
for (const key in formData) {
  if (formData[key] !== '' && formData[key] !== null && formData[key] !== undefined) {
    payload[key] = key === 'founded' ? parseInt(formData[key]) : formData[key];
  }
}
```

### Expected Request Body
```javascript
{
  "name": "UmEmployed",
  "industry": "Technology",
  "size": "51-200",
  "location": "San Francisco, CA",
  "founded": 2020,
  "website_url": "https://umemployed.com",
  "country": "US",
  "contact_email": "contact@umemployed.com",
  "contact_phone": "+1-555-0123",
  "description": "Leading job platform...",
  "mission_statement": "To democratize access...",
  "linkedin": "https://linkedin.com/company/umemployed",
  "video_introduction": "https://youtube.com/watch?v=example"
}
```

### Expected Response
```javascript
{
  "success": true,
  "message": "Company updated successfully",
  "data": {
    "id": 123,
    "name": "UmEmployed",
    // ... updated company data
  }
}
```

### Implementation Steps
1. Validate required fields (name, country)
2. Prepare payload (remove empty values, convert founded to integer)
3. Show loading state during submission
4. Call update API endpoint
5. Handle success/error responses
6. Redirect to dashboard on success

---

## Step 6: Error Handling

### Common Error Scenarios
1. **Authentication Errors**: 401 Unauthorized
2. **Permission Errors**: 403 Forbidden
3. **Validation Errors**: 400 Bad Request
4. **Not Found**: 404 Company not found
5. **Server Errors**: 500 Internal Server Error

### Error Handling Strategy
```javascript
try {
  const response = await fetch(updateUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || errorData.non_field_errors?.join(', ') || 'Failed to update company.');
  }
  
  toast.success('Company updated successfully!');
  router.push(`/companies/${companyId}/dashboard`);
} catch (err) {
  toast.error(err.message || 'Failed to update company. Please try again.');
} finally {
  setSubmitting(false);
}
```

### Error Messages
```javascript
const errorMessages = {
  401: "Unauthorized. Please sign in again.",
  403: "You don't have permission to update this company.",
  404: "Company not found. Please check the company ID.",
  400: "Please check your input data and try again.",
  500: "Server error. Please try again later."
};
```

---

## Step 7: Company Settings Integration

### Settings Page Structure
The company settings page includes multiple sections:

#### 7.1 Account Settings
- **User Profile**: Update personal information
- **Account Deletion**: Delete user account
- **Role Management**: Switch between roles

#### 7.2 Security Settings
- **Password Change**: Update account password
- **Two-Factor Authentication**: Enable/disable 2FA
- **Login History**: View recent login attempts

#### 7.3 Notification Settings
- **Email Preferences**: Configure email notifications
- **Application Alerts**: Set up application notifications
- **Marketing Communications**: Opt-in/out of marketing emails

#### 7.4 Billing Settings
- **Subscription Management**: View current plan
- **Payment Methods**: Update payment information
- **Billing History**: View past invoices

### Settings Navigation
```javascript
const settingsSections = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'emails', label: 'Emails', icon: Mail },
  { id: 'billing', label: 'Billing', icon: CreditCard }
];
```

---

## Step 8: UI/UX Considerations

### Loading States
- **Initial Load**: Show skeleton loader while fetching company data
- **Form Submission**: Disable submit button and show "Updating..." text
- **Field Validation**: Show inline validation messages

### Form Layout
- **Responsive Design**: Grid layout that adapts to screen size
- **Section Organization**: Group related fields into logical sections
- **Visual Hierarchy**: Use consistent typography and spacing
- **Icon Integration**: Add relevant icons to form fields

### User Experience
- **Auto-save**: Consider implementing auto-save functionality
- **Draft Recovery**: Save form state in localStorage
- **Navigation Guards**: Warn users about unsaved changes
- **Success Feedback**: Clear success messages and redirects

---

## Step 9: Mobile Responsiveness

### Mobile Layout Considerations
1. **Single Column**: Stack form fields vertically on mobile
2. **Touch Targets**: Ensure buttons and inputs are touch-friendly
3. **Keyboard Handling**: Proper input types for mobile keyboards
4. **Viewport Management**: Handle mobile viewport properly

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

---

## Step 10: Performance Optimization

### Data Management
- **Lazy Loading**: Load form components on demand
- **Debounced Validation**: Debounce form validation
- **Efficient Re-renders**: Use React.memo for form components
- **State Optimization**: Minimize unnecessary state updates

### API Optimization
- **Payload Optimization**: Only send changed fields
- **Error Caching**: Cache error states to avoid repeated API calls
- **Retry Logic**: Implement retry for failed requests

---

## Implementation Checklist

### Phase 1: Basic Structure
- [ ] Set up authentication and authorization
- [ ] Create company update page layout
- [ ] Implement form sections and components
- [ ] Add basic form validation

### Phase 2: Core Features
- [ ] Implement data fetching and form population
- [ ] Add form submission and API integration
- [ ] Create error handling and user feedback
- [ ] Add loading states and transitions

### Phase 3: Advanced Features
- [ ] Implement company settings integration
- [ ] Add mobile responsiveness
- [ ] Create form state persistence
- [ ] Add advanced validation rules

### Phase 4: Polish
- [ ] Add comprehensive error handling
- [ ] Implement performance optimizations
- [ ] Add accessibility features
- [ ] Test across different browsers and devices

---

## Key Implementation Notes

1. **Always validate user permissions** before allowing updates
2. **Handle all error states gracefully** with user-friendly messages
3. **Use proper form validation** for all input fields
4. **Implement loading states** for better user experience
5. **Ensure mobile responsiveness** from the start
6. **Add proper error boundaries** for React components
7. **Use consistent styling** across all form components
8. **Implement proper state management** for complex forms
9. **Add form persistence** to prevent data loss
10. **Test thoroughly** with different data scenarios

## API Endpoints Summary

1. **Fetch Company**: `GET https://server.umemployed.com/api/company/company-details/{companyId}/`
2. **Update Company**: `PUT https://server.umemployed.com/api/company/update-company/{companyId}/`
3. **Subscription Status**: `GET https://server.umemployed.com/api/transactions/subscription-status/{userId}/`

This guide provides the complete flow and implementation details for building a company update system from scratch.