import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Check, Circle } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

const passwordRules: { label: string; test: (pw: string) => boolean }[] = [
    { label: "At least 8 characters", test: (pw) => pw.length >= 8 },
    { label: "One uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
    { label: "One symbol (e.g. ! @ # $)", test: (pw) => /[^A-Za-z0-9\s]/.test(pw) }
]

function Register() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const { register } = useAuth()
    const navigate = useNavigate()

    async function handleSubmit() {
        if (name.trim() === "") {
            setError("Name is required")
            return
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        if (!passwordRules.every((rule) => rule.test(password))) {
            setError("Password does not meet all the requirements.")
            return
        }

        setError("")
        setLoading(true)

        try {
            await register(name.trim(), email, password)
            navigate("/notes")
        } catch (err) {
            const message = err instanceof Error ? err.message : "Registration failed."
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-1 items-center justify-center px-4 pb-16 pt-6">
            <Card className="w-full max-w-sm rounded-2xl border-0 border-t-[6px] border-t-primary shadow-xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-extrabold tracking-tight">Create an account</CardTitle>
                    <CardDescription>
                        Sign up to start your first notes.
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
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                autoComplete="name"
                                placeholder="Jane Doe"
                                className="h-11 rounded-xl"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        
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
                                autoComplete="new-password"
                                className="h-11 rounded-xl"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <ul id="password-rules" className="flex flex-col gap-1.5 pt-1 text-sm">
                                {passwordRules.map((rule) => {
                                    const met = rule.test(password)
                                    return(
                                        <li
                                            key={rule.label}
                                            className={cn(
                                                "flex items-center gap-2 transition-colors",
                                                met ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"
                                            )}
                                        >
                                            {met
                                                ? <Check className="size-4" aria-hidden="true" />
                                                : <Circle className="size-4" aria-hidden="true" />}
                                            {rule.label}
                                            <span className="sr-only">{met ? "(done)" : "(not yet)"}</span>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                className="h-11 rounded-xl"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="h-11 w-full rounded-xl text-base" disabled={loading}>
                            {loading ? "Creating account..." : "Register"}
                        </Button>
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link to="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
                                Login
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}

export default Register