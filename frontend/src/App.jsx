import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Dashboard from './components/dashboard/Dashboard';
import GamesList from './components/games/GamesList.jsx';
import GamePage from './components/games/GamePage';
import Leaderboard from './components/leaderboard/Leaderboard';
import UserProfile from './components/profile/UserProfile';
import Layout from './components/layout/Layout';
import { useAuth } from './contexts/AuthContext';
import OrganizerSignup from './components/organizer/OrganizerSignup';
import OrganizerLogin from './components/organizer/OrganizerLogin';
import OrganizerDashboard from './components/organizer/OrganizerDashboard';
import OrganizerClubsList from './components/organizer/OrganizerClubsList';
import OrganizerClubChatWrapper from './components/organizer/OrganizerClubChatWrapper';
import ClubsList from './components/clubs/ClubsList';
import ClubChat from './components/clubs/ClubChat';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { NotificationProvider } from './contexts/NotificationContext';

// Wrapper component to fetch club details and pass to ClubChat
function ClubChatWrapper() {
  const { clubId } = useParams();
  const [clubDetails, setClubDetails] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  React.useEffect(() => {
    const fetchClubDetails = async () => {
      if (!clubId) return;
      try {
        const token = localStorage.getItem('uniplay_token');
        const response = await fetch(`${API_URL}/api/clubs/${clubId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setClubDetails({ name: data.name, icon: data.icon });
        }
      } catch (error) {
        console.error('Error fetching club details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClubDetails();
  }, [clubId]);

  if (loading) return <div className="text-center py-20 text-gray-500">Loading club details...</div>;
  if (!clubDetails) return <div className="text-center py-20 text-red-500">Club not found</div>;

  return <ClubChat clubId={clubId} clubName={clubDetails.name} clubIcon={clubDetails.icon} />;
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function OrganizerProtectedRoute({ children }) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('uniplay_organizer_token') : null;
  return token ? <>{children}</> : <Navigate to="/organizer/login" />;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Organizer routes (public) */}
      <Route path="/organizer/signup" element={<OrganizerSignup />} />
      <Route path="/organizer/login" element={<OrganizerLogin />} />
      {/* Organdfizer dashboard (protected) */}
      <Route path="/organizer/dashboard" element={<OrganizerProtectedRoute><OrganizerDashboard /></OrganizerProtectedRoute>} />
      <Route path="/organizer/clubs" element={<OrganizerProtectedRoute><OrganizerClubsList /></OrganizerProtectedRoute>} />
      <Route path="/organizer/clubs/:clubId" element={<OrganizerProtectedRoute><OrganizerClubChatWrapper /></OrganizerProtectedRoute>} />

      {/* User auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Main app (protected) */}
      {user && (
        <>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard key={user.clubsJoined} />} />
            <Route path="/games" element={<GamesList />} />
            <Route path="/games/:gameId" element={<GamePage />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/clubs" element={<ClubsList />} />
          </Route>
          {/* Club chat route outside Layout for full screen */}
          <Route path="/clubs/:clubId" element={<ClubChatWrapper />} />
        </>
      )}
      {/* Fallbacks */}
      <Route path="*" element={<Navigate to={user ? '/' : '/login'} />} />
    </Routes>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <Router>
        <AuthProvider>
          <AppProvider>
            <NotificationProvider>
              <div className="min-h-screen bg-gray-50">
                <AppRoutes />
              </div>
            </NotificationProvider>
          </AppProvider>
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App; 