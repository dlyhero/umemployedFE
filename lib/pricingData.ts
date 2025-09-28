import { PricingData, PricingPlan } from '@/types/pricing';

// Note: Stripe price IDs are handled by the backend
// Frontend only needs to send tier and user_type to the API

// Job Seeker Pricing Plans
const jobSeekerPlans: PricingPlan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 0,
    currency: "$",
    period: "month",
    description: "Get started with job searching",
    ctaText: "Get Started",
    userType: "job_seeker",
    features: [
      { id: "basic-1", text: "5 daily job applications", included: true },
      { id: "basic-2", text: "Basic job matching", included: true },
      { id: "basic-3", text: "Profile visibility", included: true },
      { id: "basic-4", text: "Email support", included: true }
    ]
  },
  {
    id: "standard",
    name: "Standard",
    price: 9.99,
    currency: "$",
    period: "month",
    description: "Perfect for active job seekers",
    popular: true,
    ctaText: "Choose Plan",
    userType: "job_seeker",
    features: [
      { id: "standard-1", text: "20 daily job applications", included: true },
      { id: "standard-2", text: "Advanced job matching", included: true },
      { id: "standard-3", text: "Priority support", included: true },
      { id: "standard-4", text: "Application tracking", included: true },
      { id: "standard-5", text: "Cancel anytime", included: true }
    ]
  },
  {
    id: "premium",
    name: "Premium",
    price: 19.99,
    currency: "$",
    period: "month",
    description: "Maximum visibility and features",
    ctaText: "Choose Plan",
    userType: "job_seeker",
    features: [
      { id: "premium-1", text: "Unlimited daily applications", included: true },
      { id: "premium-2", text: "AI resume enhancement", included: true },
      { id: "premium-3", text: "Top applicant status", included: true },
      { id: "premium-4", text: "Advanced analytics", included: true },
      { id: "premium-5", text: "Priority support", included: true },
      { id: "premium-6", text: "Cancel anytime", included: true }
    ]
  }
];

// Recruiter Pricing Plans
const recruiterPlans: PricingPlan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 0,
    currency: "$",
    period: "month",
    description: "Get started with hiring",
    ctaText: "Get Started",
    userType: "recruiter",
    features: [
      { id: "basic-1", text: "1 job post per day", included: true },
      { id: "basic-2", text: "Basic candidate search", included: true },
      { id: "basic-3", text: "Company profile", included: true },
      { id: "basic-4", text: "Email support", included: true }
    ]
  },
  {
    id: "standard",
    name: "Standard",
    price: 29.99,
    currency: "$",
    period: "month",
    description: "Ideal for small hiring teams",
    popular: true,
    ctaText: "Choose Plan",
    userType: "recruiter",
    features: [
      { id: "standard-1", text: "5 job posts per day", included: true },
      { id: "standard-2", text: "Advanced candidate search", included: true },
      { id: "standard-3", text: "Application management", included: true },
      { id: "standard-4", text: "Priority support", included: true },
      { id: "standard-5", text: "Cancel anytime", included: true }
    ]
  },
  {
    id: "premium",
    name: "Premium",
    price: 49.99,
    currency: "$",
    period: "month",
    description: "Advanced tools for large teams",
    ctaText: "Choose Plan",
    userType: "recruiter",
    features: [
      { id: "premium-1", text: "20 job posts per day", included: true },
      { id: "premium-2", text: "AI job descriptions", included: true },
      { id: "premium-3", text: "Free endorsements for candidates", included: true },
      { id: "premium-4", text: "Advanced analytics", included: true },
      { id: "premium-5", text: "Priority support", included: true },
      { id: "premium-6", text: "Cancel anytime", included: true }
    ]
  },
  {
    id: "custom",
    name: "Custom",
    price: 0,
    currency: "Custom",
    period: "custom",
    description: "Tailored solutions for enterprise",
    ctaText: "Contact Sales",
    userType: "recruiter",
    features: [
      { id: "custom-1", text: "Custom job posting limits", included: true },
      { id: "custom-2", text: "AI job descriptions", included: true },
      { id: "custom-3", text: "Free endorsements", included: true },
      { id: "custom-4", text: "Dedicated account manager", included: true },
      { id: "custom-5", text: "Custom integrations", included: true },
      { id: "custom-6", text: "Volume discounts", included: true }
    ]
  }
];

// Function to get pricing data based on user type
export const getPricingData = (userType: 'job_seeker' | 'recruiter'): PricingData => {
  const isJobSeeker = userType === 'job_seeker';
  
  return {
    title: isJobSeeker ? "Simple, Transparent Pricing" : "Hiring Solutions for Every Team",
    description: isJobSeeker 
      ? "Choose the plan that works best for your job search" 
      : "Choose the plan that works best for your hiring needs",
    userType,
    plans: isJobSeeker ? jobSeekerPlans : recruiterPlans
  };
};

// Function to get plan by ID and user type
export const getPlanById = (planId: string, userType: 'job_seeker' | 'recruiter'): PricingPlan | undefined => {
  const plans = userType === 'job_seeker' ? jobSeekerPlans : recruiterPlans;
  return plans.find(plan => plan.id === planId);
};

// Function to check if a plan is available for user type
export const isPlanAvailableForUserType = (planId: string, userType: 'job_seeker' | 'recruiter'): boolean => {
  const plan = getPlanById(planId, userType);
  return plan !== undefined;
};

// Function to get the next tier for upgrade
export const getNextTier = (currentTier: string, userType: 'job_seeker' | 'recruiter'): string | null => {
  const tiers = userType === 'job_seeker' 
    ? ['basic', 'standard', 'premium']
    : ['basic', 'standard', 'premium'];
  
  const currentIndex = tiers.indexOf(currentTier);
  return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
};

// Function to get plan benefits for comparison
export const getPlanComparison = (userType: 'job_seeker' | 'recruiter') => {
  const plans = userType === 'job_seeker' ? jobSeekerPlans : recruiterPlans;
  
  return {
    tiers: plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      currency: plan.currency,
      period: plan.period,
      popular: plan.popular
    })),
    features: plans.reduce((acc, plan) => {
      plan.features.forEach(feature => {
        if (!acc[feature.text]) {
          acc[feature.text] = {};
        }
        acc[feature.text][plan.id] = feature.included;
      });
      return acc;
    }, {} as Record<string, Record<string, boolean>>)
  };
};