import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './pages/ngo/DashboardLayout';
import DashboardHome from './pages/ngo/DashboardHome';
import DonorEmailOrganizer from './pages/ngo/DonorEmailOrganizer';
import VolunteerMatcher from './pages/ngo/VolunteerMatcher';
import PostTask from './pages/ngo/PostTask';
import EventSchedulerAI from './pages/ngo/EventSchedulerAI';
import ScanDocument from './pages/ngo/ScanDocument';
import LiveHeatmap from './pages/ngo/LiveHeatmap';
import ManageTasks from './pages/ngo/ManageTasks';

import AuthPage from './pages/AuthPage';
import ProtectedRoute from './auth/ProtectedRoute';
import RoleProtectedRoute from './auth/RoleProtectedRoute';
import VolunteerHome from './pages/volunteer/VolunteerHome';
import VolunteerProfile from './pages/volunteer/VolunteerProfile';
import FindTasks from './pages/volunteer/FindTasks';
import VolunteerEvents from './pages/volunteer/VolunteerEvents';
import ViewTask from './pages/volunteer/ViewTask';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* 
          Layer 1 — ProtectedRoute: any logged-in user can enter the dashboard shell.
          Layer 2 — RoleProtectedRoute: each tool then enforces its own role requirement.
          This avoids the infinite-redirect loop that happens when volunteers are
          bounced back to /dashboard but /dashboard itself rejects them.
        */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>

          <Route index element={<DashboardHome />} />

          {/* ── NGO-only tools ── */}
          <Route path="manage-tasks" element={
            <RoleProtectedRoute allowedRoles={['ngo']}>
              <ManageTasks />
            </RoleProtectedRoute>
          } />
          <Route path="post-task" element={
            <RoleProtectedRoute allowedRoles={['ngo']}>
              <PostTask />
            </RoleProtectedRoute>
          } />
          <Route path="email-organizer" element={
            <RoleProtectedRoute allowedRoles={['ngo']}>
              <DonorEmailOrganizer />
            </RoleProtectedRoute>
          } />
          <Route path="volunteer-matcher" element={
            <RoleProtectedRoute allowedRoles={['ngo']}>
              <VolunteerMatcher />
            </RoleProtectedRoute>
          } />
          <Route path="event-scheduler" element={
            <RoleProtectedRoute allowedRoles={['ngo']}>
              <EventSchedulerAI />
            </RoleProtectedRoute>
          } />
          <Route path="scan-document" element={
            <RoleProtectedRoute allowedRoles={['ngo']}>
              <ScanDocument />
            </RoleProtectedRoute>
          } />
          <Route path="live-map" element={
            <RoleProtectedRoute allowedRoles={['ngo']}>
              <LiveHeatmap />
            </RoleProtectedRoute>
          } />

        </Route>

        {/* Volunteer routes */}
        <Route path="/volunteer" element={
          <RoleProtectedRoute allowedRoles={['volunteer']}>
            <VolunteerHome />
          </RoleProtectedRoute>
        } />
        <Route path="/volunteer/find-tasks" element={
          <RoleProtectedRoute allowedRoles={['volunteer']}>
            <FindTasks />
          </RoleProtectedRoute>
        } />
        <Route path="/volunteer/task/:taskId" element={
          <RoleProtectedRoute allowedRoles={['volunteer']}>
            <ViewTask />
          </RoleProtectedRoute>
        } />
        <Route path="/volunteer/events" element={
          <RoleProtectedRoute allowedRoles={['volunteer']}>
            <VolunteerEvents />
          </RoleProtectedRoute>
        } />
        <Route path="/volunteer/profile" element={
          <RoleProtectedRoute allowedRoles={['volunteer']}>
            <VolunteerProfile />
          </RoleProtectedRoute>
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
