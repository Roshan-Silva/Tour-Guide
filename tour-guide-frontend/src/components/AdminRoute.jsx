import { Navigate } from 'react-router-dom';
import { getStoredUser } from '../api';

export default function AdminRoute({ children }) {
  const user = getStoredUser();
  if (!user) return <Navigate to="/login" replace state={{ from: '/admin' }} />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}
