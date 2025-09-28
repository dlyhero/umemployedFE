// app/layout.tsx
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import { getServerSession } from "next-auth"
import "./globals.css"
import { Providers } from "@/components/queryClientComponent"
import {Toaster} from 'sonner'
import { authOptions } from "@/lib/auth"

const inter = Inter({ subsets: ["latin"] })

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: {
    default: "UmEmployed - Find Your Dream Job",
    template: "%s | UmEmployed"
  },
  description: "Connect with top employers and find your perfect job match. UmEmployed helps job seekers discover opportunities and companies find the right talent.",
  keywords: ["jobs", "employment", "careers", "hiring", "recruitment", "job search"],
  authors: [{ name: "UmEmployed Team" }],
  creator: "UmEmployed",
  publisher: "UmEmployed",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'UmEmployed - Find Your Dream Job',
    description: 'Connect with top employers and find your perfect job match. UmEmployed helps job seekers discover opportunities and companies find the right talent.',
    siteName: 'UmEmployed',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UmEmployed - Find Your Dream Job',
    description: 'Connect with top employers and find your perfect job match.',
    creator: '@umemployed',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let session = null;
  
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error('Error getting session:', error);
    // Continue without session if there's an error
  }
  
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers session={session}>
          {children}
            <Toaster
              position="top-right"
              richColors
              closeButton
            />
        </Providers>
      </body>
    </html>
  )
}