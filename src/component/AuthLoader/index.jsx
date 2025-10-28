import React, { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { doLoginAction, doLogoutAction } from '../../redux/UserSlice';
import { userService } from '../../service/userService';
import { message } from 'antd';

const AuthLoader = ({ children }) => {
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
      if (isAuthenticated && account && account.username) return;
      try {
        const data = await userService.getUserInfo();
        dispatch(
          doLoginAction({
            token: { accessToken: token, refreshToken },
            user: data,
          })
        );
      } catch (err) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        dispatch(doLogoutAction());
        message.error('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
      }
    };

    loadUserFromToken();
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthLoader;
