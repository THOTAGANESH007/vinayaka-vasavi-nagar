import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Events from './pages/Events'
import Media from './pages/Media'
import Coordinators from './pages/Coordinators'
import NotFound from './pages/NotFound'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminCountdown from './pages/admin/AdminCountdown'
import AdminEvents from './pages/admin/AdminEvents'
import AdminMedia from './pages/admin/AdminMedia'
import AdminCoordinators from './pages/admin/AdminCoordinators'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/events" element={<Events />} />
        <Route path="/media" element={<Media />} />
        <Route path="/coordinators" element={<Coordinators />} />

        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/countdown" element={<AdminCountdown />} />
          <Route path="/admin/events" element={<AdminEvents />} />
          <Route path="/admin/media" element={<AdminMedia />} />
          <Route path="/admin/coordinators" element={<AdminCoordinators />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
