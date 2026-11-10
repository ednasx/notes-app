import { useState, useEffect, useRef } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Search } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { getNotesRequest, deleteNoteRequest, type Note } from "@/services/noteService"
import Spinner from "@/components/Spinner"
import { CreateNoteDialog } from "@/components/CreateNoteDialog"
import { EditNoteDialog } from "@/components/EditNoteDialog"
import { NotesSidebar, type TagCount } from "@/components/NotesSidebar"
import { NoteCard } from "@/components/NoteCard"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

function Notes() {
    // A pending delete keeps the note (to restore on undo) and its timer (to cancel)
    interface PendingDelete {
        note: Note
        timerId: ReturnType<typeof setTimeout>
    }

    const { accessToken } = useAuth()

    const [notes, setNotes] = useState<Note[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    // Filters: the tag lives in the URL (?tag=...), the search text in local state 
    const [searchParams] = useSearchParams()
    const activeTag = searchParams.get("tag")
    const [query, setQuery] = useState("")

    // Edit dialog state
    const [editingNote, setEditingNote] = useState<Note | null>(null)
    const [isEditOpen, setIsEditOpen] = useState(false)

    // Keyed by note._id so several deletes can be pending at once, each undoable
    const [pendingDeletes, setPendingDeletes] = useState<Record<string, PendingDelete>>({})

    // A ref keeps the latest pendingDeletes reachable from the cleanup function.
    const pendingDeletesRef = useRef(pendingDeletes)

    // Keep the ref in sync with the latest state - in an effect, not during render
    useEffect(() => {
        pendingDeletesRef.current = pendingDeletes
    }, [pendingDeletes]) // updated every render to stay current

    useEffect(() => {
        let cancelled = false

        async function loadNotes() {
            if (!accessToken) return

            try {
                const { notes } = await getNotesRequest(accessToken)
                if (!cancelled) {
                    setNotes(notes)
                }
            } catch (err) {
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : "Failed to load notes"
                    setError(message)
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false)
                }
            }
        }

        loadNotes()

        return () => {
            cancelled = true
        }
    }, [accessToken])

    // On unmount (navigate away), commit any still-pending deletes immediately.
    useEffect(() => {
        return () => {
            const pending = pendingDeletesRef.current
            for (const noteId of Object.keys(pending)) {
                clearTimeout(pending[noteId].timerId)
                if (accessToken) {
                    deleteNoteRequest(accessToken, noteId).catch(() => {
                        // Nothing to restore - the component is gone
                    })
                }
            }
        }
    }, [accessToken])

    function handleNoteCreated(newNote: Note) {
        // Prepend: list is sorted newest-first, so a new note goes on top
        setNotes((prev) => [newNote, ...prev])
    }

    // Open the edit dialog for a specific note
    function openEditDialog(note: Note) {
        setEditingNote(note)
        setIsEditOpen(true)
    }

    // Swap the updated note into the list, preserving order
    function handleNoteupdated(updatedNote: Note) {
        setNotes((prev) =>
            prev.map((note) => (note._id === updatedNote._id ? updatedNote : note))
        )
    }

    // Commit a pending delete: actually call the backend, then drop it from pending 
    function commitDelete(noteId: string) {
        const pending = pendingDeletesRef.current[noteId]
        if (!pending) return // already handled (undone or committed)

        if (accessToken) {
            deleteNoteRequest(accessToken, noteId).catch(() => {
                // Backend delete failed - restore the note (guarded against duplicates)
                setNotes((current) =>
                    current.some((n) => n._id === pending.note._id)
                        ? current
                        : [pending.note, ...current]
                )
                toast.error("Failed to delete note. It has been restored")
            })
        }

        // Remove from pending (pure updater)
        setPendingDeletes((prev) =>
            Object.fromEntries(Object.entries(prev).filter(([id]) => id !== noteId))
        )
    }

    // Start a delete: optimistically remove from the list, show undo toast, arm timer 
    function handleDeleteNote(note: Note) {
        // 1. Optimistically remove from the visible list 
        setNotes((prev) => prev.filter((n) => n._id !== note._id))

        // 2. Arm a timer that will commit the delete when it expires
        const timerId = setTimeout(() => {
            commitDelete(note._id)
        }, 5000)

        // 3. Record the pending delete (note + timer) so undo can reverse it 
        setPendingDeletes((prev) => ({
            ...prev,
            [note._id]: { note, timerId }
        }))

        // 4. Show the undo toast
        toast("Note deleted", {
            action: {
                label: "Undo",
                onClick: () => handleUndoDelete(note._id),
            },
            duration: 5000,
        })
    }

    // Undo a pending delete: cancel the timer, restore the note, no backend call
    function handleUndoDelete(noteId: string) {
        // Read the pending entry OUTSIDE any updater, using the ref for freshest value
        const pending = pendingDeletesRef.current[noteId]
        if (!pending) return // timer already fired - too late to undo

        clearTimeout(pending.timerId) // stop the scheduled backend delete

        // Restore the note - guarded so a double-invoke cannot duplicate it
        setNotes((current) =>
            current.some((n) => n._id === pending.note._id)
                ? current // already present, don't add again
                : [pending.note, ...current]
        )

        // Remove from pending (pure updater - only computes next state)
        setPendingDeletes((prev) => {
            return Object.fromEntries(
                Object.entries(prev).filter(([id]) => id !== noteId)
            )
        })

    }

    // When the dialog finishes closing, clear the editing target
    function handleEditOpenChange(open: boolean) {
        setIsEditOpen(open)
        if (!open) {
            setEditingNote(null)
        }
    }

    // --- Derived data: recalculated from `notes` on every render (no extra state) ---

    // Count how many notes use each tag: { "dns" -> 1, "kubernetes" -> 3, ... }
    const tagCounts = new Map<string, number>()
    for (const note of notes) {
        for (const tag of note.tags) {
            tagCounts.set(tag, (tagCounts.get(tag) ?? 0 ) + 1)
        }
    }
    const tags: TagCount[] = [...tagCounts]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name))

    // Apply the tag filter and the search text
    const search = query.trim().toLowerCase()
    const visibleNotes = notes.filter((note) => {
        const matchesTag = activeTag === null || note.tags.includes(activeTag)
        const matchesSearch = 
            search === "" ||
            note.title.toLowerCase().includes(search) ||
            note.content.toLowerCase().includes(search)
        return matchesTag && matchesSearch
    })

    if (isLoading) {
        return <Spinner />
    }

    if (error) {
        return (
            <div className="flex min-h-svh items-center justify-center p-4">
                <p role="alert" className="text-destructive">{error}</p>
            </div>
        )
    }

    return (
        <div className="flex min-h-svh flex-col gap-4 bg-background p-4 md:flex-row">
            <NotesSidebar totalNotes={notes.length} tags={tags} activeTag={activeTag}/>
            
            <main className="min-w-0 flex-1 px-1 py-2 md:px-4">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div className="flex flex-col gap-1.5">
                        <nav aria-label="Breadcrumb" className="text-sm font-medium text-muted-foreground">
                            {activeTag === null ? (
                                "Notes"
                            ) : (
                                <>
                                    <Link to="/notes" className="hover:text-foreground hover:underline">
                                        All notes
                                    </Link>
                                    {" > Tag"}
                                </>
                            )}
                        </nav>
                        <h1 className="text-3xl font-extrabold tracking-tight">{activeTag ?? "All notes"}</h1>
                        <p className="text-sm text-muted-foreground">
                            {visibleNotes.length} {visibleNotes.length === 1 ? "note": "notes"}
                        </p>
                    </div>

                    <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                        <label className="flex h-11 flex-1 items-center gap-2 rounded-xl bg-card px-3 text-muted-foreground shadow-sm focus-within:ring-2 focus-within:ring-ring sm:w-60 sm:flex-none">
                            <Search className="size-4 shrink-0" aria-hidden="true" />
                            <input 
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search notes"
                                aria-label="Search notes"
                                className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" 
                            />
                        </label>
                        <CreateNoteDialog onNoteCreated={handleNoteCreated} />
                    </div>
                </div>

                {notes.length === 0 ? (
                    <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-16 text-center">
                        <p className="font-semibold">No notes yet.</p>
                        <p className="text-sm text-muted-foreground">Click "New note" to write your first one.</p>
                    </div>
                ) : visibleNotes.length === 0 ? (
                    <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-16 text-center">
                        <p className="font-semibold">No notes match</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {search !== "" && (
                                <Button variant="outline" className="h-11 rounded-xl" onClick={() => setQuery("")}>
                                    Clear search
                                </Button>
                            )}
                            {activeTag !== null && (
                                <Link
                                    to="/notes"
                                    className="flex h-11 items-center rounded-xl px-4 text-sm font-semibold text-primary hover:underline"
                                >
                                    Show all notes
                                </Link>
                            )}
                        </div>
                    </div>
                ) : (
                    <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {visibleNotes.map((note) => (
                            <li key={note._id}>
                                <NoteCard note={note} onEdit={openEditDialog} onDelete={handleDeleteNote} />
                            </li>
                        ))}
                    </ul>
                )}

                {editingNote && (
                    <EditNoteDialog
                        key={editingNote._id}
                        note={editingNote}
                        open={isEditOpen}
                        onOpenChange={handleEditOpenChange}
                        onNoteUpdated={handleNoteupdated}
                    />
                )}
            </main>
        </div>
    )
}

export default Notes