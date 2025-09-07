import React, { useState } from "react";

function ResetWithEmail() {
  const [email, setEmail] = useState("");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSendEmail = () => {
    alert(`Reset link sent to ${email}`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
      </div>
      <h2 style={styles.title}>Reset with email</h2>
      <div style={styles.form}>
        <div style={styles.inputContainer}>
          <span style={styles.icon}>📧</span>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={handleEmailChange}
            style={styles.input}
          />
        </div>
        <button style={styles.button} onClick={handleSendEmail}>
          Send email
        </button>
        <a href="#help" style={styles.link}>
          Get help
        </a>
      </div>
    </div>
  );
}

const styles = {
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
  buttonHover: {
    backgroundColor: "#e65c00",
  },
  link: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#007bff",
    textDecoration: "none",
  },
};

export default ResetWithEmail;
