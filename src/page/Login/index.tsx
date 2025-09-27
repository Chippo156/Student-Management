import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { doLoginAction } from '../../redux/UserSlice';
import { authService } from '../../service/authService';
import './login.scss';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setLoading(true);
      setError('');
      
      try {
        const response = await authService.login({ email, password });
        
        if (response.data && response.data.result) {
          const { token, user } = response.data.result;
          
          // Dispatch login action
          dispatch(doLoginAction({
            access_token: token,
            refresh_token: '',
            username: user.username,
            image: user.image || '',
            role: user.role.toString(),
            userId: user.id
          }));

          // Redirect based on role
          switch (parseInt(user.role.toString())) {
            case 1: // Admin
              navigate('/admin');
              break;
            case 2: // Giảng viên
              navigate('/teacher');
              break;
            case 3: // Sinh viên
              navigate('/student');
              break;
            default:
              navigate('/');
          }
        } else {
          setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
        }
      } catch (error) {
        console.error('Login error:', error);
        setError('Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Đăng nhập</h2>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            placeholder="Nhập email của bạn"
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
            disabled={loading}
            placeholder="Nhập mật khẩu"
          />
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
            />
            Ghi nhớ đăng nhập
          </label>
        </div>

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
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