import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import Spinner from "@/components/Spinner"
import Landing from "@/pages/Landing"
import Login from "@/pages/Login"
import Register from "@/pages/Register"
import Notes from "@/pages/Notes"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Toaster } from "@/components/ui/sonner"
import { PublicLayout } from "./components/PublicLayout"

function App() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return <Spinner />
  }

  return (
    <>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <Notes />
            </ProtectedRoute>
          } />
        <Route path="*" element={<Navigate to="/notes" replace />} />
      </Routes>
      <Toaster />
    </>
  )
}

export default App