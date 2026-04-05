import { Link, useLocation } from "react-router-dom";

export default function Layout({ children, setUser, user }) {
  const location = useLocation();

  const isStudent = user?.role === "STUDENT";
  const isTeacher = user?.role === "TEACHER";
  const isAdmin   = user?.role === "ADMIN";

  const getBtnStyle = (path) => ({
    ...navBtn,
    background: location.pathname === path ? "#4CAF50" : "#2c2c2c",
  });

  return (
    <div style={container}>
      <div style={sidebar}>
        <h2 style={{ color: "#4CAF50", marginBottom: 10 }}>Compliance</h2>

        <Link to="/dashboard" style={linkStyle}>
          <button style={getBtnStyle("/dashboard")}>🏠 Dashboard</button>
        </Link>

        {isStudent && (
          <>
            <p style={sectionLabel}>ACADEMICS</p>
            <Link to="/profile" style={linkStyle}>
              <button style={getBtnStyle("/profile")}>👤 Profile</button>
            </Link>
            <Link to="/marks" style={linkStyle}>
              <button style={getBtnStyle("/marks")}>📊 My Marks</button>
            </Link>
            <Link to="/attendance" style={linkStyle}>
              <button style={getBtnStyle("/attendance")}>📅 My Attendance</button>
            </Link>
            <Link to="/assignments" style={linkStyle}>
              <button style={getBtnStyle("/assignments")}>📝 Assignments</button>
            </Link>
          </>
        )}

        {isTeacher && (
          <>
            <p style={sectionLabel}>MANAGE</p>
            <Link to="/modify-marks" style={linkStyle}>
              <button style={getBtnStyle("/modify-marks")}>✏️ Modify Marks</button>
            </Link>
            <Link to="/attendance" style={linkStyle}>
              <button style={getBtnStyle("/attendance")}>📅 Update Attendance</button>
            </Link>
            <p style={sectionLabel}>TOOLS</p>
            <Link to="/logs" style={linkStyle}>
              <button style={getBtnStyle("/logs")}>📋 Audit Logs</button>
            </Link>
            <Link to="/verify" style={linkStyle}>
              <button style={getBtnStyle("/verify")}>🔍 Verify</button>
            </Link>
          </>
        )}

        {isAdmin && (
          <>
            <p style={sectionLabel}>MANAGE</p>
            <Link to="/modify-marks" style={linkStyle}>
              <button style={getBtnStyle("/modify-marks")}>✏️ Modify Marks</button>
            </Link>
            <Link to="/attendance" style={linkStyle}>
              <button style={getBtnStyle("/attendance")}>📅 Update Attendance</button>
            </Link>
            <Link to="/approve" style={linkStyle}>
              <button style={getBtnStyle("/approve")}>✅ Approve Results</button>
            </Link>
            <Link to="/admin" style={linkStyle}>
              <button style={getBtnStyle("/admin")}>➕ Add Users</button>
            </Link>
            <p style={sectionLabel}>TOOLS</p>
            <Link to="/logs" style={linkStyle}>
              <button style={getBtnStyle("/logs")}>📋 Audit Logs</button>
            </Link>
            <Link to="/verify" style={linkStyle}>
              <button style={getBtnStyle("/verify")}>🔍 Verify</button>
            </Link>
          </>
        )}

        <button style={logoutBtn} onClick={() => {
          localStorage.removeItem("token");
          setUser(null);
        }}>
          Logout
        </button>
      </div>

      <div style={main}>{children}</div>
    </div>
  );
}
const container  = { display: "flex", height: "100vh", background: "#121212", color: "white" };
const sidebar    = { width: "220px", background: "#1e1e1e", padding: "20px", display: "flex", flexDirection: "column", gap: "6px", overflowY: "auto" };
const main       = { flex: 1, padding: "20px", overflowY: "auto" };
const linkStyle  = { textDecoration: "none" };
const navBtn     = { padding: "10px", border: "none", background: "#2c2c2c", color: "white", cursor: "pointer", borderRadius: "6px", textAlign: "left", fontSize: "14px", width: "100%" };
const sectionLabel = { fontSize: "10px", color: "#666", letterSpacing: "1px", margin: "10px 0 2px 4px" };
const logoutBtn  = { marginTop: "auto", padding: "10px", background: "#e53935", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" };
