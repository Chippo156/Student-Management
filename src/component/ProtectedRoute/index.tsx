import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { doLoadUserFromToken } from "../../redux/UserSlice";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: number; // Role IDs: 1,4=Admin, 2=Teacher, 3=Student
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRole = 0,
}) => {
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
  const userRoleId = account.role.roleId;

  // If user doesn't have required role, redirect to their dashboard
  if (userRoleId !== allowedRole) {
    // Redirect based on user's actual role
    switch (userRoleId) {
      case 1:
        return <Navigate to="/admin" replace />;
      case 2: // Teacher
        return <Navigate to="/student" replace />;
      case 3: // Student
        return <Navigate to="/teacher" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
