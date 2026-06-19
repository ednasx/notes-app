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
        <div className="min-h-svh flex items-center justify-center p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>
                        Enter your credentials to access your notes.
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                    <Button className="w-full" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <Link to="/register" className="underline">
                            Register
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}

export default Login