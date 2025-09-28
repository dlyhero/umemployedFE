# Payment API Documentation

## Overview
The UmEmployed platform provides comprehensive payment and subscription management through Stripe and PayPal integration. This documentation covers all payment endpoints, subscription management, transaction history, and custom pricing options for both job seekers and recruiters.

## Payment Providers
- **Stripe**: Primary payment processor for subscriptions and one-time payments

## Subscription Tiers

### Job Seekers (Users)
- **Basic**: Free tier with limited features (5 daily actions)
- **Standard**: $9.99/month (20 daily actions)
- **Premium**: $19.99/month (unlimited actions, resume enhancement, top applicant status)

### Recruiters
- **Basic**: Free tier with limited features (1 daily job post)
- **Standard**: $29.99/month (5 daily job posts)
- **Premium**: $49.99/month (20 daily job posts, AI job descriptions, free endorsements)
- **Custom**: Enterprise pricing with custom features

### Special Subscriptions
- **Endorsement**: $4.99 one-time payment for profile endorsements

---

## API Endpoints

### Core Payment Endpoints

1. **[Create Stripe Subscription](#1-create-stripe-subscription)** - `POST /api/transactions/stripe-subscribe/`
2. **[Cancel Stripe Subscription](#2-cancel-stripe-subscription)** - `POST /api/transactions/stripe-cancel/`
3. **[Create Endorsement Subscription](#3-create-endorsement-subscription)** - `POST /api/transactions/endorsement-subscribe/`
4. **[Stripe One-Time Payment](#4-stripe-one-time-payment)** - `POST /api/transactions/stripe-payment/{candidate_id}/`

### Status & History Endpoints

5. **[Subscription Status](#5-subscription-status)** - `GET /api/transactions/subscription-status/{user_id}/`
6. **[Endorsement Subscription Status](#6-endorsement-subscription-status)** - `GET /api/transactions/endorsement-subscription-status/`
7. **[Transaction History](#7-transaction-history)** - `GET /api/transactions/transaction-history/`
8. **[Payment Success](#8-payment-success)** - `GET /api/transactions/payment-success/`
9. **[Payment Cancel](#9-payment-cancel)** - `GET /api/transactions/payment-cancel/`

### Custom Pricing Endpoints

10. **[Create Custom Pricing Inquiry](#10-create-custom-pricing-inquiry)** - `POST /api/transactions/custom-pricing/create/`
11. **[List Custom Pricing Inquiries](#11-list-custom-pricing-inquiries)** - `GET /api/transactions/custom-pricing/list/`
12. **[Get Custom Pricing Detail](#12-get-custom-pricing-detail)** - `GET /api/transactions/custom-pricing/{inquiry_id}/`
13. **[Custom Pricing Options](#13-custom-pricing-options)** - `GET /api/transactions/custom-pricing/options/`

### Webhook Endpoints

14. **[Stripe Webhook](#14-stripe-webhook)** - `POST /api/transactions/stripe/webhook/`

---

### 1. Create Stripe Subscription

**Endpoint:** `POST /api/transactions/stripe-subscribe/`

**Description:** Creates a Stripe subscription for job seekers or recruiters. Returns a Stripe Checkout session URL for payment completion.

**Authentication:** Required (Bearer Token)

**Request Body (JSON):**
```json
{
    "tier": "premium",
    "user_type": "user"
}
```

**Request Parameters:**
- `tier` (string, required): Subscription tier (`standard`, `premium`)
- `user_type` (string, required): User type (`user` for job seekers, `recruiter` for recruiters)

**Success Response (200 OK):**
```json
{
    "session_id": "cs_test_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid tier or user_type
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Stripe API error

**Frontend Integration:**
```javascript
const createSubscription = async (tier, userType, jwtToken) => {
    const response = await fetch('/api/transactions/stripe-subscribe/', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            tier: tier,
            user_type: userType
        })
    });
    
    if (response.ok) {
        const { session_id } = await response.json();
        
        // Redirect to Stripe Checkout
        const stripe = Stripe('pk_test_your_publishable_key');
        await stripe.redirectToCheckout({ sessionId: session_id });
    }
};
```

**When to Use:**
- User clicks "Subscribe" or "Upgrade" button
- After free trial expires
- When upgrading from a lower tier

---

### 2. Cancel Stripe Subscription

**Endpoint:** `POST /api/transactions/stripe-cancel/`

**Description:** Cancels the user's active Stripe subscription.

**Authentication:** Required (Bearer Token)

**Request Body:** None

**Success Response (200 OK):**
```json
{
    "message": "Subscription cancelled successfully."
}
```

**Error Responses:**
- `400 Bad Request`: No active subscription found
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Stripe API error

**Frontend Integration:**
```javascript
const cancelSubscription = async (jwtToken) => {
    const response = await fetch('/api/transactions/stripe-cancel/', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (response.ok) {
        const data = await response.json();
        console.log(data.message);
        // Update UI to reflect cancellation
    }
};
```

**When to Use:**
- User clicks "Cancel Subscription" button
- Account downgrade requests
- Subscription management page

---

### 3. Create Endorsement Subscription

**Endpoint:** `POST /api/transactions/endorsement-subscribe/`

**Description:** Creates a one-time payment for profile endorsement ($4.99).

**Authentication:** Required (Bearer Token)

**Request Body:** None

**Success Response (200 OK):**
```json
{
    "session_id": "cs_test_endorsement_session_id_here"
}
```

**Error Responses:**
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Stripe API error

**Frontend Integration:**
```javascript
const purchaseEndorsement = async (jwtToken) => {
    const response = await fetch('/api/transactions/endorsement-subscribe/', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (response.ok) {
        const { session_id } = await response.json();
        
        // Redirect to Stripe Checkout for endorsement payment
        const stripe = Stripe('pk_test_your_publishable_key');
        await stripe.redirectToCheckout({ sessionId: session_id });
    }
};
```

**When to Use:**
- User wants to purchase profile endorsement
- Boost profile visibility
- One-time payment for premium features

---

### 4. Stripe One-Time Payment

**Endpoint:** `POST /api/transactions/stripe-payment/{candidate_id}/`

**Description:** Creates a one-time Stripe payment for a specific candidate (used for hiring services).

**Authentication:** Required (Bearer Token)

**URL Parameters:**
- `candidate_id` (integer): ID of the candidate being hired

**Request Body (JSON):**
```json
{
    "amount": 99.99,
    "description": "Hiring John Doe for Software Engineer position"
}
```

**Success Response (200 OK):**
```json
{
    "session_id": "cs_test_hiring_payment_session_id",
    "amount": 99.99,
    "candidate_id": 123
}
```

**Error Responses:**
- `400 Bad Request`: Missing amount or invalid candidate
- `404 Not Found`: Candidate not found
- `500 Internal Server Error`: Stripe API error

**When to Use:**
- Recruiter wants to hire a specific candidate
- One-time payments for recruitment services
- Custom hiring fees

---

### 5. Subscription Status

**Endpoint:** `GET /api/transactions/subscription-status/{user_id}/`

**Description:** Gets the current subscription status for a specific user.

**Authentication:** Required (Bearer Token)

**URL Parameters:**
- `user_id` (integer): ID of the user to check subscription for

**Success Response (200 OK) - Active Subscription:**
```json
{
    "has_active_subscription": true,
    "user_type": "job_seeker",
    "tier": "premium",
    "started_at": "2025-09-24T10:30:00Z",
    "ended_at": null
}
```

**Success Response (200 OK) - No Active Subscription:**
```json
{
    "has_active_subscription": false
}
```

**Frontend Integration:**
```javascript
const checkSubscriptionStatus = async (userId, jwtToken) => {
    const response = await fetch(`/api/transactions/subscription-status/${userId}/`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${jwtToken}`
        }
    });
    
    if (response.ok) {
        const status = await response.json();
        
        if (status.has_active_subscription) {
            console.log(`User has ${status.tier} ${status.user_type} subscription`);
            // Update UI to show premium features
        } else {
            console.log('User has no active subscription');
            // Show upgrade prompts
        }
    }
};
```

**When to Use:**
- Check user's subscription level before showing features
- Display subscription information in user profile
- Determine feature availability

---

### 6. Endorsement Subscription Status

**Endpoint:** `GET /api/transactions/endorsement-subscription-status/`

**Description:** Checks if the authenticated user has an active endorsement subscription.

**Authentication:** Required (Bearer Token)

**Success Response (200 OK) - Has Endorsement:**
```json
{
    "has_endorsement_subscription": true,
    "tier": "endorsement",
    "started_at": "2025-09-24T10:30:00Z"
}
```

**Success Response (200 OK) - No Endorsement:**
```json
{
    "has_endorsement_subscription": false
}
```

**When to Use:**
- Check if user has purchased endorsement
- Show/hide endorsement badge
- Determine profile boost status

---

### 7. Transaction History

**Endpoint:** `GET /api/transactions/transaction-history/`

**Description:** Retrieves all transaction history for the authenticated user.

**Authentication:** Required (Bearer Token)

**Success Response (200 OK):**
```json
[
    {
        "transaction_id": "cs_test_123456789",
        "amount": 19.99,
        "payment_method": "stripe",
        "status": "completed",
        "created_at": "2025-09-24T10:30:00Z",
        "description": "Stripe subscription (user, premium)",
        "candidate": null
    },
    {
        "transaction_id": "cs_test_987654321",
        "amount": 4.99,
        "payment_method": "stripe",
        "status": "completed",
        "created_at": "2025-09-23T15:45:00Z",
        "description": "Profile endorsement purchase",
        "candidate": null
    }
]
```

**Frontend Integration:**
```javascript
const getTransactionHistory = async (jwtToken) => {
    const response = await fetch('/api/transactions/transaction-history/', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${jwtToken}`
        }
    });
    
    if (response.ok) {
        const transactions = await response.json();
        
        // Display transaction history in UI
        transactions.forEach(transaction => {
            console.log(`${transaction.transaction_id}: $${transaction.amount} - ${transaction.status}`);
        });
    }
};
```

**When to Use:**
- Display billing history page
- Show payment receipts
- Transaction management interface

---

### 8. Payment Success

**Endpoint:** `GET /api/transactions/payment-success/`

**Description:** Handles successful payment redirects from Stripe/PayPal.

**Authentication:** Required (Bearer Token)

**Query Parameters:**
- `session_id` (optional): Stripe session ID
- `payment_id` (optional): PayPal payment ID

**Success Response (200 OK):**
```json
{
    "message": "Payment processed successfully!",
    "transaction_id": "cs_test_123456789",
    "status": "completed"
}
```

**When to Use:**
- Success redirect URL after payment completion
- Confirmation page display
- Update user interface after successful payment

---

### 9. Payment Cancel

**Endpoint:** `GET /api/transactions/payment-cancel/`

**Description:** Handles cancelled payment redirects from Stripe/PayPal.

**Authentication:** Required (Bearer Token)

**Success Response (200 OK):**
```json
{
    "message": "Payment was cancelled.",
    "redirect_url": "/pricing"
}
```

**When to Use:**
- Cancel redirect URL after payment cancellation
- Show cancellation message
- Redirect user back to pricing page

---

### 10. Create Custom Pricing Inquiry

**Endpoint:** `POST /api/transactions/custom-pricing/create/`

**Description:** Creates a custom pricing inquiry for enterprise recruiters.

**Authentication:** Required (Bearer Token)

**Request Body (JSON):**
```json
{
    "company_name": "TechCorp Inc.",
    "company_size": "201-500",
    "contact_name": "John Smith",
    "work_email": "john.smith@techcorp.com",
    "hiring_volume": "16-30",
    "hiring_types": ["full_time", "remote", "contract"],
    "budget_range": "1000-2500",
    "billing_option": "annual_custom",
    "additional_requirements": "Need integration with our ATS system"
}
```

**Success Response (201 Created):**
```json
{
    "id": 1,
    "company_name": "TechCorp Inc.",
    "status": "pending",
    "created_at": "2025-09-24T10:30:00Z",
    "message": "Custom pricing inquiry submitted successfully. Our team will contact you within 24 hours."
}
```

**When to Use:**
- Enterprise recruitment needs
- High-volume hiring requirements
- Custom feature requests

---

### 11. List Custom Pricing Inquiries

**Endpoint:** `GET /api/transactions/custom-pricing/list/`

**Description:** Lists all custom pricing inquiries for the authenticated user.

**Authentication:** Required (Bearer Token)

**Success Response (200 OK):**
```json
[
    {
        "id": 1,
        "company_name": "TechCorp Inc.",
        "status": "pending",
        "created_at": "2025-09-24T10:30:00Z",
        "updated_at": "2025-09-24T10:30:00Z"
    }
]
```

**When to Use:**
- Display inquiry history
- Track inquiry status
- Manage custom pricing requests

---

### 12. Get Custom Pricing Detail

**Endpoint:** `GET /api/transactions/custom-pricing/{inquiry_id}/`

**Description:** Gets detailed information about a specific custom pricing inquiry.

**Authentication:** Required (Bearer Token)

**URL Parameters:**
- `inquiry_id` (integer): ID of the pricing inquiry

**Success Response (200 OK):**
```json
{
    "id": 1,
    "company_name": "TechCorp Inc.",
    "company_size": "201-500",
    "contact_name": "John Smith",
    "work_email": "john.smith@techcorp.com",
    "hiring_volume": "16-30",
    "hiring_types": ["full_time", "remote", "contract"],
    "budget_range": "1000-2500",
    "billing_option": "annual_custom",
    "additional_requirements": "Need integration with our ATS system",
    "status": "pending",
    "created_at": "2025-09-24T10:30:00Z",
    "admin_notes": null
}
```

**When to Use:**
- View inquiry details
- Edit inquiry information
- Check inquiry status updates

---

### 13. Custom Pricing Options

**Endpoint:** `GET /api/transactions/custom-pricing/options/`

**Description:** Gets available options for custom pricing form fields.

**Authentication:** Required (Bearer Token)

**Success Response (200 OK):**
```json
{
    "company_size_choices": [
        {"value": "1-10", "label": "1–10 employees"},
        {"value": "11-50", "label": "11–50 employees"},
        {"value": "51-200", "label": "51–200 employees"},
        {"value": "201-500", "label": "201–500 employees"},
        {"value": "500+", "label": "500+ employees"}
    ],
    "hiring_volume_choices": [
        {"value": "1-5", "label": "1–5"},
        {"value": "6-15", "label": "6–15"},
        {"value": "16-30", "label": "16–30"},
        {"value": "30+", "label": "30+"}
    ],
    "hiring_type_choices": [
        {"value": "full_time", "label": "Full-Time"},
        {"value": "part_time", "label": "Part-Time"},
        {"value": "contract", "label": "Contract"},
        {"value": "remote", "label": "Remote"},
        {"value": "onsite", "label": "Onsite"},
        {"value": "hybrid", "label": "Hybrid"}
    ],
    "budget_range_choices": [
        {"value": "under_200", "label": "Under $200"},
        {"value": "200-500", "label": "$200–$500"},
        {"value": "500-1000", "label": "$500–$1000"},
        {"value": "1000-2500", "label": "$1000–$2500"},
        {"value": "2500+", "label": "$2500+"}
    ],
    "billing_option_choices": [
        {"value": "pay_per_job", "label": "Pay-Per-Job"},
        {"value": "annual_custom", "label": "Annual Custom Plan"},
        {"value": "on_demand_credits", "label": "On-Demand Credits"}
    ]
}
```

**When to Use:**
- Populate custom pricing form dropdowns
- Validate form selections
- Dynamic form generation

---

### 14. Stripe Webhook

**Endpoint:** `POST /api/transactions/stripe/webhook/`

**Description:** Handles Stripe webhook events for payment and subscription updates.

**Authentication:** Stripe signature verification (not JWT)

**Headers:**
- `Stripe-Signature`: Webhook signature for verification

**Request Body:** Stripe webhook event payload

**Success Response (200 OK):**
```json
{
    "received": true
}
```

**When to Use:**
- Automatic subscription activation/cancellation
- Payment status updates
- Failed payment notifications
- Subscription renewals

---

## When to Show Pricing Interface

### API Response Indicators

Your frontend should watch for specific API responses that indicate the user needs to upgrade their subscription. Here are the key scenarios:

#### 1. Subscription Required Responses

When any API endpoint returns a `403 Forbidden` or `402 Payment Required` status with subscription-related error messages:

```json
{
    "error": "Premium subscription required for this feature",
    "code": "SUBSCRIPTION_REQUIRED",
    "required_tier": "premium",
    "current_tier": "basic",
    "upgrade_url": "/pricing"
}
```

```json
{
    "error": "Daily limit exceeded. Upgrade to continue.",
    "code": "DAILY_LIMIT_EXCEEDED",
    "current_usage": 5,
    "limit": 5,
    "required_tier": "standard"
}
```

#### 2. Feature Access Checks

Before showing premium features, check subscription status:

```javascript
const checkFeatureAccess = async (feature, jwtToken) => {
    try {
        const response = await fetch(`/api/transactions/subscription-status/${userId}/`, {
            headers: { 'Authorization': `Bearer ${jwtToken}` }
        });
        
        const status = await response.json();
        
        // Show pricing modal for premium features
        if (feature === 'resume_enhancement' && status.tier !== 'premium') {
            return {
                showPricing: true,
                reason: 'Resume enhancement requires Premium subscription',
                currentTier: status.tier || 'basic',
                requiredTier: 'premium'
            };
        }
        
        if (feature === 'unlimited_actions' && status.tier === 'basic') {
            return {
                showPricing: true,
                reason: 'Unlimited actions require Standard or Premium subscription',
                currentTier: 'basic',
                requiredTier: 'standard'
            };
        }
        
        return { showPricing: false };
        
    } catch (error) {
        console.error('Error checking feature access:', error);
        return { showPricing: false };
    }
};
```

#### 3. Usage Limit Responses

When APIs return usage limit information:

```json
{
    "success": true,
    "data": {...},
    "usage_info": {
        "daily_actions_used": 4,
        "daily_actions_limit": 5,
        "tier": "basic",
        "warning": "You have 1 action remaining today. Upgrade for unlimited actions."
    }
}
```

#### 4. Specific Feature Triggers

**Resume Enhancement:**
```javascript
// When user tries to enhance resume without premium
const enhanceResume = async (jobId, file, jwtToken) => {
    const response = await fetch(`/api/resume/enhance-resume/${jobId}/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${jwtToken}` },
        body: formData
    });
    
    if (response.status === 403) {
        const error = await response.json();
        if (error.code === 'SUBSCRIPTION_REQUIRED') {
            // Show pricing modal
            showPricingModal({
                feature: 'Resume Enhancement',
                description: 'Get AI-powered resume optimization',
                requiredTier: 'premium',
                currentTier: error.current_tier
            });
        }
    }
};
```

**Top Applicant Status:**
```javascript
// When user tries to apply as top applicant
const applyAsTopApplicant = async (jobId, jwtToken) => {
    const response = await fetch(`/api/job/apply-top-applicant/${jobId}/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${jwtToken}` }
    });
    
    if (response.status === 402) {
        showPricingModal({
            feature: 'Top Applicant Status',
            description: 'Stand out with premium application status',
            requiredTier: 'premium'
        });
    }
};
```

#### 5. Proactive Upgrade Prompts

Show pricing interface proactively when users approach limits:

```javascript
const checkUsageLimits = async (jwtToken) => {
    const response = await fetch('/api/users/usage-stats/', {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
    });
    
    const usage = await response.json();
    
    // Show upgrade prompt when approaching limits
    if (usage.daily_actions_used >= usage.daily_actions_limit * 0.8) {
        showUpgradePrompt({
            message: `You've used ${usage.daily_actions_used} of ${usage.daily_actions_limit} daily actions`,
            ctaText: 'Upgrade for unlimited actions'
        });
    }
};
```

#### 6. Pricing Modal Implementation

```javascript
const showPricingModal = (options) => {
    const modal = {
        title: `Upgrade Required: ${options.feature}`,
        description: options.description,
        currentPlan: options.currentTier || 'Basic (Free)',
        recommendedPlan: options.requiredTier,
        benefits: getPlanBenefits(options.requiredTier),
        ctaText: `Upgrade to ${options.requiredTier}`,
        onUpgrade: () => redirectToPricing(options.requiredTier)
    };
    
    // Show modal in your UI framework
    displayModal(modal);
};

const getPlanBenefits = (tier) => {
    const benefits = {
        standard: [
            '20 daily actions',
            'Priority support',
            'Advanced job matching'
        ],
        premium: [
            'Unlimited daily actions',
            'AI resume enhancement', 
            'Top applicant status',
            'Priority support',
            'Advanced analytics'
        ]
    };
    
    return benefits[tier] || [];
};
```

### Summary: Trigger Conditions

Show the pricing interface when:

1. **API returns 402/403** with subscription error codes
2. **User clicks premium features** without proper subscription
3. **Daily limits are reached** (show in real-time)
4. **Usage approaches limits** (80% threshold)
5. **User views premium-only pages** without access
6. **Subscription expires** or is cancelled

This ensures users understand exactly when and why they need to upgrade, improving conversion rates and user experience.

---

## Payment Flow Examples

### Subscription Creation Flow

```javascript
// 1. User selects subscription tier
const subscriptionFlow = async (tier, userType, jwtToken) => {
    try {
        // 2. Create Stripe subscription
        const response = await fetch('/api/transactions/stripe-subscribe/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tier, user_type: userType })
        });
        
        const { session_id } = await response.json();
        
        // 3. Redirect to Stripe Checkout
        const stripe = Stripe('pk_test_your_key');
        await stripe.redirectToCheckout({ sessionId: session_id });
        
        // 4. After payment, user is redirected to success page
        // 5. Webhook activates subscription automatically
        
    } catch (error) {
        console.error('Subscription creation failed:', error);
    }
};
```

### Payment Status Check Flow

```javascript
// Check subscription status before showing premium features
const checkFeatureAccess = async (userId, jwtToken) => {
    const response = await fetch(`/api/transactions/subscription-status/${userId}/`, {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
    });
    
    const status = await response.json();
    
    if (status.has_active_subscription && status.tier === 'premium') {
        // Show premium features
        showResumeEnhancer();
        showTopApplicantStatus();
    } else {
        // Show upgrade prompt
        showUpgradeModal();
    }
};
```

### Transaction History Display

```javascript
const displayBillingHistory = async (jwtToken) => {
    const response = await fetch('/api/transactions/transaction-history/', {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
    });
    
    const transactions = await response.json();
    
    const billingTable = transactions.map(transaction => ({
        date: new Date(transaction.created_at).toLocaleDateString(),
        description: transaction.description,
        amount: `$${transaction.amount}`,
        status: transaction.status,
        method: transaction.payment_method
    }));
    
    // Render billing table in UI
    renderBillingTable(billingTable);
};
```

---

## Error Handling

### Common Error Scenarios

1. **Insufficient Subscription**
   ```json
   {
       "error": "Premium subscription required for this feature",
       "code": "SUBSCRIPTION_REQUIRED",
       "upgrade_url": "/pricing"
   }
   ```

2. **Payment Failed**
   ```json
   {
       "error": "Payment could not be processed",
       "code": "PAYMENT_FAILED",
       "details": "Your card was declined"
   }
   ```

3. **Invalid Subscription Tier**
   ```json
   {
       "error": "Invalid tier or user_type",
       "code": "INVALID_SUBSCRIPTION"
   }
   ```

### Error Handling Example

```javascript
const handlePaymentError = (error) => {
    switch (error.code) {
        case 'SUBSCRIPTION_REQUIRED':
            // Redirect to pricing page
            window.location.href = '/pricing';
            break;
        case 'PAYMENT_FAILED':
            // Show payment retry modal
            showPaymentRetryModal(error.details);
            break;
        case 'INVALID_SUBSCRIPTION':
            // Show error message
            showErrorMessage('Please select a valid subscription plan');
            break;
        default:
            // Generic error handling
            showErrorMessage('An unexpected error occurred');
    }
};
```

---

## Pricing Structure

### Current Stripe Price IDs

| User Type | Tier | Price | Stripe Price ID |
|-----------|------|-------|----------------|
| Job Seeker | Standard | $9.99/month | `price_1SAHjJIpeZXn8z8uaSM9AQQR` |
| Job Seeker | Premium | $19.99/month | `price_1SAHmEIpeZXn8z8uueCFNMCz` |
| Recruiter | Standard | $29.99/month | `price_1SAHo5IpeZXn8z8ukstDPUsJ` |
| Recruiter | Premium | $49.99/month | `price_1SAHosIpeZXn8z8uU9PdsQMt` |
| Endorsement | One-time | $4.99 | `price_1SAHrsIpeZXn8z8uqkcGJUru` |

### Feature Matrix

| Feature | Basic | Standard | Premium |
|---------|-------|----------|---------|
| **Job Seekers** |
| Daily Actions | 5 | 20 | Unlimited |
| Resume Enhancement | ❌ | ❌ | ✅ |
| Top Applicant Status | ❌ | ❌ | ✅ |
| **Recruiters** |
| Daily Job Posts | 1 | 5 | 20 |
| AI Job Descriptions | ❌ | ❌ | ✅ |
| Free Endorsements | ❌ | ❌ | ✅ |

---

## Security Considerations

1. **Webhook Security**: All Stripe webhooks are verified using signature validation
2. **Payment Data**: No sensitive payment data is stored in the application
3. **PCI Compliance**: Payments are processed through Stripe's PCI-compliant infrastructure
4. **Authentication**: All endpoints require JWT authentication
5. **Data Encryption**: All payment communications use HTTPS/TLS encryption

---

## Testing

### Test Cards (Stripe)

```javascript
// Successful payment
'4242424242424242'

// Declined payment
'4000000000000002'

// Requires authentication
'4000002500003155'
```

### Test Environment URLs

- **Stripe Dashboard**: https://dashboard.stripe.com/test/
- **Webhook Testing**: Use ngrok or Stripe CLI for local testing

This documentation provides comprehensive information for implementing all payment functionality in your frontend application.
