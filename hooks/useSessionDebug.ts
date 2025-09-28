// hooks/useSessionDebug.ts
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

export function useSessionDebug() {
    const { data: session, status, update } = useSession()

    useEffect(() => {
    }, [session, status])

    return { session, status, update }
}