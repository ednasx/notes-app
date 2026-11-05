import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate()

    async function handleSubmit() {
        setError("")
        setLoading(true)

        try {
            await login(email, password)
            navigate("/notes")
        } catch (err) {
            const message = err instanceof Error ? err.message : "Login failed."
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-1 items-center justify-center px-4 pb-16 pt-6">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl font-extrabold tracking-tight">Welcome back</CardTitle>
                    <CardDescription>
                        Log in to open your folders and notes.
                    </CardDescription>
                </CardHeader>

                <form 
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleSubmit()
                    }} 
                    className="flex flex-col gap-6"
                >
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                className="h-11 rounded-xl"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                className="h-11 rounded-xl"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="h-11 w-full rounded-xl text-base" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
                        </Button>
                        <p className="text-sm text-muted-foreground">
                            Don't have an account?{" "}
                            <Link to="/register" className="font-semibold text-primary underline-offset-4 hover:underline">
                                Register
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}

export default Login