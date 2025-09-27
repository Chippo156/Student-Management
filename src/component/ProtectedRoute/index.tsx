import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: number[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles = [] }) => {
  const isAuthenticated = useSelector((state: any) => state.user.isAuthenticated);
  const userRole = useSelector((state: any) => state.user.account.role);

  // Nếu chưa đăng nhập, chuyển hướng đến trang login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có quy định vai trò và vai trò hiện tại không được phép
  if (allowedRoles.length > 0 && !allowedRoles.includes(parseInt(userRole))) {
    // Chuyển hướng đến trang phù hợp theo role
    switch (parseInt(userRole)) {
      case 1: // Admin
        return <Navigate to="/admin" replace />;
      case 2: // Giảng viên
        return <Navigate to="/teacher" replace />;
      case 3: // Sinh viên
        return <Navigate to="/student" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;