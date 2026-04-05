import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import Marks from "./pages/Marks";
import Profile from "./pages/Profile";
import Assignment from "./pages/Assignment";
import ModifyMarks from "./pages/ModifyMarks";
import Approve from "./pages/Approve";
import AuditLogs from "./pages/AuditLogs";
import Verify from "./pages/Verify";
import AdminPanel from "./pages/AdminPanel";
import Layout from "./components/Layout";
import api from "./api";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { setUser(null); return; }
        const res = await api.get("/me");
        setUser(res.data);
      } catch {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) return <div style={{ color: "white", padding: 20 }}>Loading...</div>;

  if (!user) return <Login setUser={setUser} />;

  return (
    <Router>
      <Layout user={user} setUser={setUser}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard user={user} setUser={setUser} />} />
          <Route path="/profile"   element={<Profile user={user} />} />
          <Route path="/marks"     element={<Marks user={user} />} />
          <Route path="/attendance" element={<Attendance user={user} />} />
          <Route path="/assignments" element={<Assignment user={user} />} />
          <Route path="/modify-marks" element={<ModifyMarks user={user} />} />
          <Route path="/approve"   element={<Approve user={user} />} />
          <Route path="/logs"      element={<AuditLogs user={user} />} />
          <Route path="/verify"    element={<Verify user={user} />} />
          <Route path="/admin"     element={<AdminPanel user={user} />} />
          <Route path="*"          element={<Navigate to="/dashboard" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
