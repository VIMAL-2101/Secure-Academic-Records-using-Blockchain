import { useState } from "react";
import api from "../api";
export default function Login({ setUser }) {
  const [regNo, setRegNo]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
  setError("");

  if (!regNo || !password) {
    setError("Enter both fields");
    return;
  }

  setLoading(true);

  try {
    const res = await api.post("/login", {
      registration_number: Number(regNo),
      password,
    });

    localStorage.setItem("token", res.data.access_token);
    const me = await api.get("/me");
    setUser(me.data);
  } catch (err) {
    console.error(err);
    setError("Login failed");
  } finally {
    setLoading(false);
  }
};
  const handleKey = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div style={page}>
      <div style={card}>

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={logo}>C</div>
          <h2 style={{ margin: "10px 0 4px", fontSize: 22, fontWeight: 600 }}>
            Compliance System
          </h2>
          <p style={{ margin: 0, color: "#888", fontSize: 13 }}>
            Blockchain-backed audit platform
          </p>
        </div>

        {error && (
          <div style={errorBox}>
            {error}
          </div>
        )}

        <label style={label}>Registration Number</label>
        <input
          style={input}
          placeholder="registation num"
          value={regNo}
          onChange={(e) => setRegNo(e.target.value)}
          onKeyDown={handleKey}
          autoFocus
        />

        <label style={{ ...label, marginTop: 14 }}>Password</label>
        <input
          type="password"
          style={input}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKey}
        />

        <button
          style={{ ...btn, opacity: loading ? 0.7 : 1 }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p style={{ textAlign: "center", color: "#555", fontSize: 12, marginTop: 20 }}>
          Role-based access · JWT secured · Blockchain audited
        </p>
      </div>
    </div>
  );
}

const page = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#0d1117",
};

const card = {
  background: "#161b22",
  border: "1px solid #30363d",
  padding: "36px 32px",
  borderRadius: 14,
  width: 340,
  color: "white",
};

const logo = {
  width: 48,
  height: 48,
  borderRadius: "50%",
  background: "#4CAF50",
  color: "white",
  fontSize: 22,
  fontWeight: 700,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto",
};

const errorBox = {
  background: "#3a1b1b",
  border: "1px solid #e53935",
  color: "#ef9a9a",
  padding: "10px 14px",
  borderRadius: 8,
  fontSize: 13,
  marginBottom: 16,
};

const label = {
  display: "block",
  fontSize: 12,
  color: "#8b949e",
  marginBottom: 6,
  letterSpacing: "0.3px",
};

const input = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #30363d",
  background: "#0d1117",
  color: "white",
  fontSize: 14,
  boxSizing: "border-box",
  outline: "none",
};

const btn = {
  width: "100%",
  marginTop: 22,
  padding: "11px",
  borderRadius: 8,
  border: "none",
  background: "#4CAF50",
  color: "white",
  fontWeight: 600,
  fontSize: 15,
  cursor: "pointer",
  letterSpacing: "0.3px",
};
