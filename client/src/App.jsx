import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardLayout from './pages/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import DonorEmailOrganizer from './pages/DonorEmailOrganizer';
import VolunteerMatcher from './pages/VolunteerMatcher';
import GrantAssistant from './pages/GrantAssistant';
import EventSchedulerAI from './pages/EventSchedulerAI';
import ImpactReporter from './pages/ImpactReporter';
import AuthPage from './pages/AuthPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="email-organizer" element={<DonorEmailOrganizer />} />
          <Route path="volunteer-matcher" element={<VolunteerMatcher />} />
          <Route path="event-scheduler" element={<EventSchedulerAI />} />
          <Route path="grant-assistant" element={<GrantAssistant />} />
          <Route path="impact-report" element={<ImpactReporter />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
