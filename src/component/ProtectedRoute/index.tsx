import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { doLoadUserFromToken } from '../../redux/UserSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: number[]; // Role IDs: 1=Admin, 2=Teacher, 3=Student
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles = [] }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { isAuthenticated, account } = useAppSelector((state) => state.user);

  // Load user from token on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(doLoadUserFromToken());
    }
  }, [dispatch, isAuthenticated]);

  // If not authenticated, redirect to login
  if (!isAuthenticated || !account) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0) {
    const userRoleId = account.role.roleId;
    
    // If user doesn't have required role, redirect to their dashboard
    if (!allowedRoles.includes(userRoleId)) {
      // Redirect based on user's actual role
      switch (userRoleId) {
        case 1: // Admin
          return <Navigate to="/admin" replace />;
        case 2: // Teacher
          return <Navigate to="/teacher" replace />;
        case 3: // Student
          return <Navigate to="/student" replace />;
        default:
          return <Navigate to="/login" replace />;
      }
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;