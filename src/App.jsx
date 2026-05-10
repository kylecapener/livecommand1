import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import NavBar from './components/NavBar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Schedule from './pages/Schedule'
import Dashboard from './pages/Dashboard'
import Creators from './pages/Creators'
import Requests from './pages/Requests'

function ProtectedRoute({ children }) {
  const { user } = useApp()
  return user ? children : <Navigate to="/login" replace />
}

function HomeRedirect() {
  const { user } = useApp()
  return <Navigate to={user ? '/dashboard' : '/battles'} replace />
}

function AppRoutes() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/battles" element={<Schedule />} />
        <Route path="/schedule" element={<Navigate to="/battles" replace />} />
        <Route path="/creators" element={<Creators />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/invites" element={
          <ProtectedRoute><Requests /></ProtectedRoute>
        } />
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  )
}
