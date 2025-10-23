import React, { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { doLoginAction, doLogoutAction } from '../../redux/UserSlice';
import { userService } from '../../service/userService';
import { message } from 'antd';

interface AuthLoaderProps {
  children: React.ReactNode;
}

const AuthLoader: React.FC<AuthLoaderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, account } = useAppSelector((state) => state.user);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const loadUserFromToken = async () => {
      const token = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');

      if (!token || !refreshToken) return;

      // Nếu đã có user đầy đủ trong redux thì không fetch lại
      if (isAuthenticated && account && account.username) return;

      try {
        const data = await userService.getUserInfo(); // trả về full data chứa totalCreditsRequired
        // dispatch action để lưu tokens + full user data vào redux (không lưu user vào localStorage)
        dispatch(
          doLoginAction({
            token: { accessToken: token, refreshToken },
            user: data,
          })
        );
      } catch (err) {
        console.error('AuthLoader: failed to load user from token', err);
        // Nếu lỗi (token invalid) -> clear tokens và logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        dispatch(doLogoutAction());
        message.error('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
      }
    };

    loadUserFromToken();
  }, [dispatch, isAuthenticated, account]);

  return <>{children}</>;
};

export default AuthLoader;