import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { doLoadUserFromToken } from '../../redux/UserSlice';
import { authService } from '../../service/authService';

interface AuthLoaderProps {
  children: React.ReactNode;
}

const AuthLoader: React.FC<AuthLoaderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: any) => state.user.isAuthenticated);

  useEffect(() => {
    const loadUserFromToken = async () => {
      const token = localStorage.getItem('access_token');
      
      if (token && !isAuthenticated) {
        try {
          // Verify token với backend
          const response = await authService.introspect(token);
          
          if (response.data && response.data.valid) {
            // Token hợp lệ, load thông tin user
            dispatch(doLoadUserFromToken(response.data.user));
          } else {
            // Token không hợp lệ, xóa khỏi localStorage
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
          }
        } catch (error) {
          console.error('Error verifying token:', error);
          // Lỗi xác thực token, xóa khỏi localStorage
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
    };

    loadUserFromToken();
  }, [dispatch, isAuthenticated]);

  return <>{children}</>;
};

export default AuthLoader;