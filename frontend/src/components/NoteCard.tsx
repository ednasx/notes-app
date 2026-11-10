import { Link } from "react-router-dom"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Note } from "@/services/noteService"
import { tagColor } from "@/lib/tagColor"

interface NoteCardProps {
    note: Note
    onEdit: (note: Note) => void
    onDelete: (note: Note) => void
}

// Created once when the file loads, reused for every card (e.g. "3 Nov 2026")
const dateFormat = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" })

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
    return (
        <article className="flex h-full flex-col gap-3 rounded-2xl bg-card p-5 text-card-foreground shadow-sm">
            <div className="flex items-start gap-1 border-b-2 border-primary/25 pb-3">
                <h2 className="min-w-0 flex-1 break-words pt-2 text-base font-bold leading-snug">
                    {note.title}
                </h2>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-11 rounded-xl"
                    aria-label={`Edit "${note.title}"`}
                    onClick={() => onEdit(note)}
                >
                    <Pencil className="size-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-11 rounded-xl"
                    aria-label={`Delete "${note.title}"`}
                    onClick={() => onDelete(note)}
                >
                    <Trash2 className="size-4" />
                </Button>
            </div>

            {note.content && (
                <p className="line-clamp-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {note.content}
                </p>
            )}

            <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                {note.tags.map((tag) => (
                    <Link 
                        key={tag}
                        to={`/notes?${new URLSearchParams({ tag })}`}
                        className="flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground hover:bg-accent"
                    >
                        <span
                            aria-hidden="true"
                            className="size-2 rounded-full"
                            style={{ backgroundColor: tagColor(tag) }}
                        />
                        {tag}
                    </Link>
                ))}
                <time dateTime={note.updatedAt} className="ml-auto text-xs text-muted-foreground">
                    {dateFormat.format(new Date(note.updatedAt))}
                </time>
            </div>
        </article>
    )
}