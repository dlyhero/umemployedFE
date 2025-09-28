// types/next-auth.d.ts
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      accessToken?: string
      refreshToken?: string // Add this line
      role?: string | null
      hasResume?: boolean
      hasCompany?: boolean
      companyId?: string | null
    }
  }

  interface User {
    id: string
    accessToken?: string
    refreshToken?: string // Add this line
    role?: string | null
    hasResume?: boolean
    hasCompany?: boolean
    companyId?: string | null
    userId?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string // Add this line
    role?: string | null
    hasResume?: boolean
    hasCompany?: boolean
    companyId?: string | null
    userId?: string
  }
}