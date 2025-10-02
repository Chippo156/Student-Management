import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { loginUser, clearError } from '../../redux/UserSlice';
import './login.scss';

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated, account } = useAppSelector((state) => state.user);

  // Helper function to get dashboard by role
  const getDashboardByRole = (roleId: number): string => {
    switch (roleId) {
      case 1: // Admin
        return '/admin';
      case 2: // Teacher
        return '/teacher';
      case 3: // Student
        return '/student';
      default:
        return '/login';
    }
  };

  // Redirect if already authenticated based on role
  useEffect(() => {
    if (isAuthenticated && account && account.role) {
      const dashboard = getDashboardByRole(account.role.roleId);
      console.log('useEffect redirect to:', dashboard, 'role:', account.role.roleId);
      navigate(dashboard, { replace: true });
    }
  }, [isAuthenticated, account, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      dispatch(clearError());
      
      try {
        const result = await dispatch(loginUser({ username, password }));
        
        console.log('Login result:', result);
        console.log('Request status:', result.meta.requestStatus);
        
        if (result.meta.requestStatus === 'fulfilled') {
          console.log('Login successful');
          console.log('Payload:', result.payload);
          
          // Get user data from the fulfilled action
          const userData = result.payload;
          
          // Navigate immediately after successful login
          if (userData && userData.user && userData.user.role) {
            const dashboard = getDashboardByRole(userData.user.role.roleId);
            console.log('Immediate navigation to:', dashboard, 'role:', userData.user.role.roleId);
            
            // Use setTimeout to ensure state is updated before navigation
            setTimeout(() => {
              navigate(dashboard, { replace: true });
            }, 100);
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
            <button type="button" onClick={handleClearError} className="close-error">
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

        <div className="login-links">
          <Link to="/forgot">Quên mật khẩu?</Link>
          <span>|</span>
          <Link to="/register">Đăng ký tài khoản</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;