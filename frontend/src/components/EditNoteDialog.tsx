import React, { useState, useRef } from "react"
import { useAuth } from "@/hooks/useAuth"
import { updateNoteRequest, type Note } from "@/services/noteService"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface EditNoteDialogProps {
    note: Note                          // The note being edited (source of pre-fill values)
    open: boolean                       // dialog visibility, CONTROLLED by the parent
    onOpenChange: (open: boolean) => void   // parent's setter for that visibility
    onNoteUpdated: (note: Note) => void     // callback-up: hand the updated note to the parent
}

export function EditNoteDialog({
    note,
    open,
    onOpenChange,
    onNoteUpdated
}: EditNoteDialogProps) {
    const { accessToken } = useAuth()

    // Form fields - initialised from the note prop on mount
    // The parent gives the component a `key=${note._id}`, so switching to a
    // different note REMOUNTS it, which re-runs these useState initialisers 
    // with the new note's values. No syncing effect needed.
    const [title, setTitle] = useState(note.title)
    const [content, setContent] = useState(note.content)
    const [tagsInput, setTagsInput] = useState(note.tags.join(", "))

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")

    const contentRef = useRef<HTMLTextAreaElement>(null)
    const tagsRef = useRef<HTMLInputElement>(null)
    const submitRef = useRef<HTMLButtonElement>(null)

    async function handleSubmit() {
        if (title.trim() === "") {
            setError("Title is required")
            return
        }

        if (!accessToken) {
            setError("You must be logged in.")
            return
        }

        const tags = tagsInput
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag !== "")

        setIsSubmitting(true)
        setError("")

        try {
            const { note: updatedNote } = await updateNoteRequest(accessToken, note._id, {
                title: title.trim(),
                content: content.trim(),
                tags,
            })

            onNoteUpdated(updatedNote) // hand the updated note up to the parent
            onOpenChange(false)        // close the dialog
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to update note"
            setError(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    function handleTitleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter") {
            e.preventDefault()
            contentRef.current?.focus()
        }
    }

    function handleTagsKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter") {
            e.preventDefault()
            submitRef.current?.focus()
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Notes</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-title">Title</Label>
                        <Input
                            id="edit-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={handleTitleKeyDown}
                            placeholder="Note title"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-content">Content</Label>
                        <Textarea
                            id="edit-content"
                            ref={contentRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your note..."
                            rows={5}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-tags">Tags</Label>
                        <Input
                            id="edit-tags"
                            ref={tagsRef}
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                            onKeyDown={handleTagsKeyDown}
                            placeholder="Comma-separated, e.g. work, urgent"
                        />
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>

                <DialogFooter>
                    <Button ref={submitRef} onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}