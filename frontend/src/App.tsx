import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import Spinner from "@/components/Spinner"
import Login from "@/pages/Login"
import Register from "@/pages/Register"

function App() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return <Spinner />
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/Register" element={<Register />} />``
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App