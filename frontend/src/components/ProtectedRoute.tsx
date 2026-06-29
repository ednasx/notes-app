import { Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import Spinner from "@/components/Spinner"
import type { ReactNode } from "react"

interface ProtectedRouteProps {
    children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth()

    // State 1: still checking (silent restore in flight) -> wait, decide nothing
    if (isLoading) {
        return <Spinner />
    }

    // State 3: logged out -> bounce to login
    if (!user) {
        return <Navigate to="/login" replace />
    }

    // State 2: logged in -> let them through
    return <>{children}</>
}