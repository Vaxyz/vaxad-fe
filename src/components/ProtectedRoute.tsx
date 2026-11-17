import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import { isTokenExpired } from '../features/auth/tokenUtils';
import type { Role } from '../types/auth';

export default function ProtectedRoute({ allowedRoles }: { allowedRoles?: Role[] }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, accessToken, user } = useAppSelector((state) => state.auth);
  const expired = isAuthenticated && isTokenExpired(accessToken);

  useEffect(() => {
    if (expired) dispatch(logout());
  }, [dispatch, expired]);

  if (!isAuthenticated || expired) return <Navigate to="/" replace />;
  if (allowedRoles && user && !user.roles.some((role) => allowedRoles.includes(role))) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}
