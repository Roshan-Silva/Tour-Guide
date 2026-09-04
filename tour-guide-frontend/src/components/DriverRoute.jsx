import { Navigate } from 'react-router-dom';
import { getStoredUser } from '../api';

export default function DriverRoute({ children }) {
  const user = getStoredUser();
  if (!user) return <Navigate to="/login" replace state={{ from: '/driver' }} />;
  if (user.role !== 'driver') return <Navigate to="/" replace />;
  return children;
}
