import { Navigate } from 'react-router-dom';import { getStoredUser } from '../api';
export default function TravelerRoute({children}){const user=getStoredUser();if(!localStorage.getItem('token'))return <Navigate to="/login" replace/>;if(user?.role!=='traveler')return <Navigate to="/" replace/>;return children}
