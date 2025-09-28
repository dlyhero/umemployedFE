// lib/auth.ts
import axios from "axios";
import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { JWT } from "next-auth/jwt";

interface BackendUser {
  error?: any;
  user_id: string;
  email: string;
  access_token: string;
  refresh_token: string;
  role: string;
  has_resume: boolean;
  has_company: boolean;
  company_id: string | null;
  is_recruiter: boolean;
  is_applicant: boolean;
}

interface CustomUser extends User {
  accessToken?: string;
  refreshToken?: string;
  role?: string | null;
  hasResume?: boolean;
  hasCompany?: boolean;
  companyId?: string | null;
  userId?: string;
}

interface CustomJWT extends JWT {
  accessToken?: string;
  refreshToken?: string;
  role?: string | null;
  hasResume?: boolean;
  hasCompany?: boolean;
  companyId?: string | null;
  userId?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        // NextAuth expects an 'id' field, but Google provides 'sub'
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        recaptchaToken: { label: "ReCAPTCHA Token", type: "text" }
      },
      async authorize(credentials): Promise<CustomUser | null> {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("MISSING_CREDENTIALS");
          }

          // Temporarily make reCAPTCHA optional for debugging
          if (!credentials?.recaptchaToken) {
            console.warn("No reCAPTCHA token provided - proceeding anyway for debugging");
            // Temporarily comment out to debug basic login
            // throw new Error("RECAPTCHA_REQUIRED");
          }

          console.log('Attempting login with reCAPTCHA token:', {
            email: credentials.email,
            hasRecaptcha: !!credentials.recaptchaToken,
            tokenStart: credentials.recaptchaToken.substring(0, 20) + '...',
            apiUrl: `${process.env.NEXT_PUBLIC_API_URL}/users/login/`
          });

          const response = await axios.post<BackendUser>(
            `${process.env.NEXT_PUBLIC_API_URL}/users/login/`,
            {
              email: credentials.email,
              password: credentials.password,
              recaptchaToken: credentials.recaptchaToken
            },
            {
              validateStatus: function (status) {
                return status < 500; // Don't throw for 4xx errors
              }
            }
          );

          console.log('Login response status:', response.status);
          console.log('Login response data:', response.data);

          if (response.status !== 200) {
            console.error('Login failed with status:', response.status, 'data:', response.data);
            if (response.status === 400) {
              throw new Error('INVALID_CREDENTIALS');
            } else if (response.status === 401) {
              throw new Error("INVALID_CREDENTIALS");
            } else if (response.status === 403) {
              throw new Error("EMAIL_NOT_VERIFIED");
            } else {
              throw new Error("UNKNOWN_ERROR");
            }
          }

          return {
            id: response.data.user_id,
            email: response.data.email,
            name: response.data.email.split("@")[0],
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
            role: ["job_seeker", "recruiter"].includes(response.data.role)
              ? response.data.role
              : null,
            hasResume: response.data.has_resume,
            hasCompany: response.data.has_company,
            companyId: response.data.company_id,
            userId: response.data.user_id
          };
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new Error(
              error.response?.data?.error?.message || "Login failed"
            );
          }
          // Re-throw the error if it's already a custom error from above
          throw error;
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login",
       error: "/error", // Update this line
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      try {
        if (user) {
          const customUser = user as CustomUser;
          
          // If this is a Google OAuth user, we need to call the backend API
          if (user.email && !customUser.accessToken) {
            try {
              console.log('Calling backend for Google user:', user.email);
              const response = await axios.post<BackendUser>(
                `${process.env.NEXT_PUBLIC_API_URL}/users/google-auth/`,
                {
                  email: user.email,
                  name: user.name,
                  google_id: user.id,
                  picture: user.image,
                  first_name: user.name?.split(' ')[0],
                  last_name: user.name?.split(' ').slice(1).join(' ')
                },
                {
                  validateStatus: function (status) {
                    return status < 500;
                  }
                }
              );

              if (response.status === 200) {
                // Determine role based on backend boolean flags, not the role string
                let userRole = null;
                if (response.data.is_recruiter) {
                  userRole = 'recruiter';
                } else if (response.data.is_applicant) {
                  userRole = 'job_seeker';
                }
                // If both are false, userRole remains null (new user needs to choose)
                
                return {
                  ...token,
                  accessToken: response.data.access_token,
                  refreshToken: response.data.refresh_token,
                  role: userRole,
                  hasResume: response.data.has_resume,
                  hasCompany: response.data.has_company,
                  companyId: response.data.company_id,
                  userId: response.data.user_id
                };
              } else {
                console.error('Google auth backend failed:', response.data);
                throw new Error('Google authentication failed');
              }
            } catch (error) {
              console.error('Google auth error:', error);
              throw new Error('Google authentication failed');
            }
          }
          
          return {
            ...token,
            accessToken: customUser.accessToken,
            refreshToken: customUser.refreshToken,
            role: customUser.role || null,
            hasResume: customUser.hasResume,
            hasCompany: customUser.hasCompany || false,
            companyId: customUser.companyId,
            userId: customUser.userId
          };
        }

        // Always fetch fresh user data when we have an access token
        if (token.accessToken) {
          try {
            console.log('JWT callback - fetching user profile data');
            const response = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/users/profile/`,
              {
                headers: {
                  'Authorization': `Bearer ${token.accessToken}`,
                  'Content-Type': 'application/json'
                }
              }
            );

            if (response.status === 200) {
              const profileData = response.data;
              console.log('JWT callback - profile data:', profileData);
              
              // Determine role based on backend data
              let userRole = null;
              if (profileData.is_recruiter) {
                userRole = 'recruiter';
              } else if (profileData.is_applicant) {
                userRole = 'job_seeker';
              }
              // If both are false, userRole remains null (new user needs to choose)
              
              return {
                ...token,
                userId: profileData.id,
                role: userRole,
                hasResume: profileData.has_resume,
                hasCompany: profileData.has_company,
                companyId: profileData.company_id
              };
            }
          } catch (error) {
            console.error('Error fetching user profile data:', error);
          }
        }

        return token;
      } catch (error) {
        console.error('JWT callback error:', error);
        // Return a clean token to prevent cascading errors
        return {
          sub: token.sub,
          email: token.email,
          name: token.name
        };
      }
    },
    async session({ session, token }) {
      try {
        console.log('Session callback - token:', token);
        console.log('Session callback - session:', session);
        
        return {
          ...session,
          user: {
            ...session.user,
            id: token.userId || token.sub,
            accessToken: token.accessToken,
            refreshToken: token.refreshToken,
            role: token.role,
            hasResume: token.hasResume,
            hasCompany: token.hasCompany,
            companyId: token.companyId
          }
        };
      } catch (error) {
        console.error('Session callback error:', error);
        // Return basic session to prevent app crash
        return {
          ...session,
          user: {
            ...session.user
          }
        };
      }
    }
  }
};