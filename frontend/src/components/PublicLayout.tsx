import { Link, Outlet } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { ThemeToggle } from "@/components/ThemeToggle"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function LogoMark() {
    return (
        <span aria-hidden="true" className="relative inline-block h-[22px] w-[26px]">
            <span className="absolute left-0 top-0 h-1.5 w-3 rounded-t-[3px] bg-primary" />
            <span className="absolute left-0 top-1 h-[18px] w-[26px] rounded-b rounded-tr bg-primary" />
        </span>
    )
}

function SiteNav() {
    const { user } = useAuth()

    return (
        <nav className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-5">
            <Link to="/" className="flex items-center gap-2.5 text-base font-bold"> 
                <LogoMark />
                Notes App
            </Link>

            <div className="flex items-center gap-2 rounded-2xl bg-card p-1.5 shadow-sm">
                <ThemeToggle />
                { user ? (
                    <Link to="/notes" className={cn(buttonVariants(), "h-11 rounded-xl px-4")}>
                        Open my notes
                    </Link>    
                ) : (
                    <>
                        <Link to="/login" className={cn(buttonVariants({ variant: "ghost" }), "h-11 rounded-xl px-4")}>
                            Login
                        </Link>
                        <Link to="/register" className={cn(buttonVariants(), "h-11 rounded-xl px-4")}>
                            Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    )
}

export function PublicLayout() {
    return (
        <div className="flex min-h-svh flex-col overflow-x-clip">
            <SiteNav />
            <main className="flex flex-1 flex-col">
                <Outlet />
            </main>
        </div>
    )
}