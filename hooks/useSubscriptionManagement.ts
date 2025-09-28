import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import axios, { AxiosError } from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { 
  SubscriptionStatus, 
  EndorsementStatus, 
  Transaction, 
  CustomPricingInquiry, 
  CustomPricingOptions 
} from '@/types/pricing';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Initialize Stripe with the publishable key as specified by backend developer
const stripePromise = loadStripe('pk_test_51Qp1jhGhd6oP7C9j9VJRInFSl15GCtu5vEwYsHY9D4W5xkx3VmRp5VknrbsMsotcWUVbD77Dj1l1BWyNbZwUW2ms00JGD8wxts');

// Subscription Management Hook
export const useSubscriptionManagement = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // Create Stripe Subscription
  const createSubscription = useMutation({
    mutationFn: async ({ tier, userType }: { tier: 'standard' | 'premium'; userType: 'user' | 'recruiter' }) => {
      const response = await axios.post(
        `${API_URL}/transactions/stripe-subscribe/`,
        { tier, user_type: userType },
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    },
    onSuccess: async (data) => {
      // Redirect to Stripe Checkout using the backend developer's approach
      if (typeof window !== 'undefined' && data.session_id) {
        try {
          // Get Stripe instance using the initialized promise
          const stripe = await stripePromise;
          
          if (stripe) {
            // Redirect to Stripe Checkout
            const { error } = await stripe.redirectToCheckout({
              sessionId: data.session_id
            });

            if (error) {
              console.error('Stripe error:', error);
              toast.error('Payment setup failed. Please try again.');
            }
          } else {
            console.error('Failed to initialize Stripe');
            toast.error('Failed to load payment system. Please try again.');
          }
        } catch (error) {
          console.error('Stripe loading error:', error);
          toast.error('Payment system error. Please try again.');
        }
      } else {
        console.error('No session_id returned from backend');
        toast.error('Payment redirect failed - no session data received');
      }
    },
    onError: (error: AxiosError) => {
      console.error('Subscription creation failed:', error);
      const errorData = error.response?.data as any;
      const errorMessage = errorData?.error || errorData?.message || 'Please try again';
      toast.error('Failed to create subscription', {
        description: errorMessage
      });
    }
  });

  // Cancel Stripe Subscription
  const cancelSubscription = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `${API_URL}/transactions/stripe-cancel/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Subscription cancelled successfully');
      // Invalidate subscription status query
      queryClient.invalidateQueries({ queryKey: ['subscriptionStatus'] });
    },
    onError: (error: AxiosError) => {
      console.error('Subscription cancellation failed:', error);
      const errorData = error.response?.data as any;
      const errorMessage = errorData?.error || errorData?.message || 'Please try again';
      toast.error('Failed to cancel subscription', {
        description: errorMessage
      });
    }
  });

  // Create Endorsement Subscription
  const createEndorsement = useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `${API_URL}/transactions/endorsement-subscribe/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    },
    onSuccess: async (data) => {
      // Redirect to Stripe Checkout for endorsement using the backend developer's approach
      if (typeof window !== 'undefined' && data.session_id) {
        try {
          // Get Stripe instance using the initialized promise
          const stripe = await stripePromise;
          
          if (stripe) {
            // Redirect to Stripe Checkout
            const { error } = await stripe.redirectToCheckout({
              sessionId: data.session_id
            });

            if (error) {
              console.error('Stripe error:', error);
              toast.error('Payment setup failed. Please try again.');
            }
          } else {
            console.error('Failed to initialize Stripe');
            toast.error('Failed to load payment system. Please try again.');
          }
        } catch (error) {
          console.error('Stripe loading error:', error);
          toast.error('Payment system error. Please try again.');
        }
      } else {
        console.error('No session_id returned from backend');
        toast.error('Payment redirect failed - no session data received');
      }
    },
    onError: (error: AxiosError) => {
      console.error('Endorsement creation failed:', error);
      const errorData = error.response?.data as any;
      const errorMessage = errorData?.error || errorData?.message || 'Please try again';
      toast.error('Failed to create endorsement', {
        description: errorMessage
      });
    }
  });

  return {
    createSubscription,
    cancelSubscription,
    createEndorsement
  };
};

// Subscription Status Hook (updated from existing)
export const useSubscriptionStatus = () => {
  const { data: session } = useSession();

  return useQuery<SubscriptionStatus, AxiosError>({
    queryKey: ['subscriptionStatus'],
    queryFn: async (): Promise<SubscriptionStatus> => {
      const response = await axios.get<SubscriptionStatus>(
        `${API_URL}/transactions/subscription-status/${session?.user.id}/`,
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        }
      );
      return response.data;
    },
    enabled: !!session?.user.accessToken && !!session?.user.id,
    staleTime: 1000 * 60 * 10, // 10 minutes - increased to reduce API calls
    gcTime: 1000 * 60 * 30, // 30 minutes - increased cache time
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });
};

// Endorsement Status Hook
export const useEndorsementStatus = () => {
  const { data: session } = useSession();

  return useQuery<EndorsementStatus, AxiosError>({
    queryKey: ['endorsementStatus'],
    queryFn: async (): Promise<EndorsementStatus> => {
      const response = await axios.get<EndorsementStatus>(
        `${API_URL}/transactions/endorsement-subscription-status/`,
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        }
      );
      return response.data;
    },
    enabled: !!session?.user.accessToken,
    staleTime: 1000 * 60 * 10, // 10 minutes - increased to reduce API calls
    gcTime: 1000 * 60 * 30, // 30 minutes - increased cache time
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });
};

