"use client"
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import React, { useState, useRef } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import GoogleAuth from '../components/social-auth/GoogleAuth'

// Define role enum separately
const roles = ["applicant", "recruiter"] as const;
type Role = z.infer<typeof roleEnum>;
const roleEnum = z.enum(roles);

// Updated schema with proper enum usage
const signupSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(64, { message: 'Password must be less than 64 characters' }),
  confirmPassword: z.string(),
  role: roleEnum.describe("Please select your role") // Proper enum usage
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Signup() {
  const router = useRouter()
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [userConcern, setUserConcern] = useState('')
  const [gdprConsent, setGdprConsent] = useState(false)
  const [pendingFormData, setPendingFormData] = useState<any>(null)
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const recaptchaRef = useRef<ReCAPTCHA>(null)

  // Set page title
  React.useEffect(() => {
    document.title = 'Sign Up | UmEmployed'
  }, [])
  
  // Focus states for consistent floating label behavior
  const [firstNameFocused, setFirstNameFocused] = useState(false)
  const [lastNameFocused, setLastNameFocused] = useState(false)
  const [usernameFocused, setUsernameFocused] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false)
  
  // Password visibility states
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
    watch,
    getValues
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: "applicant" // Default to applicant
    }
  })

  // Watch form values for floating label behavior
  const firstNameValue = watch('firstName')
  const lastNameValue = watch('lastName')
  const usernameValue = watch('username')
  const emailValue = watch('email')
  const passwordValue = watch('password')
  const confirmPasswordValue = watch('confirmPassword')
  const roleValue = watch('role')

  const { mutate, isPending, error: mutationError } = useMutation({
    mutationKey: ['signup'],
    mutationFn: async (userData: any) => {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/signup/`, {
        first_name: userData.firstName,
        last_name: userData.lastName,
        username: userData.username,
        email: userData.email,
        password: userData.password,
        confirm_password: userData.confirmPassword,
        role: userData.role,
        gdpr_consent: userData.gdprConsent,
        user_concern: userData.userConcern || null,
        recaptcha_token: userData.recaptchaToken
      })
      return response.data
    },
    onSuccess: (data, variables) => {

      if (data.success || data.status === 'success' || data.message?.includes('success')) {
        const emailToUse = data.email || data.user?.email || variables.email;

        if (emailToUse) {
          router.push(`/verify-email?email=${encodeURIComponent(emailToUse)}`);
        } else {
          router.push('/verify-email');
        }
      } else if (data.errors) {
        Object.entries(data.errors).forEach(([field, messages]) => {
          const message = Array.isArray(messages) ? messages[0] : messages
          const fieldMapping: { [key: string]: string } = {
            'first_name': 'firstName',
            'last_name': 'lastName',
            'confirm_password': 'confirmPassword'
          }
          const formField = fieldMapping[field] || field
          setFormError(formField as any, {
            type: 'manual',
            message: message as string
          })
        })
      } else {
        const emailToUse = data.email || data.user?.email || getValues('email');
        if (emailToUse) {
          router.push(`/verify-email?email=${encodeURIComponent(emailToUse)}`);
        } else {
          router.push('/verify-email');
        }
      }
    },
    onError: (error: any) => {
      // Reset reCAPTCHA on error
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
      
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data

        if (errorData && typeof errorData === 'object') {
          let hasFieldErrors = false;
          Object.entries(errorData).forEach(([field, value]) => {
            let message = '';
            if (Array.isArray(value)) {
              if (value.length > 0) {
                if (typeof value[0] === 'object' && value[0] !== null && 'message' in value[0]) {
                  message = (value[0] as { message: string }).message;
                } else if (typeof value[0] === 'string') {
                  message = value[0];
                } else {
                  message = String(value[0]);
                }
              }
            } else if (typeof value === 'string') {
              message = value;
            } else if (typeof value === 'object' && value !== null && 'message' in value) {
              message = (value as { message: string }).message;
            }

            if (message) {
              const fieldMapping: { [key: string]: string } = {
                'first_name': 'firstName',
                'last_name': 'lastName',
                'confirm_password': 'confirmPassword'
              }
              const formField = fieldMapping[field] || field
              if (['firstName', 'lastName', 'username', 'email', 'password', 'confirmPassword', 'role'].includes(formField)) {
                setFormError(formField as any, {
                  type: 'manual',
                  message: message
                });
                hasFieldErrors = true;
              } else {
                setFormError('root', {
                  type: 'manual',
                  message: `${field}: ${message}`
                });
              }
            }
          });

          if (!hasFieldErrors) {
            const errorMessage = Object.entries(errorData)
              .map(([key, value]) => {
                if (Array.isArray(value)) {
                  const msg = value.length > 0 && typeof value[0] === 'object' && value[0] !== null && 'message' in value[0]
                    ? (value[0] as { message: string }).message 
                    : (Array.isArray(value) ? value.join(' ') : String(value));
                  return `${key}: ${msg}`;
                }
                return `${key}: ${String(value)}`;
              })
              .join('\n');

            setFormError('root', {
              type: 'manual',
              message: errorMessage
            });
          }
        } else {
          let errorMessage = "An error occurred during registration";
          if (error.response?.status === 400) {
            errorMessage = "Validation error - please check your inputs";
          } else if (error.response?.status === 409) {
            errorMessage = "User with this email or username already exists";
          } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          }

          setFormError('root', {
            type: 'manual',
            message: errorMessage
          });
        }
      } else if (error.request) {
        setFormError('root', {
          type: 'manual',
          message: 'No response from server - please try again later'
        });
      } else {
        setFormError('root', {
          type: 'manual',
          message: 'An unexpected error occurred'
        });
      }
    }
  })

  const onSubmit = (data: any) => {
    // Check if reCAPTCHA token is available
    if (!recaptchaToken) {
      setFormError('root', {
        type: 'manual',
        message: 'Please complete the reCAPTCHA verification.'
      });
      return;
    }
    
    setPendingFormData({ ...data, recaptchaToken });
    setShowTermsModal(true);
  }

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
    if (errors.root && token) {
      setFormError('root', { type: 'manual', message: undefined }); // Clear error when reCAPTCHA is completed
    }
  }

  const submitWithConsent = () => {

    if (!gdprConsent) {
      alert('Please accept the terms to continue.');
      return;
    }

    if (!pendingFormData) {
      alert('No form data found. Please try again.');
      return;
    }

    const submissionData = {
      ...pendingFormData,
      gdprConsent: true,
      userConcern: userConcern || null
    };


    setShowTermsModal(false);
    setPendingFormData(null);
    setUserConcern('');
    setGdprConsent(false);

    mutate(submissionData);
  }

  return (
    <div className=''>
      <div className='md:max-w-md lg:max-w-lg mx-auto sh'>
        <p className='text-gray-800 text-xl md:text-[26px] mb-6 text-center md:text-nowrap'>
          Create an account with umemployed
        </p>

        <div className="bg-white p-8 md:rounded-lg md:w-[85%] mx-auto md:shadow">
          {errors.root && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
              {errors.root.message as string}
            </div>
          )}

          <GoogleAuth />

          <div className='my-6'>
            <div className='flex items-center gap-3 text-sm text-gray-700'>
              <hr className='flex-1' />
              <p>or sign up with email</p>
              <hr className='flex-1' />
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            {/* Role Selection */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">I am signing up as:*</p>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    {...register('role')}
                    value="applicant"
                    checked={roleValue === 'applicant'}
                    className="h-4 w-4 text-brand focus:ring-brand"
                  />
                  <span className="text-sm text-gray-700">Job Seeker</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    {...register('role')}
                    value="recruiter"
                    checked={roleValue === 'recruiter'}
                    className="h-4 w-4 text-brand focus:ring-brand"
                  />
                  <span className="text-sm text-gray-700">Employer</span>
                </label>
              </div>
              {errors.role && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.role.message as string}
                </p>
              )}
            </div>

            {/* First Name Field */}
            <div className='relative'>
              <label 
                className={`absolute left-4 transition-all duration-200 ${(firstNameFocused || firstNameValue) ?
                  'top-1 text-xs text-brand' :
                  'top-4 text-sm text-gray-500'
                } bg-white px-1`}
                htmlFor="firstName"
              >
                First name*
              </label>
              <input
                {...register('firstName')}
                id="firstName"
                type="text"
                onFocus={() => setFirstNameFocused(true)}
                onBlur={() => setFirstNameFocused(!!firstNameValue)}
                className='w-full border border-gray-300 p-4 rounded outline-none focus:border-brand transition-colors pt-5'
                placeholder=''
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.firstName.message as string}
                </p>
              )}
            </div>

            {/* Last Name Field */}
            <div className='relative'>
              <label 
                className={`absolute left-4 transition-all duration-200 ${(lastNameFocused || lastNameValue) ?
                  'top-1 text-xs text-brand' :
                  'top-4 text-sm text-gray-500'
                } bg-white px-1`}
                htmlFor="lastName"
              >
                Last name*
              </label>
              <input
                {...register('lastName')}
                id="lastName"
                type="text"
                onFocus={() => setLastNameFocused(true)}
                onBlur={() => setLastNameFocused(!!lastNameValue)}
                className='w-full border border-gray-300 p-4 rounded outline-none focus:border-brand transition-colors pt-5'
                placeholder=''
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.lastName.message as string}
                </p>
              )}
            </div>

            {/* Username Field */}
            <div className='relative'>
              <label 
                className={`absolute left-4 transition-all duration-200 ${(usernameFocused || usernameValue) ?
                  'top-1 text-xs text-brand' :
                  'top-4 text-sm text-gray-500'
                } bg-white px-1`}
                htmlFor="username"
              >
                Username*
              </label>
              <input
                {...register('username')}
                id="username"
                type="text"
                onFocus={() => setUsernameFocused(true)}
                onBlur={() => setUsernameFocused(!!usernameValue)}
                className='w-full border border-gray-300 p-4 rounded outline-none focus:border-brand transition-colors pt-5'
                placeholder=''
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.username.message as string}
                </p>
              )}
            </div>

            {/* Email Field */}
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
                placeholder=''
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>
              )}
            </div>

            {/* Password Field */}
            <div className='relative'>
              <label 
                className={`absolute left-4 transition-all duration-200 ${(passwordFocused || passwordValue) ?
                  'top-1 text-xs text-brand' :
                  'top-4 text-sm text-gray-500'
                } bg-white px-1`}
                htmlFor="password"
              >
                Password*
              </label>
              <input
                {...register('password')}
                id="password"
                type={showPassword ? 'text' : 'password'}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(!!passwordValue)}
                className='w-full border border-gray-300 p-4 pr-20 rounded outline-none focus:border-brand transition-colors pt-5'
                placeholder=''
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-brand transition-colors"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message as string}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className='relative'>
              <label 
                className={`absolute left-4 transition-all duration-200 ${(confirmPasswordFocused || confirmPasswordValue) ?
                  'top-1 text-xs text-brand' :
                  'top-4 text-sm text-gray-500'
                } bg-white px-1`}
                htmlFor="confirmPassword"
              >
                Confirm Password*
              </label>
              <input
                {...register('confirmPassword')}
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                onFocus={() => setConfirmPasswordFocused(true)}
                onBlur={() => setConfirmPasswordFocused(!!confirmPasswordValue)}
                className='w-full border border-gray-300 p-4 pr-20 rounded outline-none focus:border-brand transition-colors pt-5'
                placeholder=''
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-brand transition-colors"
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword.message as string}
                </p>
              )}
            </div>

            {/* reCAPTCHA */}
            <div className="flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                onChange={handleRecaptchaChange}
                onExpired={() => setRecaptchaToken(null)}
                onError={() => {
                  setRecaptchaToken(null);
                  setFormError('root', {
                    type: 'manual',
                    message: 'reCAPTCHA verification failed. Please try again.'
                  });
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isPending || !recaptchaToken}
              className={`w-full rounded-full p-3 bg-brand text-white font-semibold hover:bg-brand2 ${(isPending || !recaptchaToken) ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Icon icon="svg-spinners:90-ring-with-bg" width="20" height="20" />
                  Creating account...
                </span>
              ) : (
                'Review Terms & Join'
              )}
            </button>
          </form>

          <div className='mt-8 text-sm text-gray-600 text-center'>
            Already have an account?{' '}
            <Link href={`/login`} className='text-brand font-semibold hover:underline'>
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* GDPR Consent Modal */}
      <Dialog open={showTermsModal} onOpenChange={(open) => !open && setShowTermsModal(false)}>
        <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[90vh] overflow-y-auto p-0">
          <div className="relative">
            {/* Close Button */}
            <button
              onClick={() => setShowTermsModal(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-10"
            >
              <Icon icon="lucide:x" width="16" height="16" />
              <span className="sr-only">Close</span>
            </button>

            {/* Modal Content */}
            <div className="p-6 sm:p-8">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-left pr-8">
                  User Concern & Privacy Notice (GDPR Compliance)
                </DialogTitle>
                <DialogDescription className="text-left pt-2">
                  Your privacy matters to us. Please review before continuing.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 space-y-6 text-sm text-gray-700">
                <p>
                  At UmEmployed, your privacy matters to us. Before you continue, please take a moment to understand how we collect, use, and protect your personal information. This helps us stay transparent and gives you control over your data — as required by the General Data Protection Regulation (GDPR).
                </p>

                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">🔹 Why we collect your data</h4>
                  <p>When you sign up, we may ask for information like your:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Full name</li>
                    <li>Email address</li>
                    <li>Location</li>
                    <li>Job preferences or interests</li>
                  </ul>
                  <p>We use this information to:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Create and manage your account</li>
                    <li>Match you with job opportunities</li>
                    <li>Send important updates or reminders</li>
                    <li>Improve your experience on the platform</li>
                  </ul>
                  <p>We will never sell your data or share it without a valid reason (like if required by law or to deliver a core service).</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">🔹 How your data is protected</h4>
                  <p>We follow strict security practices to make sure your information is stored safely. Only authorized personnel can access your data, and we work to keep our systems secure and up to date.</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">🔹 What you're agreeing to</h4>
                  <p>By signing up:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>You give us permission to collect and use your data as described.</li>
                    <li>You understand that we may contact you with relevant information, unless you choose to opt out.</li>
                    <li>You can change your preferences or withdraw consent anytime through your account settings.</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">🔹 Your privacy rights</h4>
                  <p>You have the right to:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>See what data we hold about you</li>
                    <li>Ask for corrections or deletions</li>
                    <li>Restrict how we use your data</li>
                    <li>File a complaint if you feel your data rights are violated</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p>We believe in open communication. If you have any questions, worries, or concerns about your data, let us know below. Your feedback helps us improve.</p>
                  <label htmlFor="userConcern" className="block text-sm font-medium mt-2 text-gray-900">
                    Do you have a concern about your data? (Optional)
                  </label>
                  <textarea
                    id="userConcern"
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-brand focus:border-brand"
                    placeholder="e.g., 'I'm concerned about how my email is used...'"
                    value={userConcern}
                    onChange={(e) => setUserConcern(e.target.value)}
                  />
                </div>

                <div className="pt-2 space-y-2">
                  <h4 className="font-semibold text-gray-900">Final step – Your agreement</h4>
                  <p>Please confirm that:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>You've read and understood how your data will be handled</li>
                    <li>You agree to our use of your data as outlined above</li>
                    <li>You understand your rights under the GDPR</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer with actions */}
            <div className="border-t border-gray-200 px-6 py-4 sm:flex sm:flex-row-reverse sm:px-8 bg-gray-50 rounded-b-lg">
              <div className="w-full">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="gdprConsent"
                    required
                    className="h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
                    checked={gdprConsent}
                    onChange={(e) => setGdprConsent(e.target.checked)}
                  />
                  <label htmlFor="gdprConsent" className="ml-2 text-sm text-gray-700">
                    I agree to the terms above and give consent for UmEmployed to collect and process my personal data.
                  </label>
                </div>
                <div className="flex flex-col items-end sm:items-center sm:flex-row sm:justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowTermsModal(false)}
                    className="w-full sm:w-auto"
                  >
                    Decline
                  </Button>
                  <Button
                    type="button"
                    className="w-full sm:w-auto bg-brand hover:bg-brand/90"
                    onClick={submitWithConsent}
                    disabled={!gdprConsent}
                  >
                    Accept & Continue
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center sm:text-left">
                  Your privacy is our priority. You can update your choices anytime from your profile settings.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}