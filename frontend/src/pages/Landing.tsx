import { Link } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const backCard =
    "absolute h-[150px] w-[20px] rounded-2xl border-t-[6px] bg-card shadow-lg [--fan-x:70px] sm:h-[190px] sm:w-[300px] sm:[--fan-x:150px] motion-reduce:animate-none"

function Landing() {
    const { user } = useAuth()

    return (
        <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-7 px-6 pb-16 pt-12 text-center sm:pt-20">
            <div className="relative flex h-[250px] w-full max-w-[640px] items-center justify-center">
                <div aria-hidden="true" className={cn(backCard, "border-t-[#3B6FD9] animate-fan-left")} />
                <div aria-hidden="true" className={cn(backCard, "border-t-[#1F8A7A] animate-fan-right")} />
                <div className="relative flex h-[210px] w-full max-w-[380px] items-center justify-center rounded-2xl border-t-[6px] border-t-primary bg-card shadow-xl">
                    <h1 className="animate-rise text-5xl font-extrabold tracking-tight [animation-delay:500ms] motion-reduce:animate-none sm:text-6xl">
                        Notes App
                    </h1>
                </div>
            </div>

            <p className="animate-rise max-w-[500px] text-lg leading-relaxed text-muted-foreground [animation-delay:700ms] motion-reduce:animate-none">
                Sort what you learn into folders, one per topic. Open a folder, add a
                sub-folder or a note, and keep going.
            </p>

            <div className="animate-rise flex flex-wrap justify-center gap-3 [animation-delay:850ms] motion-reduce:animate-none">
                {user ? (
                    <Link to="/notes" className={cn(buttonVariants(), "h-12 rounded-xl px-6 text-base")}>
                        Open my notes
                    </Link>
                ) : (
                    <>
                        <Link to="/register" className={cn(buttonVariants(), "h-12 rounded-xl px-6 text-base")}>
                            Start your first notes
                        </Link>
                        <Link to="/login" className={cn(buttonVariants({ variant: "outline" }), "h-12 rounded-xl px-6 text-base")}>
                            Log in
                        </Link>
                    </>
                )}
            </div>
        </section>
    )
}

export default Landing
