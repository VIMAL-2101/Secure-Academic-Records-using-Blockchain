import { useState } from "react";
import api from "../api";
const DEMO_ASSIGNMENTS = [
  { id: "A001", title: "Data Structures Lab Report", course: "CSE401", due: "2025-04-10", description: "Submit a report on AVL tree implementation." },
  { id: "A002", title: "DBMS Mini Project",          course: "CSE402", due: "2025-04-15", description: "Design and implement a database for a library system." },
  { id: "A003", title: "OS Process Scheduling",      course: "CSE403", due: "2025-04-20", description: "Simulate FCFS, SJF, and Round Robin scheduling algorithms." },
  { id: "A004", title: "CN Socket Programming",      course: "CSE404", due: "2025-04-25", description: "Implement a TCP client-server chat application." },
];

export default function Assignments({ user }) {
  if (user?.role === "STUDENT") return <StudentAssignments />;
  return <TeacherAssignments />;
}

function StudentAssignments() {
  const [submitted, setSubmitted] = useState({});
  const [active,    setActive]    = useState(null);

  const handleSubmit = (id) => {
    setSubmitted((prev) => ({ ...prev, [id]: true }));
    setActive(null);
    alert(`Assignment ${id} submitted! (Demo — backend endpoint not yet wired)`);
  };

  return (
    <div style={wrap}>
      <h2 style={{ marginBottom: 4 }}>Assignments</h2>
      <p style={sub}>View and submit your assignments before the due date.</p>

      <div style={grid}>
        {DEMO_ASSIGNMENTS.map((a) => {
          const done = !!submitted[a.id];
          const overdue = new Date(a.due) < new Date();
          return (
            <div key={a.id} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <span style={coursePill}>{a.course}</span>
                <span style={statusPill(done, overdue)}>
                  {done ? "Submitted" : overdue ? "Overdue" : "Pending"}
                </span>
              </div>

              <p style={{ margin: "0 0 6px", fontWeight: 600, fontSize: 15 }}>{a.title}</p>
              <p style={{ margin: "0 0 12px", color: "#aaa", fontSize: 13 }}>{a.description}</p>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: overdue && !done ? "#e53935" : "#666" }}>
                  Due: {a.due}
                </span>
                {!done && (
                  <button style={submitBtn} onClick={() => handleSubmit(a.id)}>
                    Submit
                  </button>
                )}
                {done && (
                  <span style={{ fontSize: 12, color: "#4CAF50", fontWeight: 600 }}>✓ Done</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={ruleNote}>
        <span style={{ color: "#fbc02d", fontSize: 12 }}></span>
        <span style={{ color: "#666", fontSize: 12, marginLeft: 8 }}>
          Students can register for exams and submit assignments.
        </span>
      </div>
    </div>
  );
}

function TeacherAssignments() {
  const [title,   setTitle]   = useState("");
  const [course,  setCourse]  = useState("");
  const [due,     setDue]     = useState("");
  const [desc,    setDesc]    = useState("");
  const [posted,  setPosted]  = useState([]);
  const [result,  setResult]  = useState(null);

  const handlePost = async () => {
    if (!title || !course || !due) {
      setResult({ status: "ERROR", message: "Title, course, and due date are required." });
      return;
    }
    const check = await api.post("/action", { action_type: "UPLOAD_ASSIGNMENT" });

    if (check.status === "BLOCKED") {
      setResult({ status: "BLOCKED", message: check.message || "Policy violation." });
      return;
    }

    const newAssignment = { id: `A${Date.now()}`, title, course: course.toUpperCase(), due, description: desc };
    setPosted((prev) => [newAssignment, ...prev]);
    setResult({ status: "SUCCESS", message: `Assignment "${title}" posted successfully.` });
    setTitle(""); setCourse(""); setDue(""); setDesc("");
  };

  return (
    <div style={wrap}>
      <h2 style={{ marginBottom: 4 }}>Upload Assignment</h2>
      <p style={sub}>Post a new assignment for students.</p>

      <div style={formCard}>
        <label style={label}>Assignment Title</label>
        <input style={inputStyle} placeholder="e.g. Data Structures Lab Report" value={title} onChange={(e) => setTitle(e.target.value)} />

        <label style={label}>Course Code</label>
        <input style={inputStyle} placeholder="e.g. CSE401" value={course} onChange={(e) => setCourse(e.target.value)} />

        <label style={label}>Due Date</label>
        <input style={inputStyle} type="date" value={due} onChange={(e) => setDue(e.target.value)} />

        <label style={label}>Description</label>
        <textarea
          style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
          placeholder="Describe the assignment..."
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <button style={btn} onClick={handlePost}>Post Assignment</button>

        {result && (
          <div style={resultBox(result.status)}>
            <p style={{ color: resultColor(result.status), margin: 0, fontWeight: 600, fontSize: 13 }}>{result.status}</p>
            <p style={{ color: "#ccc", margin: "4px 0 0", fontSize: 13 }}>{result.message}</p>
          </div>
        )}
      </div>

      {posted.length > 0 && (
        <>
          <h3 style={{ marginBottom: 12 }}>Posted This Session</h3>
          <div style={grid}>
            {posted.map((a) => (
              <div key={a.id} style={card}>
                <span style={coursePill}>{a.course}</span>
                <p style={{ margin: "10px 0 4px", fontWeight: 600 }}>{a.title}</p>
                <p style={{ margin: "0 0 8px", color: "#aaa", fontSize: 13 }}>{a.description}</p>
                <span style={{ fontSize: 12, color: "#666" }}>Due: {a.due}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={ruleNote}>
        <span style={{ color: "#fbc02d", fontSize: 12 }}></span>
        <span style={{ color: "#666", fontSize: 12, marginLeft: 8 }}>
          Only TEACHER can upload assignments. All actions are compliance-checked.
        </span>
      </div>
    </div>
  );
}

const resultColor = (s) =>
  s === "SUCCESS" ? "#4CAF50" : s === "BLOCKED" ? "#fbc02d" : "#e53935";

const resultBox = (s) => ({
  marginTop: 14, padding: "12px 16px", borderRadius: 8,
  border: `1px solid ${resultColor(s)}`,
  background: s === "SUCCESS" ? "#1b3a1f" : s === "BLOCKED" ? "#3a2e00" : "#3a1b1b",
});

const statusPill = (done, overdue) => ({
  fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20,
  background: done ? "#1b3a1f" : overdue ? "#3a1b1b" : "#3a2e00",
  color:      done ? "#4CAF50" : overdue ? "#e53935" : "#fbc02d",
  border:     `1px solid ${done ? "#4CAF50" : overdue ? "#e53935" : "#fbc02d"}`,
});

const wrap       = { padding: 24 };
const sub        = { color: "#888", fontSize: 13, marginBottom: 24 };
const grid       = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, marginBottom: 20 };
const card       = { background: "#1e1e1e", padding: 16, borderRadius: 10, border: "1px solid #2a2a2a" };
const coursePill = { fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12, background: "#1a2a3a", color: "#42a5f5", border: "1px solid #42a5f5" };
const submitBtn  = { padding: "6px 14px", borderRadius: 6, border: "none", background: "#4CAF50", color: "white", fontWeight: 600, cursor: "pointer", fontSize: 13 };
const formCard   = { background: "#1e1e1e", padding: 24, borderRadius: 10, maxWidth: 460, display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 };
const label      = { fontSize: 12, color: "#aaa", marginTop: 10, marginBottom: 2 };
const inputStyle = { padding: "10px 12px", borderRadius: 6, border: "1px solid #444", background: "#2c2c2c", color: "white", fontSize: 14 };
const btn        = { marginTop: 16, padding: 11, borderRadius: 8, border: "none", background: "#4CAF50", color: "white", fontWeight: 600, cursor: "pointer", fontSize: 14 };
const ruleNote   = { padding: "10px 14px", borderRadius: 8, border: "1px solid #333", background: "#1a1a1a", maxWidth: 460 };
