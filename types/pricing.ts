// types/pricing.ts
export interface PricingFeature {
  id: string;
  text: string;
  included: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: 'month' | 'year' | 'custom';
  description: string;
  popular?: boolean;
  features: PricingFeature[];
  ctaText: string;
  highlighted?: boolean;
  userType: 'job_seeker' | 'recruiter'; // Which user type this plan is for
}

export interface PricingData {
  title: string;
  description?: string;
  plans: PricingPlan[];
  userType: 'job_seeker' | 'recruiter';
}

// Subscription status from backend
export interface SubscriptionStatus {
  has_active_subscription: boolean;
  user_type?: 'job_seeker' | 'recruiter';
  tier?: 'basic' | 'standard' | 'premium';
  started_at?: string;
  ended_at?: string | null;
  daily_actions_used?: number;
  daily_actions_limit?: number;
}

// Endorsement subscription status
export interface EndorsementStatus {
  has_endorsement_subscription: boolean;
  tier?: 'endorsement';
  started_at?: string;
}

// Transaction history
export interface Transaction {
  transaction_id: string;
  amount: number;
  payment_method: 'stripe' | 'paypal';
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  created_at: string;
  description: string;
  candidate?: number | null | {
    id: number;
    username: string;
    full_name: string;
  };
}

// Custom pricing inquiry
export interface CustomPricingInquiry {
  id?: number;
  company_name: string;
  company_size: string;
  contact_name: string;
  work_email: string;
  hiring_volume: string;
  hiring_types: string[];
  budget_range: string;
  billing_option: string;
  additional_requirements?: string;
  status?: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
  admin_notes?: string;
}

// Custom pricing options
export interface CustomPricingOptions {
  company_size_choices: Array<{ value: string; label: string }>;
  hiring_volume_choices: Array<{ value: string; label: string }>;
  hiring_type_choices: Array<{ value: string; label: string }>;
  budget_range_choices: Array<{ value: string; label: string }>;
  billing_option_choices: Array<{ value: string; label: string }>;
}