import React, { useState, useRef } from "react"
import { useAuth } from "@/hooks/useAuth"
import { createNoteRequest, type Note } from "@/services/noteService"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface CreateNoteDialogProps {
    onNoteCreated: (note: Note) => void
}

export function CreateNoteDialog({ onNoteCreated }: CreateNoteDialogProps) {
    const { accessToken } = useAuth()

    const [open, setOpen] = useState(false)

    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [tagsInput, setTagsInput] = useState("")

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")

    const contentRef = useRef<HTMLTextAreaElement>(null)
    const tagsRef = useRef<HTMLInputElement>(null)
    const submitRef = useRef<HTMLButtonElement>(null)

    function resetForm() {
        setTitle("")
        setContent("")
        setTagsInput("")
        setError("")
    }

    async function handleSubmit() {
        // Client-side validation: title is required (backend 400s on empty)
        if (title.trim() === "") {
            setError("Title is required")
            return
        }

        if (!accessToken) {
            setError("You must be logged in")
            return
        }

        // Turn "work, urgent, ideas" into ["work", "urgent", "ideas"]
        const tags = tagsInput
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag !== "")

        setIsSubmitting(true)
        setError("")

        try {
            const { note } = await createNoteRequest(accessToken, {
                title: title.trim(),
                content: content.trim(),
                tags,
            })

            onNoteCreated(note) // hand the new note up to the parent
            resetForm()
            setOpen(false) // close the dialog
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to create note"
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Add Note</Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a new note</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={handleTitleKeyDown}
                            placeholder="Note title"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                            id="content"
                            ref={contentRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your note..."
                            rows={5}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <Input
                            id="tags"
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
                        {isSubmitting ? "Creating..." : "Create Note"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}