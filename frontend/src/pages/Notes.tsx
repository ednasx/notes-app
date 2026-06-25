import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { getNotesRequest, type Note } from "@/services/noteService"
import Spinner from "@/components/Spinner"
import { CreateNoteDialog } from "@/components/CreateNoteDialog"

function Notes() {
    const { accessToken } = useAuth()

    const [notes, setNotes] = useState<Note[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

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

    function handleNoteCreated(newNote: Note) {
        // Prepend: list is sorted newest-first, so a new note goes on top
        setNotes((prev) => [newNote, ...prev])
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
                            <h2 className="font-semibold">{note.title}</h2>
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
        </div>
    )
}

export default Notes