// The shape of a note as it comes back from the backend
export interface Note {
    _id: string
    title: string
    content: string
    userId: string
    tags: string[]
    createdAt: string
    updatedAt: string
}

// The shape of what we send when creating or updating a note
interface NotePayload {
    title: string
    content: string
    tags: string[]
}

// Shared internal helper: handles method, auth header, optional body, and errors
async function request(
    method: string,
    path: string,
    accessToken: string,
    body?: unknown
) {
    const response = await fetch(path, {
        method,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        // Only attach a body for methods that have one (POST/PUT)
        body: body ? JSON.stringify(body) : undefined,
    })

    // fetch does NOT throw on 4xx/5xx - we must check ourselves
    if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        const message = errorData?.error ?? errorData?.message ?? "Something went wrong. Please try again."
        throw new Error(message)
    }

    return response.json()
}

export function getNotesRequest(accessToken: string) {
    return request("GET", "/api/notes", accessToken)
}

export function getNoteByIdRequest(accessToken: string, id: string) {
    return request("GET", `/api/notes/${id}`, accessToken)
}

export function createNoteRequest(accessToken: string, note: NotePayload) {
    return request("POST", "/api/notes", accessToken, note)
}

export function updateNoteRequest(accessToken: string, id: string, note: NotePayload) {
    return request("PUT", `/api/notes/${id}`, accessToken, note)
}

export function deleteNoteRequest(accessToken: string, id: string) {
    return request("DELETE", `/api/notes/${id}`, accessToken)
}