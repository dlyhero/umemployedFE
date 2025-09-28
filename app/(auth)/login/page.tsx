"use client"

import { zodResolver } from '@hookform/resolvers/zod'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import ReCAPTCHA from 'react-google-recaptcha'
import GoogleAuth from '../components/social-auth/GoogleAuth'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(64, { message: 'Password must be less than 64 characters' })
})

const getErrorMessage = (error: string): string => {
  switch (error) {
    case 'INVALID_CREDENTIALS':
      return 'Please check your email and password.';
    case 'EMAIL_NOT_VERIFIED':
      return 'Please verify your email address before logging in.';
    case 'NETWORK_ERROR':
      return 'Network connectivity issues. Please check your connection and try again.';
    case 'CredentialsSignin':
      return 'Invalid email or password. Please try again.';
    case 'RECAPTCHA_REQUIRED':
      return 'Please complete the reCAPTCHA verification.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

export default function Signin() {
  const [error, setError] = useState<string | undefined>()
  const [showPassword, setShowPassword] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const router = useRouter()
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting }, 
    watch 
  } = useForm({
    resolver: zodResolver(schema)
  })

  const emailValue = watch('email')
  const passwordValue = watch('password')

  useEffect(() => {
    const urlError = searchParams.get('error')
    if (urlError && !error) {
      setError(getErrorMessage(urlError))
    }
  }, [searchParams, error])

  // Set page title
  useEffect(() => {
    document.title = 'Sign In | UmEmployed'
  }, [])

  // Check session and redirect after login
// Check session and redirect after login
useEffect(() => {
  if (status === 'authenticated' && session?.user) {
    // Use proper property names from your session
    const user = session.user
    
    if (!user.role) {
      return router.push('/onboarding')
    }



    if (user.role === 'job_seeker') {
      router.push(user.hasResume ? '/applicant/dashboard' : '/applicant/upload-resume')
    } 
    else if (user.role === 'recruiter') {
      router.push(user.hasCompany ? '/companies/dashboard' : '/companies/create')
    }
    else {
      router.push('/')
    }
  }
}, [status, session, router])
  const handleVerification = (email: string) => {
    try {
      const verificationUrl = `/verify-email?email=${encodeURIComponent(email)}`
      const newWindow = window.open(verificationUrl, '_blank')

      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        toast.error('Popup was blocked - please allow popups for this site')
        router.push(verificationUrl)
      }
    } catch (error) {
      console.error('Error opening verification:', error)
      toast.error('Could not open verification page')
    }
  }

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      setError(undefined)
      
      // Temporarily make reCAPTCHA optional for debugging
      if (!recaptchaToken) {
        console.warn('No reCAPTCHA token - proceeding anyway for debugging');
        // setError('Please complete the reCAPTCHA verification.')
        // return
      }

      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        recaptchaToken: recaptchaToken,
        redirect: false,
      })

      if (result?.error) {
        if (result.error === 'EMAIL_NOT_VERIFIED') {
          handleVerification(data.email)
          return
        }
        setError(getErrorMessage(result.error))
        // Reset reCAPTCHA on error
        recaptchaRef.current?.reset()
        setRecaptchaToken(null)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred. Please try again.')
      // Reset reCAPTCHA on error
      recaptchaRef.current?.reset()
      setRecaptchaToken(null)
    }
  }

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token)
    if (error && token) {
      setError(undefined) // Clear error when reCAPTCHA is completed
    }
  }

  return (
    <div className=''>
      <div className='md:max-w-[360px] lg:max-w-md mx-auto w-full  '>
        <h1 className='text-2xl  text-gray-800 mb-6 text-center'>Hi, Welcome Back!</h1>
        <div className='bg-white p-8 md:rounded-lg md:w-[90%] mx-auto md:shadow'>

          <GoogleAuth />

          <div className='my-6'>
            <div className='flex items-center gap-3 text-sm text-gray-500'>
              <hr className='flex-1 border-gray-300' />
              <span>or sign in with email</span>
              <hr className='flex-1 border-gray-300' />
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className='relative'>
              <label
                htmlFor="email"
                className={`absolute left-4 transition-all duration-200 ${(emailFocused || emailValue) ?
                  'top-1 text-xs text-brand' :
                  'top-4 text-sm text-gray-500'
                  } bg-white px-1`}
              >
                Email*
              </label>
              <input
                {...register('email')}
                id="email"
                type="email"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(!!emailValue)}
                className='w-full border border-gray-300 p-4 rounded outline-none focus:border-brand transition-colors pt-5'
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>
              )}
            </div>

            <div className='relative'>
              <label
                htmlFor="password"
                className={`absolute left-4 transition-all duration-200 ${(passwordFocused || passwordValue) ?
                  'top-1 text-xs text-brand' :
                  'top-4 text-sm text-gray-500'
                  } bg-white px-1`}
              >
                Password*
              </label>
              <div className='relative'>
                <input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(!!passwordValue)}
                  className='w-full border border-gray-300 p-4 rounded outline-none focus:border-brand transition-colors pt-5'
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700'
                >
                  <Icon
                    icon={showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'}
                    width={20}
                    height={20}
                  />
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>
              )}
            </div>

            {/* reCAPTCHA */}
            <div className="flex w-full justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                onChange={handleRecaptchaChange}
                onExpired={() => setRecaptchaToken(null)}
                onError={(error) => {
                  console.error('reCAPTCHA error:', error)
                  setRecaptchaToken(null)
                  setError('reCAPTCHA verification failed. Please try again.')
                }}
              />
            </div>
 

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full rounded-full p-3 bg-brand hover:bg-brand-dark text-white font-semibold transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            >
              {isSubmitting ? (
                <span className='flex items-center justify-center'>
                  <Icon icon="svg-spinners:90-ring-with-bg" width={24} height={24} />
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className='mt-6 text-center text-sm text-gray-600'>
            New to umemployed?{' '}
            <Link href="/signup" className='text-brand font-semibold hover:underline'>
              Sign up
            </Link>
          </div>

          <div className='mt-3 text-center'>
            <Link
              href="/forgot-password"
              className='text-sm text-brand hover:underline'
            >
              Forgot your password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}