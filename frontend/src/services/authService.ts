// The shape of what we send to the backend 
interface LoginCredentials {
    email: string
    password: string
}

interface RegisterCredentials {
    name: string
    email: string
    password: string
}

// A reusable helper that wraps fetch and handles the common concerns 
async function request(path: string, body: unknown) {
    const response = await fetch(path, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    })

    // fetch does NOT throw on 4xx/5xx - we must check ourselves
    if (!response.ok) {
        // Try to read the backend's error message; fall back to a generic one
        const errorData = await response.json().catch(() => null)
        const message = errorData?.message || "Something went wrong. Please try again."
        throw new Error(message)
    }

    return response.json()
}

export function loginRequest(credentials: LoginCredentials) {
    return request("/api/auth/login", credentials)
}

export function registerRequest(credentials: RegisterCredentials) {
    return request("/api/auth/register", credentials)
}

export async function refreshRequest() {
    const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include"
    })

    if (!response.ok) {
        throw new Error("Session expired")
    }

    return response.json()
}

export async function meRequest(accessToken: string) {
    const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })

    if (!response.ok) {
        throw new Error("Could not fetch user")
    }

    return response.json()
}