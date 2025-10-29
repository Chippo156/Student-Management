import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { loginUser, clearError } from '../../redux/UserSlice';
import { doLoginAction } from '../../redux/UserSlice';

import './login.scss';
import { userService } from '../../service/userService';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated, account } = useAppSelector(
    (state) => state.user
  );

  // Helper function to get dashboard by role
  const getDashboardByRole = (roleId) => {
    switch (roleId) {
      case 1: // Admin
        return '/admin';
      case 2:
        return '/student';
      case 3:
        return '/teacher';
      default:
        return '/login';
    }
  };

  // Redirect if already authenticated based on role
  useEffect(() => {
    if (isAuthenticated && account && account.role) {
      const dashboard = getDashboardByRole(account.role.roleId);
      console.log(
        'useEffect redirect to:',
        dashboard,
        'role:',
        account.role.roleId
      );
      navigate(dashboard, { replace: true });
    }
  }, [isAuthenticated, account, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (username && password) {
      dispatch(clearError());

      try {
        const result = await dispatch(loginUser({ username, password }));
        if (result.meta.requestStatus === 'fulfilled') {
          const data = await userService.getUserInfo();
          if (data) {
            const token = localStorage.getItem('access_token');
            const refreshToken = localStorage.getItem('refresh_token');
            dispatch(
              doLoginAction({
                token: { accessToken: token, refreshToken },
                user: data,
              })
            );
          }
          const userData = result.payload;
          if (userData?.user?.role?.roleId) {
            const dashboard = getDashboardByRole(userData.user.role.roleId);
            navigate(dashboard, { replace: true });
          }
        } else if (result.meta.requestStatus === 'rejected') {
          console.error('Login rejected:', result.payload);
        }
      } catch (error) {
        console.error('Login error:', error);
      }
    }
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Đăng nhập</h2>

        {error && (
          <div className="error-message">
            <span>{error}</span>
            <button
              type="button"
              onClick={handleClearError}
              className="close-error"
            >
              ×
            </button>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="username">Tên đăng nhập</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading}
            placeholder="Nhập tên đăng nhập"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Mật khẩu</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            placeholder="Nhập mật khẩu"
          />
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
            />
            Ghi nhớ đăng nhập
          </label>
        </div>

        <button type="submit" className="login-btn" disabled={isLoading}>
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
};

export default Login;
