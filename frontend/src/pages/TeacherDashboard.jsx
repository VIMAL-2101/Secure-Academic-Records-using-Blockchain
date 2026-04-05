import { useState } from "react";
import api from "../api";
import AuditLogs from "./AuditLogs";

function Field({ label, value, mono }) {
  return (
    <div className="td-field">
      <div className="td-field-label">{label}</div>
      <div className={`td-field-val${mono ? " mono" : ""}`}>{value ?? "—"}</div>
    </div>
  );
}

function Toast({ msg, ok }) {
  if (!msg) return null;
  return (
    <div className="td-toast" style={{
      background: ok ? "#0d2b1a" : "#2b0d0d",
      border: `1px solid ${ok ? "#16a34a" : "#dc2626"}`,
      color: ok ? "#4ade80" : "#f87171",
    }}>
      {ok ? "✓" : "✗"} {msg}
    </div>
  );
}
function StudentCard({ student, onClear }) {
  const [tab,    setTab]    = useState("info");
  const [course, setCourse] = useState("");
  const [marks,  setMarks]  = useState("");
  const [att,    setAtt]    = useState("");
  const [toast,  setToast]  = useState(null);
  const [busy,   setBusy]   = useState(false);

  function notify(msg, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  async function submitMarks(e) {
    e.preventDefault();
    if (!course || marks === "") return;
    setBusy(true);
    try {
      const res = await api.post("/modify-marks", {
        registration_number: student.registration_number,
        course,
        marks: Number(marks),
      });
      const data = res.data;
      if (data.status === "BLOCKED") {
        notify("Blocked — action denied by compliance engine.", false);
      } else {
        notify(`Done — marks for ${course} updated to ${marks}.`);
        setCourse(""); setMarks("");
      }
    } catch {
      notify("Failed — please check the student number and try again.", false);
    } finally {
      setBusy(false);
    }
  }

  async function submitAttendance(e) {
    e.preventDefault();
    if (!course || att === "") return;
    setBusy(true);
    try {
      const res = await api.post("/update-attendance", {
        registration_number: student.registration_number,
        course,
        attendance: Number(att),
      });
      const data = res.data;
      if (data.status === "BLOCKED") {
        notify("Blocked — action denied by compliance engine.", false);
      } else {
        notify(`Done — attendance for ${course} updated to ${att}%.`);
        setCourse(""); setAtt("");
      }
    } catch {
      notify("Failed — please check the student number and try again.", false);
    } finally {
      setBusy(false);
    }
  }

  const courses = Array.from(
    new Set([...Object.keys(student.marks || {}), ...Object.keys(student.attendance || {})])
  );

  return (
    <div className="student-card">
      <div className="sc-header">
        <div>
          <div className="sc-name">{student.name}</div>
          <div className="sc-meta">
            <span className="sc-reg">#{student.registration_number}</span>
            {student.department && <span>{student.department}</span>}
            {student.year && <span>Year {student.year}</span>}
          </div>
        </div>
        <button className="sc-close" onClick={onClear}>✕</button>
      </div>

      <div className="sc-tabs">
        {[["info","Info"],["marks","Marks"],["attendance","Attendance"]].map(([id,lbl]) => (
          <button key={id} className={`sc-tab${tab===id?" active":""}`} onClick={() => setTab(id)}>
            {lbl}
          </button>
        ))}
      </div>

      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      {tab === "info" && (
        <div className="sc-info-grid">
          <Field label="Department" value={student.department} />
          <Field label="Year"       value={student.year} />
          <Field label="Phone"      value={student.phone} mono />
          <Field label="DOB"        value={student.dob} />
          <Field label="Gender"     value={student.gender} />
          <Field label="Address"    value={student.address} />
          <Field label="Result"     value={student.result_status} />
        </div>
      )}

      {tab === "marks" && (
        <div>
          <div className="sc-section-title">Current Marks</div>
          {courses.length === 0 ? (
            <p className="sc-empty">No marks recorded yet.</p>
          ) : (
            <div className="sc-course-list">
              {courses.map((c) => (
                <div key={c} className="sc-course-row">
                  <span className="sc-course-name">{c}</span>
                  <div className="sc-bar-track">
                    <div className="sc-bar-fill" style={{ width:`${student.marks?.[c] ?? 0}%`, background:"#3b82f6" }} />
                  </div>
                  <span className="sc-course-val">{student.marks?.[c] ?? "—"}</span>
                </div>
              ))}
            </div>
          )}
          <div className="sc-section-title" style={{ marginTop:20 }}>Update Marks</div>
          <form className="sc-form" onSubmit={submitMarks}>
            <input className="sc-input" placeholder="Course name" value={course}
              onChange={(e) => setCourse(e.target.value)} required />
            <input className="sc-input" type="number" placeholder="Marks (0–100)"
              min={0} max={100} value={marks} onChange={(e) => setMarks(e.target.value)} required />
            <button className="sc-btn" type="submit" disabled={busy}>
              {busy ? "Saving…" : "Update"}
            </button>
          </form>
        </div>
      )}

      {tab === "attendance" && (
        <div>
          <div className="sc-section-title">Current Attendance</div>
          {courses.length === 0 ? (
            <p className="sc-empty">No attendance recorded yet.</p>
          ) : (
            <div className="sc-course-list">
              {courses.map((c) => {
                const val = student.attendance?.[c];
                const low = val !== undefined && val < 75;
                return (
                  <div key={c} className="sc-course-row">
                    <span className="sc-course-name">{c}</span>
                    <div className="sc-bar-track">
                      <div className="sc-bar-fill" style={{ width:`${val ?? 0}%`, background: low ? "#ef4444" : "#10b981" }} />
                    </div>
                    <span className="sc-course-val" style={{ color: low ? "#f87171" : "#4ade80" }}>
                      {val !== undefined ? `${val}%` : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <div className="sc-section-title" style={{ marginTop:20 }}>Update Attendance</div>
          <form className="sc-form" onSubmit={submitAttendance}>
            <input className="sc-input" placeholder="Course name" value={course}
              onChange={(e) => setCourse(e.target.value)} required />
            <input className="sc-input" type="number" placeholder="Attendance % (0–100)"
              min={0} max={100} value={att} onChange={(e) => setAtt(e.target.value)} required />
            <button className="sc-btn" type="submit" disabled={busy}>
              {busy ? "Saving…" : "Update"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function TeacherDashboard({ user }) {
  const [mainTab,    setMainTab]    = useState("students");
  const [regInput,   setRegInput]   = useState("");
  const [student,    setStudent]    = useState(null);
  const [searching,  setSearching]  = useState(false);
  const [lookupErr,  setLookupErr]  = useState("");

  async function lookupStudent(e) {
    e.preventDefault();
    if (!regInput.trim()) return;
    setSearching(true);
    setLookupErr("");
    setStudent(null);
    try {
      const res = await api.get(`/student/${regInput.trim()}`);
      setStudent(res.data);
    } catch {
      setLookupErr("Student not found. Check the registration number.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="td-wrap">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
        .td-wrap { font-family:'DM Sans',sans-serif; color:#e2e8f0; max-width:980px; }

        .td-greeting { margin-bottom:24px; }
        .td-greeting h1 { font-size:1.8rem; font-weight:700; color:#f8fafc; letter-spacing:-0.5px; margin:0 0 4px; }
        .td-greeting p  { color:#64748b; font-size:0.82rem; margin:0; }

        .td-main-tabs { display:flex; gap:4px; background:#0f172a; border-radius:10px; padding:4px; width:fit-content; margin-bottom:28px; }
        .td-main-tab  { background:transparent; border:none; border-radius:7px; color:#64748b; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:0.82rem; font-weight:600; padding:7px 20px; transition:all 0.18s; }
        .td-main-tab.active { background:#1e293b; color:#f8fafc; }

        .td-lookup { background:#0f172a; border:1px solid #1e293b; border-radius:14px; padding:22px 24px; margin-bottom:20px; }
        .td-lookup-title { font-size:0.75rem; font-weight:700; color:#64748b; letter-spacing:0.8px; text-transform:uppercase; margin-bottom:14px; }
        .td-lookup-form { display:flex; gap:10px; }
        .td-lookup-input { background:#1e293b; border:1px solid #334155; border-radius:8px; color:#e2e8f0; font-family:'JetBrains Mono',monospace; font-size:0.85rem; outline:none; padding:9px 14px; transition:border-color 0.2s; width:240px; }
        .td-lookup-input:focus { border-color:#3b82f6; }
        .td-lookup-input::placeholder { color:#475569; }
        .td-lookup-btn { background:#3b82f6; border:none; border-radius:8px; color:#fff; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:0.82rem; font-weight:600; padding:9px 20px; transition:background 0.2s; }
        .td-lookup-btn:hover:not(:disabled) { background:#2563eb; }
        .td-lookup-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .td-lookup-err { background:#2b0d0d; border:1px solid #7f1d1d; border-radius:8px; color:#f87171; font-size:0.8rem; margin-top:12px; padding:10px 14px; }

        .student-card { background:#0f172a; border:1px solid #1e293b; border-radius:14px; padding:22px 24px; animation:fadeIn 0.25s ease; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }

        .sc-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:16px; }
        .sc-name   { font-size:1.2rem; font-weight:700; color:#f8fafc; }
        .sc-meta   { display:flex; gap:10px; font-size:0.78rem; color:#64748b; margin-top:3px; flex-wrap:wrap; }
        .sc-reg    { font-family:'JetBrains Mono',monospace; color:#3b82f6; }
        .sc-close  { background:transparent; border:1px solid #334155; border-radius:6px; color:#64748b; cursor:pointer; font-size:0.75rem; padding:4px 8px; transition:all 0.15s; }
        .sc-close:hover { border-color:#dc2626; color:#f87171; }

        .sc-tabs { display:flex; gap:4px; background:#1e293b; border-radius:8px; padding:3px; width:fit-content; margin-bottom:18px; }
        .sc-tab  { background:transparent; border:none; border-radius:6px; color:#64748b; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:0.78rem; font-weight:600; padding:5px 14px; transition:all 0.15s; }
        .sc-tab.active { background:#0f172a; color:#e2e8f0; }

        .td-toast { border-radius:8px; font-size:0.82rem; font-weight:600; margin-bottom:14px; padding:10px 14px; animation:toastIn 0.2s ease; }
        @keyframes toastIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:none} }

        .sc-info-grid   { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        .td-field       { background:#1e293b; border-radius:8px; padding:10px 14px; }
        .td-field-label { color:#475569; font-size:0.62rem; font-weight:700; letter-spacing:0.7px; margin-bottom:3px; text-transform:uppercase; }
        .td-field-val   { color:#e2e8f0; font-size:0.85rem; }
        .td-field-val.mono { font-family:'JetBrains Mono',monospace; color:#3b82f6; }

        .sc-section-title { color:#64748b; font-size:0.68rem; font-weight:700; letter-spacing:0.8px; margin-bottom:12px; text-transform:uppercase; }
        .sc-course-list   { display:flex; flex-direction:column; gap:8px; }
        .sc-course-row    { align-items:center; display:flex; gap:10px; }
        .sc-course-name   { color:#94a3b8; font-size:0.8rem; min-width:100px; }
        .sc-bar-track     { background:#1e293b; border-radius:4px; flex:1; height:6px; overflow:hidden; }
        .sc-bar-fill      { height:100%; border-radius:4px; transition:width 0.7s cubic-bezier(0.34,1.56,0.64,1); }
        .sc-course-val    { font-family:'JetBrains Mono',monospace; font-size:0.75rem; min-width:36px; text-align:right; color:#94a3b8; }

        .sc-form  { display:flex; flex-wrap:wrap; gap:8px; margin-top:8px; }
        .sc-input { background:#1e293b; border:1px solid #334155; border-radius:7px; color:#e2e8f0; font-family:'DM Sans',sans-serif; font-size:0.82rem; outline:none; padding:8px 12px; transition:border-color 0.2s; width:180px; }
        .sc-input:focus { border-color:#3b82f6; }
        .sc-btn { background:#3b82f6; border:none; border-radius:7px; color:#fff; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:0.82rem; font-weight:600; padding:8px 18px; transition:background 0.2s; }
        .sc-btn:hover:not(:disabled) { background:#2563eb; }
        .sc-btn:disabled { opacity:0.6; cursor:not-allowed; }
        .sc-empty { color:#475569; font-size:0.82rem; }
      `}</style>

      <div className="td-greeting">
        <h1>Welcome, {user?.name?.split(" ")[0] || "Teacher"}</h1>
        <p>{user?.department} · {user?.registration_number}</p>
      </div>

      <div className="td-main-tabs">
        <button className={`td-main-tab${mainTab==="students"?" active":""}`} onClick={() => setMainTab("students")}>
          Students
        </button>
        <button className={`td-main-tab${mainTab==="logs"?" active":""}`} onClick={() => setMainTab("logs")}>
          Audit Logs
        </button>
      </div>

      {mainTab === "students" && (
        <>
          <div className="td-lookup">
            <div className="td-lookup-title">Look Up Student</div>
            <form className="td-lookup-form" onSubmit={lookupStudent}>
              <input className="td-lookup-input" type="number" placeholder="Registration number…"
                value={regInput} onChange={(e) => setRegInput(e.target.value)} />
              <button className="td-lookup-btn" type="submit" disabled={searching}>
                {searching ? "Searching…" : "Look Up"}
              </button>
              {student && (
                <button className="td-lookup-btn" type="button" style={{ background:"#334155" }}
                  onClick={() => { setStudent(null); setRegInput(""); setLookupErr(""); }}>
                  Clear
                </button>
              )}
            </form>
            {lookupErr && <div className="td-lookup-err">{lookupErr}</div>}
          </div>
          {student && (
            <StudentCard student={student} onClear={() => { setStudent(null); setRegInput(""); }} />
          )}
        </>
      )}

      {mainTab === "logs" && <AuditLogs role="TEACHER" />}
    </div>
  );
}
