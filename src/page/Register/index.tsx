import React, { useState } from "react";
import { UserOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { Button, Input, DatePicker, Radio, Space, notification } from "antd";
import { Link, useNavigate } from "react-router-dom";
import "./register.scss";
import { registerUser } from "../../controller/registerController";
import { Dayjs } from "dayjs";



const Register: React.FC = () => {
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [dob, setDob] = useState<Dayjs | null>(null);
  const [sex, setSex] = useState<string>("");
  const [first_name, setFirstName] = useState<string>("");
  const [last_name, setLastName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const checkAllNotNull = (): boolean => {
    if (
      username &&
      email &&
      password &&
      phone &&
      address &&
      dob &&
      sex &&
      first_name &&
      last_name
    ) {
      return true;
    }
    return false;
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone);
  };

  const handleRegister = async (): Promise<void> => {
    if (!checkAllNotNull()) {
      notification.warning({
        message: "Validation Error",
        description: "Please fill all fields",
      });
      return;
    }

    if (!validateEmail(email)) {
      notification.error({
        message: "Invalid Email",
        description: "Please enter a valid email address",
      });
      return;
    }

    if (!validatePhone(phone)) {
      notification.error({
        message: "Invalid Phone",
        description: "Please enter a valid phone number (10-11 digits)",
      });
      return;
    }

    if (password.length < 6) {
      notification.error({
        message: "Weak Password",
        description: "Password must be at least 6 characters long",
      });
      return;
    }

    setLoading(true);
    try {
      const response: any = await registerUser(
        username,
        password,
        email,
        phone,
        address,
        dob,
        sex,
        first_name,
        last_name
      );

      if (response && response.code === 200) {
        notification.success({
          message: "Registration Successful",
          description: "Your account has been created successfully",
        });
        navigate("/login");
      } else {
        notification.error({
          message: "Registration Failed",
          description: response.message || "An error occurred during registration",
        });
      }
    } catch (error) {
      console.error(error);
      notification.error({
        message: "Registration Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-container-main">
        <h2>Register</h2>
        <Space direction="vertical" style={{ width: "100%" }}>
          <Input
            size="large"
            placeholder="First Name"
            value={first_name}
            onChange={(e) => setFirstName(e.target.value)}
            style={{ width: "100%", marginBottom: "20px" }}
          />
          <Input
            size="large"
            placeholder="Last Name"
            value={last_name}
            onChange={(e) => setLastName(e.target.value)}
            style={{ width: "100%", marginBottom: "20px" }}
          />
          <Radio.Group
            size="large"
            value={sex}
            onChange={(e) => setSex(e.target.value)}
            style={{
              width: "100%",
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Radio value="male" style={{ width: "48%", textAlign: "center" }}>
              Male
            </Radio>
            <Radio value="female" style={{ width: "48%", textAlign: "center" }}>
              Female
            </Radio>
          </Radio.Group>

          <Input
            size="large"
            placeholder="Username"
            prefix={<UserOutlined />}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", marginBottom: "20px" }}
          />
          <Input
            size="large"
            placeholder="Email"
            prefix={<MailOutlined />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

          <Input
            size="large"
            placeholder="Phone"
            prefix={<PhoneOutlined />}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ width: "100%", marginBottom: "20px" }}
          />
          <Input
            size="large"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{ width: "100%", marginBottom: "20px" }}
          />
          <DatePicker
            size="large"
            placeholder="Date of Birth"
            value={dob}
            onChange={(date) => setDob(date)}
            style={{ width: "100%", marginBottom: "20px" }}
          />
        </Space>
        <Button
          type="primary"
          block
          style={{ marginTop: "20px" }}
          onClick={handleRegister}
          loading={loading}
        >
          Register
        </Button>
        <div className="register-links">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;