import { useState, useEffect } from "react";
import api from "../api";

export default function Dashboard({ user, setUser }) {
  const [searchReg, setSearchReg] = useState("");
  const [searchedStudent, setSearchedStudent] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/me");
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const fetchStudent = async () => {
    try {
      const res = await api.get(`/student/${searchReg}`);
      setSearchedStudent(res.data);
    } catch (err) {
      console.error("Student not found", err);
    }
  };

  if (loading) return <div style={{ padding: 20, color: "white" }}>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard</h2>

      {user.role === "STUDENT" && profile && (
        <>
          <h3>My Profile</h3>
          <div style={grid}>
            <div style={{ ...card, gridColumn: "span 3" }}>
              <div style={profileGrid}>
                <div>
                  <p style={fieldLabel}>Name</p>
                  <p style={fieldValue}>{profile.name || "—"}</p>
                </div>
                <div>
                  <p style={fieldLabel}>Registration No</p>
                  <p style={fieldValue}>{profile.registration_number || "—"}</p>
                </div>
                <div>
                  <p style={fieldLabel}>Department</p>
                  <p style={fieldValue}>{profile.department || "—"}</p>
                </div>
                <div>
                  <p style={fieldLabel}>Year</p>
                  <p style={fieldValue}>{profile.year || "—"}</p>
                </div>
                <div>
                  <p style={fieldLabel}>Date of Birth</p>
                  <p style={fieldValue}>{profile.dob || "—"}</p>
                </div>
                <div>
                  <p style={fieldLabel}>Phone</p>
                  <p style={fieldValue}>{profile.phone || "—"}</p>
                </div>
                <div>
                  <p style={fieldLabel}>Address</p>
                  <p style={fieldValue}>{profile.address || "—"}</p>
                </div>
                <div>
                  <p style={fieldLabel}>Role</p>
                  <p style={fieldValue}>{profile.role || "—"}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {user.role === "TEACHER" && profile && (
        <>
          <h3>My Profile</h3>
          <div style={grid}>
            <div style={{ ...card, gridColumn: "span 3" }}>
              <div style={profileGrid}>
                <div>
                  <p style={fieldLabel}>Name</p>
                  <p style={fieldValue}>{profile.name || "—"}</p>
                </div>
                <div>
                  <p style={fieldLabel}>Registration No</p>
                  <p style={fieldValue}>{profile.registration_number || "—"}</p>
                </div>
                <div>
                  <p style={fieldLabel}>Department</p>
                  <p style={fieldValue}>{profile.department || "—"}</p>
                </div>
                <div>
                  <p style={fieldLabel}>Role</p>
                  <p style={fieldValue}>{profile.role || "—"}</p>
                </div>
                <div>
                  <p style={fieldLabel}>Phone</p>
                  <p style={fieldValue}>{profile.phone || "—"}</p>
                </div>
              </div>
            </div>
          </div>

          <h3>Search Student</h3>
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <input
              placeholder="Enter Registration Number"
              value={searchReg}
              onChange={(e) => setSearchReg(e.target.value)}
              style={input}
            />
            <button style={btn} onClick={fetchStudent}>
              Fetch Student
            </button>
          </div>

          {searchedStudent && <StudentCard student={searchedStudent} />}
        </>
      )}

      {user.role === "ADMIN" && profile && (
        <>
          <h3>My Profile</h3>
          <div style={grid}>
            <div style={{ ...card, gridColumn: "span 3" }}>
              <div style={profileGrid}>
                <div>
                  <p style={fieldLabel}>Name</p>
                  <p style={fieldValue}>{profile.name || "—"}</p>
                </div>
                <div>
                  <p style={fieldLabel}>Registration No</p>
                  <p style={fieldValue}>{profile.registration_number || "—"}</p>
                </div>
                <div>
                  <p style={fieldLabel}>Role</p>
                  <p style={fieldValue}>{profile.role || "—"}</p>
                </div>
                <div>
                  <p style={fieldLabel}>Department</p>
                  <p style={fieldValue}>{profile.department || "—"}</p>
                </div>
              </div>
            </div>
          </div>

          <h3>Search Student</h3>
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <input
              placeholder="Enter Registration Number"
              value={searchReg}
              onChange={(e) => setSearchReg(e.target.value)}
              style={input}
            />
            <button style={btn} onClick={fetchStudent}>
              Fetch Student
            </button>
          </div>

          {searchedStudent && <StudentCard student={searchedStudent} />}
        </>
      )}
    </div>
  );
}

function StudentCard({ student }) {
  return (
    <div style={card}>
      <div style={profileGrid}>
        <div>
          <p style={fieldLabel}>Name</p>
          <p style={fieldValue}>{student.name || "—"}</p>
        </div>
        <div>
          <p style={fieldLabel}>Registration No</p>
          <p style={fieldValue}>{student.registration_number || "—"}</p>
        </div>
        <div>
          <p style={fieldLabel}>Department</p>
          <p style={fieldValue}>{student.department || "—"}</p>
        </div>
        <div>
          <p style={fieldLabel}>Year</p>
          <p style={fieldValue}>{student.year || "—"}</p>
        </div>
        <div>
          <p style={fieldLabel}>Date of Birth</p>
          <p style={fieldValue}>{student.dob || "—"}</p>
        </div>
        <div>
          <p style={fieldLabel}>Phone</p>
          <p style={fieldValue}>{student.phone || "—"}</p>
        </div>
        <div>
          <p style={fieldLabel}>Address</p>
          <p style={fieldValue}>{student.address || "—"}</p>
        </div>
        <div>
          <p style={fieldLabel}>Gender</p>
          <p style={fieldValue}>{student.gender || "—"}</p>
        </div>
      </div>
    </div>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "15px",
  marginBottom: "24px",
};

const profileGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "16px",
};

const card = {
  background: "#1e1e1e",
  padding: "16px",
  borderRadius: "10px",
  boxShadow: "0 0 8px rgba(0,0,0,0.4)",
};

const fieldLabel = {
  fontSize: "11px",
  color: "#888",
  textTransform: "uppercase",
  margin: 0,
};

const fieldValue = {
  fontSize: "15px",
  fontWeight: "500",
  margin: "4px 0 0",
};

const btn = {
  padding: "10px 16px",
  borderRadius: "8px",
  border: "none",
  background: "#4CAF50",
  color: "white",
  cursor: "pointer",
};

const input = {
  padding: "10px",
  flex: 1,
  borderRadius: "6px",
  border: "1px solid #444",
  background: "#2c2c2c",
  color: "white",
};