// Transaction History Hook
export const useTransactionHistory = () => {
  const { data: session } = useSession();

  return useQuery<Transaction[], AxiosError>({
    queryKey: ['transactionHistory'],
    queryFn: async (): Promise<Transaction[]> => {
      const response = await axios.get<Transaction[]>(
        `${API_URL}/transactions/transaction-history/`,
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        }
      );
      return response.data;
    },
    enabled: !!session?.user.accessToken,
    staleTime: 1000 * 60 * 10, // 10 minutes - increased to reduce API calls
    gcTime: 1000 * 60 * 30, // 30 minutes - increased cache time
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });
};

// Usage Stats Hook
export const useUsageStats = () => {
  const { data: session } = useSession();

  return useQuery<{
    daily_actions_used: number;
    daily_actions_limit: number;
    tier: string;
  }, AxiosError>({
    queryKey: ['usageStats'],
    queryFn: async () => {
      const response = await axios.get(
        `${API_URL}/users/usage-stats/`,
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        }
      );
      return response.data;
    },
    enabled: !!session?.user.accessToken,
    staleTime: 1000 * 60 * 5, // 5 minutes - shorter cache for usage data
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus to get latest usage
    refetchOnMount: true, // Always refetch on mount for usage data
  });
};

// Custom Pricing Hooks
export const useCustomPricingOptions = () => {
  const { data: session } = useSession();

  return useQuery<CustomPricingOptions, AxiosError>({
    queryKey: ['customPricingOptions'],
    queryFn: async (): Promise<CustomPricingOptions> => {
      console.log('Fetching custom pricing options from:', `${API_URL}/transactions/custom-pricing/options/`);
      const response = await axios.get<CustomPricingOptions>(
        `${API_URL}/transactions/custom-pricing/options/`,
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        }
      );
      console.log('Custom pricing options API response:', response.data);
      return response.data;
    },
    enabled: !!session?.user.accessToken,
    staleTime: 1000 * 60 * 30, // 30 minutes (options don't change often)
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

export const useCustomPricingInquiries = () => {
  const { data: session } = useSession();

  return useQuery<CustomPricingInquiry[], AxiosError>({
    queryKey: ['customPricingInquiries'],
    queryFn: async (): Promise<CustomPricingInquiry[]> => {
      const response = await axios.get<CustomPricingInquiry[]>(
        `${API_URL}/transactions/custom-pricing/list/`,
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
          },
        }
      );
      return response.data;
    },
    enabled: !!session?.user.accessToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useCreateCustomPricingInquiry = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inquiry: Omit<CustomPricingInquiry, 'id' | 'status' | 'created_at' | 'updated_at'>) => {
      const response = await axios.post(
        `${API_URL}/transactions/custom-pricing/create/`,
        inquiry,
        {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Custom pricing inquiry submitted successfully', {
        description: 'Our team will contact you within 24 hours'
      });
      // Invalidate inquiries query
      queryClient.invalidateQueries({ queryKey: ['customPricingInquiries'] });
    },
    onError: (error: AxiosError) => {
      console.error('Custom pricing inquiry failed:', error);
      const errorData = error.response?.data as any;
      const errorMessage = errorData?.error || errorData?.message || 'Please try again';
      toast.error('Failed to submit inquiry', {
        description: errorMessage
      });
    }
  });
};

// Utility function to check feature access
export const useFeatureAccess = () => {
  const { data: subscriptionStatus } = useSubscriptionStatus();
  const { data: endorsementStatus } = useEndorsementStatus();

  const checkFeatureAccess = (feature: string) => {
    if (!subscriptionStatus?.has_active_subscription) {
      return {
        hasAccess: false,
        reason: 'Subscription required',
        currentTier: 'basic',
        requiredTier: 'standard'
      };
    }

    switch (feature) {
      case 'resume_enhancement':
        return {
          hasAccess: subscriptionStatus.tier === 'premium',
          reason: subscriptionStatus.tier !== 'premium' ? 'Premium subscription required for resume enhancement' : '',
          currentTier: subscriptionStatus.tier || 'basic',
          requiredTier: 'premium'
        };
      
      case 'top_applicant_status':
        return {
          hasAccess: subscriptionStatus.tier === 'premium',
          reason: subscriptionStatus.tier !== 'premium' ? 'Premium subscription required for top applicant status' : '',
          currentTier: subscriptionStatus.tier || 'basic',
          requiredTier: 'premium'
        };
      
      case 'unlimited_actions':
        return {
          hasAccess: subscriptionStatus.tier === 'premium',
          reason: subscriptionStatus.tier !== 'premium' ? 'Premium subscription required for unlimited actions' : '',
          currentTier: subscriptionStatus.tier || 'basic',
          requiredTier: 'premium'
        };
      
      case 'ai_job_descriptions':
        return {
          hasAccess: subscriptionStatus.tier === 'premium',
          reason: subscriptionStatus.tier !== 'premium' ? 'Premium subscription required for AI job descriptions' : '',
          currentTier: subscriptionStatus.tier || 'basic',
          requiredTier: 'premium'
        };
      
      case 'endorsement':
        return {
          hasAccess: endorsementStatus?.has_endorsement_subscription || false,
          reason: !endorsementStatus?.has_endorsement_subscription ? 'Endorsement subscription required' : '',
          currentTier: 'basic',
          requiredTier: 'endorsement'
        };
      
      default:
        return {
          hasAccess: true,
          reason: '',
          currentTier: subscriptionStatus.tier || 'basic',
          requiredTier: 'basic'
        };
    }
  };

  return { checkFeatureAccess };
};