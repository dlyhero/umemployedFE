"use client"

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { ReactNode, useEffect } from "react"
import { Icon } from "@iconify/react"
import { useUserProfile } from "@/hooks/profile/useUserProfile"

type UserRole = "job_seeker" | "recruiter" | "admin"

interface AuthRouteProps {
    children: ReactNode
    type: "public" | "protected" | "auth"
    role?: UserRole
    redirectTo?: string
}

interface UserSession {
    id?: string
    name?: string
    email?: string
    role?: UserRole
    hasResume?: boolean
    hasCompany?: boolean
}

export default function AuthRoute({
    children,
    type,
    role,
    redirectTo = "/"
}: AuthRouteProps) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const pathname = usePathname()
    const {data} =useUserProfile()

    useEffect(() => {
        if (status === "loading") return

        const user = session?.user as UserSession | undefined
        const currentPath = pathname || redirectTo

        console.log('AuthRoute - session:', session);
        console.log('AuthRoute - user:', user);
        console.log('AuthRoute - status:', status);

        // Protected pages logic
        if (type === "protected" || (type === "auth" && status === "authenticated")) {
            if (status === "unauthenticated") {
                router.replace(`/login?callbackUrl=${encodeURIComponent(currentPath)}`)
                return
            }

            if (!user?.role) {
                console.log("User role missing in session - allowing onboarding", { user, session });
                // If user is on onboarding page, allow them to stay
                if (currentPath.includes('/onboarding')) {
                    return
                }
                // Otherwise redirect to onboarding to set role
                router.replace("/onboarding")
                return
            }

            // Job seeker specific checks
            if (user.role === "job_seeker") {
                if (!user.hasResume && !currentPath.includes("upload-resume")) {
                    router.replace("/applicant/upload-resume")
                    return
                }
                
                if (user.hasResume ) {
                    if(currentPath.includes('upload-resume')){
                        router.replace('/applicant/upload-resume')
                        return
                    }
                    if(currentPath.includes('dashboard')){
                        router.replace('/applicant/dashboard')
                        return
                    }
                }
            }

            // Recruiter specific checks
            if (user.role === "recruiter") {
                if (!user.hasCompany && !currentPath.includes("create")) {
                    router.replace("/companies/create")
                    return
                }

                if (user.hasCompany && currentPath.includes("create")) {
                    router.replace("/companies/dashboard")
                    return
                }
            }

            // Role-based access control
            if (role && user.role !== role) {
                router.replace(redirectTo)
                return
            }
        }
    }, [status, session, router, pathname, type, role, redirectTo])

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center h-screen">
                <Icon
                    icon="svg-spinners:90-ring-with-bg"
                    className="w-12 h-12 text-brand"
                />
            </div>
        )
    }

    // if (type === "auth") {
    //     return status === "unauthenticated" ? <>{children}</> : null
    // }

    return <>{children}</>
}