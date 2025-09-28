import { Icon } from '@iconify/react/dist/iconify.js'
import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

function GoogleAuth() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleGoogleSignIn = async () => {
        try {
            setIsLoading(true)
            
            const result = await signIn('google', {
                redirect: false,
                callbackUrl: '/onboarding' // This will be handled by the callback logic in auth.ts
            })

            if (result?.error) {
                console.error('Google sign-in error:', result.error);
                toast.error('Google sign-in failed. Please try again.');
            } else if (result?.ok) {
                toast.success('Successfully signed in with Google!');
                
                // Wait a moment for the session to be updated, then redirect intelligently
                setTimeout(() => {
                    // Check if we can access the session data
                    // If not available immediately, redirect to onboarding as fallback
                    router.push('/onboarding');
                }, 100);
            }
        } catch (error) {
            console.error('Google sign-in error:', error);
            toast.error('An error occurred during Google sign-in. Please try again.');
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="social-auth">
            <button 
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className={`w-full rounded-full border border-gray-300 p-3.5 flex justify-center gap-3 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                {isLoading ? (
                    <Icon icon="svg-spinners:90-ring-with-bg" width="20" height="20" />
                ) : (
                    <Icon icon="flat-color-icons:google" width="20" height="20" />
                )}
                {isLoading ? 'Signing in...' : 'Sign in with Google'}
            </button>
        </div>
    )
}

export default GoogleAuth