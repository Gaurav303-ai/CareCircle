import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';

const RequireAuth: React.FC = () => {
  const { state } = useAppContext();
  const location = useLocation();

  // If no user logged in, redirect to login preserving intended location
  if (!state.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
