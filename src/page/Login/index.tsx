import React, { useEffect, useState } from "react";
import { GoogleOutlined, UserOutlined } from "@ant-design/icons";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { Button, Input, Space, notification } from "antd";
import "./login.scss";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../../redux/UserSlice";
import { loginUser, reloadUser } from "../../controller/loginController";
import { RootState, AppDispatch } from "~/types/api";



const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  const openNotification = (placement: string): void => {
    notification.info({
      message: `Notification ${placement}`,
      description: `Hello, I'm a notification in ${placement}`,
      placement: placement as any,
    });
  };

  const handleLogin = async (): Promise<void> => {
    try {
      const res: any = await loginUser(username, password);
      console.log(res);
      
      if (res && res.code === 1000) {
        localStorage.setItem("token", res.result.token);
        const ress: any = await reloadUser(res.result.token);
        
        if (ress && ress.code === 200) {
          dispatch(login({ user: ress.result }));
        }
        navigate("/");
      } else {
        console.log("Login fail");
        notification.error({
          message: "Login Failed",
          description: res.message || "Invalid username or password",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      notification.error({
        message: "Login Error",
        description: "An error occurred during login",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="login-container">
      <div className="login-container-main">
        <h2>Login</h2>
        <Input
          size="large"
          placeholder="Username"
          prefix={<UserOutlined />}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ width: "100%", marginBottom: "20px" }}
        />
        <Input.Password
          size="large"
          placeholder="Password"
          iconRender={(visible) =>
            visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
          }
          visibilityToggle={{
            visible: passwordVisible,
            onVisibleChange: setPasswordVisible,
          }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ width: "100%", marginBottom: "20px" }}
        />
        <Button
          type="primary"
          block
          style={{ marginTop: "20px" }}
          onClick={handleLogin}
          loading={false} // TODO: Add loading state
        >
          Login
        </Button>
        <div className="login-links">
          <a href="/forgot" className="forgot-password">
            Forgot Password?
          </a>
          <a href="/Register">Register</a>
        </div>
      </div>
    </div>
  );
};

export default Login;