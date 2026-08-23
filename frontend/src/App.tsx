import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import Spinner from "@/components/Spinner"
import Login from "@/pages/Login"
import Register from "@/pages/Register"
import Notes from "@/pages/Notes"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Toaster } from "@/components/ui/sonner"

function App() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return <Spinner />
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <Notes />
            </ProtectedRoute>
          } />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/notes" replace />} />
      </Routes>
      <Toaster />
    </>
  )
}

export default App