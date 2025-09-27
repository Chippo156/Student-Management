import React, { useState } from "react";
import { notification } from "antd";
import { useNavigate } from "react-router-dom";

interface ResetWithEmailProps {}

const ResetWithEmail: React.FC<ResetWithEmailProps> = () => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendEmail = async (): Promise<void> => {
    if (!email) {
      notification.warning({
        message: "Email Required",
        description: "Please enter your email address",
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

    setLoading(true);
    try {
      // TODO: Implement actual password reset API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      notification.success({
        message: "Email Sent",
        description: `Reset link has been sent to ${email}`,
      });
      
      // Optionally redirect to login after successful reset email
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Failed to send reset email. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSendEmail();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}></div>
      <h2 style={styles.title}>Reset with email</h2>
      <div style={styles.form}>
        <div style={styles.inputContainer}>
          <span style={styles.icon}>📧</span>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={handleEmailChange}
            onKeyPress={handleKeyPress}
            style={styles.input}
            disabled={loading}
          />
        </div>
        <button 
          style={{
            ...styles.button,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer"
          }} 
          onClick={handleSendEmail}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send email"}
        </button>
        <a 
          href="/login" 
          style={styles.link}
          onClick={(e) => {
            e.preventDefault();
            navigate("/login");
          }}
        >
          Back to Login
        </a>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f8f9fa",
  },
  header: {
    marginBottom: "20px",
  },
  logo: {
    width: "100px",
  },
  title: {
    fontSize: "24px",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    maxWidth: "400px",
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  inputContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
    width: "100%",
  },
  icon: {
    fontSize: "20px",
    marginRight: "10px",
  },
  input: {
    flex: 1,
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "16px",
  },
  button: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#ff6600",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    cursor: "pointer",
  },
  link: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#007bff",
    textDecoration: "none",
  },
};

export default ResetWithEmail;