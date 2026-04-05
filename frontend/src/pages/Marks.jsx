import { useState, useEffect } from "react";
import api from "../api";

export default function Marks({ user }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user?.role === "STUDENT") {
      api.get("/me").then(r => setProfile(r.data)).catch(console.error);
    }
  }, [user]);

  if (!user) return <p style={{ color: "white", padding: 20 }}>Loading...</p>;

  if (user.role === "STUDENT") {
    const marks = profile?.marks || {};
    return (
      <div style={wrap}>
        <h2>My Marks</h2>
        {Object.keys(marks).length === 0
          ? <p style={{ color: "#aaa" }}>No marks available</p>
          : <div style={grid}>
              {Object.entries(marks).map(([sub, val]) => (
                <div key={sub} style={card}>
                  <p style={courseLabel}>{sub}</p>
                  <p style={scoreText}>{val}<span style={outOf}>/100</span></p>
                  <div style={bar}>
                    <div style={{ ...barFill, width: `${val}%`, background: val >= 75 ? "#4CAF50" : val >= 50 ? "#fbc02d" : "#e53935" }} />
                  </div>
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: "#888" }}>Grade: {gradeLabel(val)}</p>
                </div>
              ))}
            </div>
        }
      </div>
    );
  }
  return <ModifyMarksView />;
}

function ModifyMarksView() {
  const [reg, setReg]       = useState("");
  const [student, setStudent] = useState(null);
  const [course, setCourse]  = useState("");
  const [marks, setMarks]    = useState("");
  const [result, setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const fetchStudent = async () => {
    if (!reg) return;
    setFetching(true); setStudent(null); setResult(null);
    try {
      const res = await api.get(`/student/${reg}`);
      setStudent(res.data);
    } catch { setResult({ status: "ERROR", message: "Student not found." }); }
    setFetching(false);
  };

  const handleSubmit = async () => {
    if (!reg || !course || marks === "") {
      setResult({ status: "ERROR", message: "All fields are required." }); return;
    }
    const m = Number(marks);
    if (isNaN(m) || m < 0 || m > 100) {
      setResult({ status: "ERROR", message: "Marks must be 0–100." }); return;
    }
    setLoading(true); setResult(null);
    try {
      const res = await api.post("/modify-marks", {
        registration_number: Number(reg),
        course: course.toUpperCase(),
        marks: m,
      });
      setResult(res.data);
      if (res.data.status === "SUCCESS") {
        setStudent(prev => prev ? {
          ...prev,
          marks: { ...prev.marks, [course.toUpperCase()]: m }
        } : prev);
      }
    } catch (err) {
      setResult({ status: "ERROR", message: err?.response?.data?.detail || "Failed." });
    }
    setLoading(false);
  };

  return (
    <div style={wrap}>
      <h2>Modify Marks</h2>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 20 }}>
        Search a student, then update their marks.
      </p>

      <div style={formCard}>
        <label style={label}>Student Registration Number</label>
        <div style={{ display: "flex", gap: 10 }}>
          <input style={{ ...inputStyle, flex: 1 }} placeholder="e.g. 20210003"
            value={reg} onChange={e => { setReg(e.target.value); setStudent(null); }}
            onKeyDown={e => e.key === "Enter" && fetchStudent()} />
          <button style={searchBtn} onClick={fetchStudent} disabled={fetching}>
            {fetching ? "..." : "Look Up"}
          </button>
        </div>
      </div>

      {student && (
        <div style={studentCard}>
          <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 16 }}>{student.name}</p>
          <p style={{ margin: "0 0 12px", color: "#aaa", fontSize: 13 }}>
            {student.department} · Year {student.year}
          </p>
          <div style={grid}>
            {Object.entries(student.marks || {}).map(([c, m]) => (
              <div key={c} style={{ ...card, background: "#2a2a2a", cursor: "pointer",
                border: course.toUpperCase() === c ? "1px solid #4CAF50" : "1px solid transparent" }}
                onClick={() => setCourse(c)}>
                <p style={courseLabel}>{c}</p>
                <p style={scoreText}>{m}<span style={outOf}>/100</span></p>
              </div>
            ))}
          </div>
          <p style={{ color: "#666", fontSize: 12, margin: "0 0 12px" }}>
            Click a course to select it, or type below.
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input style={{ ...inputStyle, flex: 1, minWidth: 120 }} placeholder="Course (e.g. CSE401)"
              value={course} onChange={e => setCourse(e.target.value)} />
            <input style={{ ...inputStyle, width: 100 }} type="number" placeholder="0–100" min={0} max={100}
              value={marks} onChange={e => setMarks(e.target.value)} />
            <button style={{ ...btn, opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
              {loading ? "Updating..." : "Update"}
            </button>
          </div>

          {result && (
            <div style={resultBox(result.status)}>
              <p style={{ color: resultColor(result.status), margin: 0, fontWeight: 600, fontSize: 13 }}>{result.status}</p>
              <p style={{ color: "#ccc", margin: "4px 0 0", fontSize: 13 }}>{result.message}</p>
            </div>
          )}
        </div>
      )}

      {result && !student && (
        <div style={resultBox(result.status)}>
          <p style={{ color: resultColor(result.status), margin: 0, fontSize: 13 }}>{result.message}</p>
        </div>
      )}

      <div style={ruleNote}>
        <span style={{ color: "#fbc02d", fontSize: 12 }}></span>
        <span style={{ color: "#666", fontSize: 12, marginLeft: 8 }}>
          Only TEACHER or ADMIN can modify marks. All changes are audit-logged.
        </span>
      </div>
    </div>
  );
}

