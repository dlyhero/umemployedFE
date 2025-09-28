import { PricingPlan, SubscriptionStatus } from '@/types/pricing';
import React from 'react';

interface PricingCardProps {
  plan: PricingPlan;
  isPopular?: boolean;
  currentSubscription?: SubscriptionStatus | null;
  onSelectPlan: (planId: string) => void;
  isLoading?: boolean;
}

function PricingCard({ 
  plan, 
  isPopular = false, 
  currentSubscription, 
  onSelectPlan, 
  isLoading = false 
}: PricingCardProps) {
  const formatPrice = () => {
    if (plan.currency === "Custom") {
      return "Custom";
    }
    return `${plan.currency}${plan.price} /${plan.period}`;
  };

  const getIncludedFeatures = () => {
    return plan.features.filter(feature => feature.included);
  };

  // Determine button state and text
  const getButtonState = () => {
    const hasActiveSubscription = currentSubscription?.has_active_subscription;
    const currentTier = currentSubscription?.tier;
    
    // If this is the current plan
    if (hasActiveSubscription && currentTier === plan.id) {
      return {
        text: "Current Plan",
        disabled: true,
        className: "bg-gray-300 text-gray-600 cursor-not-allowed"
      };
    }
    
    // If user has a higher tier subscription
    if (hasActiveSubscription && currentTier && plan.id !== 'custom' && plan.id !== 'endorsement') {
      const tierOrder = ['basic', 'standard', 'premium'];
      const currentIndex = tierOrder.indexOf(currentTier);
      const planIndex = tierOrder.indexOf(plan.id);
      
      if (currentIndex > planIndex) {
        return {
          text: "Downgrade",
          disabled: false,
          className: "bg-red-500 text-white hover:bg-red-600"
        };
      }
    }
    
    // Default state
    return {
      text: plan.ctaText,
      disabled: isLoading,
      className: isPopular
        ? 'bg-brand3 text-white hover:bg-brand2'
        : 'bg-brand text-white hover:bg-brand3'
    };
  };

  const handleClick = () => {
    if (!isLoading) {
      onSelectPlan(plan.id);
    }
  };

  const buttonState = getButtonState();

  return (
    <div className={`border h-fit rounded-4xl p-8 max-w-sm text-center group transition-all duration-300 ${
      isPopular 
        ? 'border-brand3 bg-blue-50  ' 
        : 'border-gray-300 hover:border-brand3 hover:bg-blue-100/80'
    }`}>
      

      
      {/* Plan Name */}
      <p className='text-lg md:text-[18.5px] text-gray-500 dm-serif tracking-wider '>
        {plan.name}
      </p>
      
      {/* Price Display */}
      <div className='space-x-3 text-brand flex items-end justify-center text-lg mt-4'>
        {plan.currency !== "Custom" && <span className='dm-serif'>{plan.currency}</span>}
        <div className='flex justify-center items-end'>
          <span className={`dm-serif text-4xl md:text-7xl`}>
            {plan.price === 0 ? '0' : plan.price}
          </span>
          {plan.period !== 'custom' && (
            <span className='text-brand3/80 tracking-wider ml-1 text-sm md:text-base'>
              /{plan.period}
            </span>
          )}
        </div>
      </div>
      
      {/* Description */}
      <p className='my-8 text-sm md:text-[16.5px] text-brand'>{plan.description}</p>
      
      {/* Features List */}
      <div className='content my-6 space-y-3 text-sm md:text-[16.5px] text-brand'>
        {getIncludedFeatures().map((feature) => (
          <div key={feature.id} className='flex items-center justify-center space-x-2'>
      
            <span className='text-brand'>{feature.text}</span>
          </div>
        ))}
      </div>
      
      {/* CTA Button */}
      <button 
        onClick={handleClick}
        disabled={buttonState.disabled}
        className={`w-full py-3 rounded-full font-bold tracking-wide transition-colors ${
          buttonState.disabled 
            ? buttonState.className
            : buttonState.className
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : (
          buttonState.text
        )}
      </button>
    </div>
  )
}

export default PricingCard