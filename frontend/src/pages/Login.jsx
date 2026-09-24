// Auth is now handled via the optional sign-in modal in the Layout header.
// This route redirects to dashboard for any legacy /login links.
import { Navigate } from 'react-router-dom'
export default function Login() {
  return <Navigate to="/dashboard" replace />
}
