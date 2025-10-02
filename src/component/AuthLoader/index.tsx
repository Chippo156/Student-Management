import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { doLoadUserFromToken } from '../../redux/UserSlice';

interface AuthLoaderProps {
  children: React.ReactNode;
}

const AuthLoader: React.FC<AuthLoaderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, account } = useAppSelector((state) => state.user);

  useEffect(() => {
    const loadUserFromToken = async () => {
      const token = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      const userDataStr = localStorage.getItem('user_data');
      
      // Only load if we have tokens but user is not authenticated
      if (token && refreshToken && userDataStr && !isAuthenticated) {
        try {
          // Load user from localStorage without API call
          dispatch(doLoadUserFromToken());
        } catch (error) {
          console.error('Error loading user from token:', error);
          // Clear invalid data
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');
        }
      }
    };

    loadUserFromToken();
  }, [dispatch, isAuthenticated]);

  return <>{children}</>;
};

export default AuthLoader;