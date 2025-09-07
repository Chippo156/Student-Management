import React, { useEffect, useState } from "react";
import { GoogleOutlined, UserOutlined } from "@ant-design/icons";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { Button, Input, Space, notification } from "antd";
import "./login.scss";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../../redux/UserSlice";
import { loginUser, reloadUser } from "../../controller/loginController";
const Login = () => {
  const dispatch = useDispatch();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const openNotification = (placement) => {
    api.info({
      message: `Notification ${placement}`,
      description: `Hello, I'm a notification in ${placement}`,
      placement,
    });
  };
  const handleLogin = async () => {
    let res = await loginUser(username, password);
    console.log(res);
    if (res && res.code === 1000) {
      // openNotification('topRight')
      localStorage.setItem("token", res.result.token);
      let ress = await reloadUser(res.result.token);
      if (ress && ress.code === 200) {
        dispatch(login(ress.result));
      }
      navigate("/");
    } else {
      console.log("Login fail");
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
          style={{ width: "100%", marginBottom: "20px" }}
        />
        <Button
          type="primary"
          block
          style={{ marginTop: "20px" }}
          onClick={handleLogin}
        >
          Login
        </Button>
        <div className="login-links">
          <a href="/forgot" className="forgot-password">
            Forgot Password?
          </a>
          <a href="/Register">Register</a>
        </div>
        <div></div>
      </div>
    </div>
  );
};

export default Login;
