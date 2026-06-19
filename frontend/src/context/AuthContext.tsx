import { createContext, useState, useEffect, type ReactNode } from "react"
import { loginRequest, registerRequest, refreshRequest, meRequest } from "@/services/authService"

// The shape of the user object my backend returns
interface User {
    id: string
    name: string
    email: string
    is_verified: boolean
    created_at: string
}


// The shape of everything the context provides to the app
interface AuthContextType {
    user: User | null
    accessToken: string | null
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (name: string, email: string, password: string) => Promise<void>
    logout: () => void
}


// 1. Create the context. Starts as null until a Provider supplies a value.
const AuthContext = createContext<AuthContextType | null>(null)


// 2. The Provider component - holds the state and supplies it to the tree.
function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [accessToken, setAccessToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let cancelled = false

        async function restoreSession() {
            try {
                const refreshData = await refreshRequest()
                const userData = await meRequest(refreshData.accessToken)

                if (!cancelled) {
                    setUser(userData.user)
                    setAccessToken(refreshData.accessToken)
                }
            } catch {
                // A failed refresh during restore just means "not logged in".
                // User/accessToken already start as null, so we leave them untouched.
                // (Avoids a StrictMode-duplicated 401 wiping a session the other run restored.)
            }
            finally {
                if (!cancelled) {
                    setIsLoading(false)
                }
            }
        }

        restoreSession()

        return () => {
            cancelled = true
        }
    }, [])

    async function login(email: string, password: string) {
        const data = await loginRequest({ email, password })
        setUser(data.user)
        setAccessToken(data.accessToken)
    }

    async function register(name: string, email: string, password: string) {
        const data = await registerRequest({ name, email, password })
        setUser(data.user)
        setAccessToken(data.accessToken)
    }

    function logout() {
        setUser(null)
        setAccessToken(null)
    }

    return (
        <AuthContext.Provider value={{ user, accessToken, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export { AuthContext, AuthProvider }