const gradeLabel = m => m >= 90 ? "O" : m >= 75 ? "A" : m >= 60 ? "B" : m >= 50 ? "C" : "F";
const resultColor = s => s === "SUCCESS" ? "#4CAF50" : s === "BLOCKED" ? "#fbc02d" : "#e53935";
const resultBox = s => ({ marginTop: 14, padding: "12px 16px", borderRadius: 8,
  border: `1px solid ${resultColor(s)}`,
  background: s === "SUCCESS" ? "#1b3a1f" : s === "BLOCKED" ? "#3a2e00" : "#3a1b1b" });

const wrap       = { padding: 24 };
const grid       = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 16 };
const card       = { background: "#1e1e1e", padding: 16, borderRadius: 10, border: "1px solid #2a2a2a" };
const studentCard = { background: "#1e1e1e", padding: 20, borderRadius: 10, marginBottom: 16 };
const formCard   = { background: "#1e1e1e", padding: 20, borderRadius: 10, maxWidth: 500, marginBottom: 16 };
const courseLabel = { color: "#4CAF50", fontWeight: "bold", margin: "0 0 4px", fontSize: 13 };
const scoreText  = { fontSize: 22, fontWeight: "bold", margin: "0 0 6px" };
const outOf      = { fontSize: 12, color: "#aaa" };
const bar        = { height: 4, background: "#333", borderRadius: 2 };
const barFill    = { height: "100%", borderRadius: 2 };
const label      = { fontSize: 12, color: "#aaa", marginBottom: 6, display: "block" };
const inputStyle = { padding: "10px 12px", borderRadius: 6, border: "1px solid #444", background: "#2c2c2c", color: "white", fontSize: 14 };
const searchBtn  = { padding: "10px 16px", borderRadius: 6, border: "none", background: "#4CAF50", color: "white", fontWeight: 600, cursor: "pointer" };
const btn        = { padding: "10px 16px", borderRadius: 8, border: "none", background: "#4CAF50", color: "white", fontWeight: 600, cursor: "pointer" };
const ruleNote   = { marginTop: 16, padding: "10px 14px", borderRadius: 8, border: "1px solid #333", background: "#1a1a1a" };
