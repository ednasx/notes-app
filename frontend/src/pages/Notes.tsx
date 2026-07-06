import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/hooks/useAuth"
import { getNotesRequest, deleteNoteRequest, type Note } from "@/services/noteService"
import Spinner from "@/components/Spinner"
import { CreateNoteDialog } from "@/components/CreateNoteDialog"
import { EditNoteDialog } from "@/components/EditNoteDialog"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
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

    // Edit dialog state
    const [editingNote, setEditingNote] = useState<Note | null>(null)
    const [isEditOpen, setIsEditOpen] = useState(false)

    // Keyed by note._id so serveral deletes can be pending at once, each undoable
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

    if (isLoading) {
        return <Spinner />
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-red-500">{error}</p>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-2xl p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">My Notes</h1>
                <CreateNoteDialog onNoteCreated={handleNoteCreated} />
            </div>

            {notes.length === 0 ? (
                <p className="text-muted-foreground">You don't have any notes yet.</p>
            ) : (
                <ul className="space-y-4">
                    {notes.map((note) => (
                        <li key={note._id} className="rounded-lg border p-4">
                            <div className="flex items-start justify-between gap-2">
                                <h2 className="font-semibold">{note.title}</h2>
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => openEditDialog(note)}
                                        aria-label="Edit Note"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteNote(note)}
                                        aria-label="Delete note"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <p className="text-muted-foreground">{note.content}</p>

                            {note.tags.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {note.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                                        >{tag}</span>
                                    ))}
                                </div>
                            )}
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
        </div>
    )
}

export default Notes