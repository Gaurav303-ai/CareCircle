import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useAppContext } from './context/AppContext';
import RequireAuth from './components/RequireAuth';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OnboardingPage from './pages/onboarding/OnboardingPage';
import WorkspacePage from './pages/app/WorkspacePage';

function DemoEntry() {
  const { dispatch } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch({ type: 'LOGIN', payload: { id: 'demo-family', name: 'Priya Sharma', email: 'priya@example.com', role: 'family' } });
    navigate('/app/dashboard', { replace: true });
  }, [dispatch, navigate]);

  return <main className="loading-view" role="status">Opening the CareCircle interactive demo…</main>;
}

export default function App() {
  const { state } = useAppContext();

  useEffect(() => {
    document.documentElement.lang = state.preference.language;
  }, [state.preference.language]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/demo" element={<DemoEntry />} />
          <Route path="/onboarding/join" element={<OnboardingPage initialStep="join" />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route path="/onboarding/role" element={<OnboardingPage initialStep="role" />} />
          <Route path="/onboarding/profile" element={<OnboardingPage initialStep="profile" />} />
          <Route path="/onboarding/invite" element={<OnboardingPage initialStep="invite" />} />
          <Route path="/onboarding/complete" element={<OnboardingPage initialStep="complete" />} />
          <Route element={<DashboardLayout />}>
            <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
            <Route path="/app/:section" element={<WorkspacePage />} />
            <Route path="/app/medications/:medicationId" element={<WorkspacePage />} />
            <Route path="/app/appointments/:appointmentId" element={<WorkspacePage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
