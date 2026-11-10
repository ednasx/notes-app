import { Link } from "react-router-dom"
import { LogOut, NotebookText } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { ThemeToggle } from "@/components/ThemeToggle"
import { LogoMark } from "@/components/PublicLayout"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { tagColor } from "@/lib/tagColor"

export interface TagCount {
    name: string
    count: number
}

interface NotesSidebarProps {
    totalNotes: number
    tags: TagCount[]
    activeTag: string | null
}

const itemBase = "flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-medium transition-colors"
const itemIdle = "text-muted-foreground hover:bg-secondary hover:text-foreground"
const itemActive = "bg-sidebar-accent font-semibold text-sidebar-accent-foreground"

export function NotesSidebar({ totalNotes, tags, activeTag}: NotesSidebarProps) {
    const { user, logout } = useAuth()

    return(
        <aside className="flex flex-col rounded-2xl bg-sidebar p-4 text-sidebar-foreground shadow-sm md:sticky md:top-4 md:h-[calc(100svh-2rem)] md:w-64 md:shrink-0 md:overflow-y-auto">
            <Link to="/" className="md-4 flex items-center gap-2.5 px-3 pt-1 text-base font-bold">
                <LogoMark />
                Notes App
            </Link>

            <nav aria-label="Notes" className="flex flex-col gap-1">
                <Link 
                    to="/notes"
                    aria-current={activeTag === null ? "page": undefined}
                    className={cn(itemBase, activeTag === null ? itemActive : itemIdle)}
                > 
                    <NotebookText className="size-4" aria-hidden="true" />
                    All notes
                    <span className="ml-auto text-xs tabular-nums">{totalNotes}</span>
                </Link>

                {tags.length > 0 && (
                    <p className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Tags
                    </p>
                )}
                
                {tags.map((tag) => {
                    const isActive = tag.name === activeTag
                    return (
                        <Link
                            key={tag.name}
                            to={`/notes?${new URLSearchParams({ tag: tag.name })}`}
                            aria-current={isActive ? "page" : undefined}
                            className={cn(itemBase, isActive ? itemActive : itemIdle)}
                        >
                            <span
                                aria-hidden="true"
                                className="size-2.5 shrink-0 rounded-[3px]"
                                style={{ backgroundColor: tagColor(tag.name) }}
                            />
                            <span className="truncate">{tag.name}</span>
                            <span className="ml-auto text-xs tabular-nums">{tag.count}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className="mt-auto flex items-center gap-2 border-t pt-4 max-md:mt-4">
                <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold"
                >
                    {user?.name.charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{user?.name}</span>
                <ThemeToggle />
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-11 rounded-xl"
                    aria-label="Log out"
                    onClick={logout}
                >
                    <LogOut />
                </Button>
            </div>
        </aside>
    )
}