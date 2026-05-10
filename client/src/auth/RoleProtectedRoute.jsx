import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userData } = useAuth();

  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  // Wait for Firestore data to load so we know their role
  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Secondary Authorization: Do they have the correct role?
  if (!allowedRoles.includes(userData.role)) {
    // If a volunteer tries to access an NGO tool, kick them back to the main dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // If they pass both checks, let them view the page
  return children;
};

export default RoleProtectedRoute;
