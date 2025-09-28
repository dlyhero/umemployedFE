// hooks/useAccountTypeUpdate.ts
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { toast } from 'sonner';

export const useAccountTypeUpdate = () => {
    const { data: session, update } = useSession();
    const [isUpdating, setIsUpdating] = useState(false);

    const updateAccountType = async (accountType: 'recruiter' | 'job_seeker') => {
        if (!accountType) {
            toast.error('No account type specified');
            return false;
        }

        setIsUpdating(true);
        
        try {
            
            // Step 1: Call the API to update account type on backend
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/choose-account-type/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.user?.accessToken}`,
                },
                body: JSON.stringify({ account_type: accountType }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update account type');
            }


            // Step 2: Force session refresh to get updated JWT token
            await update();

            toast.success('Account type updated successfully!', {
                description: `You are now registered as a ${accountType === 'job_seeker' ? 'Job Seeker' : 'Recruiter'}`
            });
            
            return true;
            
        } catch (error: any) {
            console.error('❌ Account type update error:', error);
            toast.error(error.message || 'Failed to update account type. Please try again.');
            return false;
        } finally {
            setIsUpdating(false);
        }
    };

    return {
        updateAccountType,
        isUpdating,
        session
    };
};