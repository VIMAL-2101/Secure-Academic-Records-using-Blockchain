import { useState } from "react";
import api from "../api";
import AuditLogs from "./AuditLogs";

function Toast({ msg, ok }) {
  if (!msg) return null;
  return (
    <div style={{
      background: ok ? "#0d2b1a" : "#2b0d0d",
      border: `1px solid ${ok ? "#16a34a" : "#dc2626"}`,
      borderRadius: 8, color: ok ? "#4ade80" : "#f87171",
      fontSize: "0.82rem", fontWeight: 600, marginBottom: 14,
      padding: "10px 16px", display: "flex", alignItems: "center", gap: 8,
      animation: "toastIn 0.2s ease",
    }}>
      {ok ? "✓" : "✗"} {msg}
    </div>
  );
}

function ProfileBlock({ data, type }) {
  if (!data) return null;
  const keys = type === "teacher"
    ? ["name", "registration_number", "department", "role", "phone"]
    : ["name", "registration_number", "department", "year", "role", "dob", "phone", "address", "gender", "result_status"];

  return (
    <div className="ad-profile-grid">
      {keys.map((k) => (
        <div key={k} className="ad-pf-field">
          <div className="ad-pf-label">{k.replace(/_/g, " ").toUpperCase()}</div>
          <div className="ad-pf-val" style={k === "registration_number"
            ? { fontFamily:"'JetBrains Mono',monospace", color:"#3b82f6" } : {}}>
            {data[k] !== undefined && data[k] !== "" ? String(data[k]) : "—"}
          </div>
        </div>
      ))}
      {data.marks && Object.keys(data.marks).length > 0 && (
        <div className="ad-pf-field" style={{ gridColumn:"1/-1" }}>
          <div className="ad-pf-label">MARKS</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:4 }}>
            {Object.entries(data.marks).map(([c, v]) => (
              <div key={c} className="ad-chip"><span>{c}</span><strong>{v}</strong></div>
            ))}
          </div>
        </div>
      )}
      {data.attendance && Object.keys(data.attendance).length > 0 && (
        <div className="ad-pf-field" style={{ gridColumn:"1/-1" }}>
          <div className="ad-pf-label">ATTENDANCE</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:4 }}>
            {Object.entries(data.attendance).map(([c, v]) => (
              <div key={c} className="ad-chip" style={{ borderColor: v < 75 ? "#dc2626" : "#16a34a" }}>
                <span>{c}</span>
                <strong style={{ color: v < 75 ? "#f87171" : "#4ade80" }}>{v}%</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ApproveResult() {
  const [reg,   setReg]   = useState("");
  const [busy,  setBusy]  = useState(false);
  const [toast, setToast] = useState(null);

  function notify(msg, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  async function submit(e) {
    e.preventDefault();
    if (!reg) return;
    setBusy(true);
    try {
      const res = await api.post("/approve-result", { registration_number: Number(reg) });
      const data = res.data;
      if (data.status === "BLOCKED") {
        notify("Blocked — action denied by compliance engine.", false);
      } else {
        notify(`Done — result approved for student ${reg}.`);
        setReg("");
      }
    } catch {
      notify("Student not found or request failed.", false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ad-box">
      <div className="ad-box-title">Approve Student Result</div>
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
      <form className="ad-inline-form" onSubmit={submit}>
        <input className="ad-input" type="number" placeholder="Student registration number…"
          value={reg} onChange={(e) => setReg(e.target.value)} required />
        <button className="ad-btn primary" type="submit" disabled={busy}>
          {busy ? "Approving…" : "Approve Result"}
        </button>
      </form>
    </div>
  );
}

function AddUser() {
  const blank = { registration_number:"", name:"", password:"", role:"STUDENT",
                  department:"", year:"", phone:"", address:"", dob:"", gender:"" };
  const [form,  setForm]  = useState(blank);
  const [busy,  setBusy]  = useState(false);
  const [toast, setToast] = useState(null);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function notify(msg, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...form,
        registration_number: Number(form.registration_number),
        year: form.year ? Number(form.year) : null,
      };
      const res = await api.post("/add-user", payload);
      const data = res.data;
      notify(`Done — ${data.message || "user added successfully."}`);
      setForm(blank);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      if (detail && detail.toLowerCase().includes("already exists")) {
        notify("Registration number already exists.", false);
      } else {
        notify("Failed to add user. Check the details and try again.", false);
      }
    } finally {
      setBusy(false);
    }
  }

  const isStudent = form.role === "STUDENT";

  return (
    <div className="ad-box">
      <div className="ad-box-title">Add New User</div>
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
      <form className="ad-add-form" onSubmit={submit}>
        <div className="ad-form-row">
          <div className="ad-form-group">
            <label className="ad-label">Registration No.</label>
            <input className="ad-input" type="number" required placeholder="e.g. 10021"
              value={form.registration_number} onChange={(e) => set("registration_number", e.target.value)} />
          </div>
          <div className="ad-form-group">
            <label className="ad-label">Full Name</label>
            <input className="ad-input" required placeholder="Full name"
              value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="ad-form-group">
            <label className="ad-label">Password</label>
            <input className="ad-input" type="password" required placeholder="Set password"
              value={form.password} onChange={(e) => set("password", e.target.value)} />
          </div>
          <div className="ad-form-group">
            <label className="ad-label">Role</label>
            <select className="ad-input" value={form.role} onChange={(e) => set("role", e.target.value)}>
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="ad-form-group">
            <label className="ad-label">Department</label>
            <input className="ad-input" placeholder="e.g. CSE"
              value={form.department} onChange={(e) => set("department", e.target.value)} />
          </div>
        </div>
        {isStudent && (
          <div className="ad-form-row" style={{ marginTop:12 }}>
            <div className="ad-form-group">
              <label className="ad-label">Year</label>
              <input className="ad-input" type="number" min={1} max={5} placeholder="1–5"
                value={form.year} onChange={(e) => set("year", e.target.value)} />
            </div>
            <div className="ad-form-group">
              <label className="ad-label">Phone</label>
              <input className="ad-input" placeholder="Phone number"
                value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div className="ad-form-group">
              <label className="ad-label">Date of Birth</label>
              <input className="ad-input" type="date"
                value={form.dob} onChange={(e) => set("dob", e.target.value)} />
            </div>
            <div className="ad-form-group">
              <label className="ad-label">Gender</label>
              <select className="ad-input" value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                <option value="">Select…</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="ad-form-group" style={{ gridColumn:"1/-1" }}>
              <label className="ad-label">Address</label>
              <input className="ad-input" placeholder="Full address"
                value={form.address} onChange={(e) => set("address", e.target.value)} />
            </div>
          </div>
        )}
        <button className="ad-btn primary" type="submit" disabled={busy} style={{ marginTop:16 }}>
          {busy ? "Adding…" : `Add ${form.role}`}
        </button>
      </form>
    </div>
  );
}

function LookupPanel({ type }) {
  const [reg,     setReg]     = useState("");
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState("");

  async function lookup(e) {
    e.preventDefault();
    if (!reg.trim()) return;
    setLoading(true);
    setErr("");
    setResult(null);
    try {
      const endpoint = type === "teacher" ? `/teacher/${reg.trim()}` : `/student/${reg.trim()}`;
      const res = await api.get(endpoint);
      setResult(res.data);
    } catch {
      setErr(`${type === "teacher" ? "Teacher" : "Student"} not found. Check the registration number.`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ad-box">
      <div className="ad-box-title">Look Up {type === "teacher" ? "Teacher" : "Student"}</div>
      <form className="ad-inline-form" onSubmit={lookup}>
        <input className="ad-input" type="number" placeholder="Registration number…"
          value={reg} onChange={(e) => setReg(e.target.value)} />
        <button className="ad-btn primary" type="submit" disabled={loading}>
          {loading ? "Searching…" : "Look Up"}
        </button>
        {result && (
          <button className="ad-btn ghost" type="button"
            onClick={() => { setResult(null); setReg(""); setErr(""); }}>
            Clear
          </button>
        )}
      </form>
      {err && (
        <div style={{ background:"#2b0d0d", border:"1px solid #7f1d1d", borderRadius:8,
          color:"#f87171", fontSize:"0.8rem", marginTop:12, padding:"10px 14px" }}>
           {err}
        </div>
      )}
      {result && <ProfileBlock data={result} type={type} />}
    </div>
  );
}

export default function AdminDashboard({ user }) {
  const [tab, setTab] = useState("manage");

  return (
    <div className="ad-wrap">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
        @keyframes toastIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:none} }

        .ad-wrap { font-family:'IBM Plex Sans',sans-serif; color:#e2e8f0; max-width:1020px; }

        .ad-greeting { margin-bottom:24px; }
        .ad-greeting h1 { font-size:1.8rem; font-weight:700; color:#f8fafc; letter-spacing:-0.5px; margin:0 0 4px; }
        .ad-greeting p  { color:#64748b; font-size:0.82rem; margin:0; }
        .ad-role-chip { display:inline-block; background:#1e3a5f; border:1px solid #1d4ed8; border-radius:20px; color:#60a5fa; font-size:0.68rem; font-weight:700; letter-spacing:0.8px; margin-left:8px; padding:2px 10px; text-transform:uppercase; vertical-align:middle; }

        .ad-main-tabs { display:flex; gap:4px; background:#0f172a; border-radius:10px; padding:4px; width:fit-content; margin-bottom:28px; }
        .ad-main-tab  { background:transparent; border:none; border-radius:7px; color:#64748b; cursor:pointer; font-family:'IBM Plex Sans',sans-serif; font-size:0.82rem; font-weight:600; padding:7px 20px; transition:all 0.18s; }
        .ad-main-tab.active { background:#1e293b; color:#f8fafc; }

        .ad-manage-grid { display:flex; flex-direction:column; gap:18px; }

        .ad-box { background:#0f172a; border:1px solid #1e293b; border-radius:14px; padding:22px 24px; animation:fadeUp 0.25s ease; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
        .ad-box-title { color:#64748b; font-size:0.72rem; font-weight:700; letter-spacing:0.9px; margin-bottom:16px; text-transform:uppercase; }

        .ad-inline-form { display:flex; flex-wrap:wrap; gap:10px; align-items:center; }
        .ad-input { background:#1e293b; border:1px solid #334155; border-radius:8px; color:#e2e8f0; font-family:'IBM Plex Sans',sans-serif; font-size:0.82rem; outline:none; padding:8px 14px; transition:border-color 0.2s; width:220px; }
        .ad-input:focus { border-color:#3b82f6; }
        .ad-input::placeholder { color:#475569; }
        select.ad-input { cursor:pointer; }

        .ad-btn { border:none; border-radius:8px; cursor:pointer; font-family:'IBM Plex Sans',sans-serif; font-size:0.82rem; font-weight:600; padding:8px 18px; transition:all 0.18s; white-space:nowrap; }
        .ad-btn.primary { background:#3b82f6; color:#fff; }
        .ad-btn.primary:hover:not(:disabled) { background:#2563eb; }
        .ad-btn.primary:disabled { opacity:0.6; cursor:not-allowed; }
        .ad-btn.ghost { background:transparent; border:1px solid #334155; color:#94a3b8; }
        .ad-btn.ghost:hover { border-color:#64748b; color:#e2e8f0; }

        .ad-add-form {}
        .ad-form-row { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:12px; }
        .ad-form-group { display:flex; flex-direction:column; gap:4px; }
        .ad-label { color:#64748b; font-size:0.66rem; font-weight:700; letter-spacing:0.7px; text-transform:uppercase; }
        .ad-form-group .ad-input { width:100%; box-sizing:border-box; }

        .ad-profile-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(190px,1fr)); gap:10px; margin-top:16px; }
        .ad-pf-field { background:#1e293b; border-radius:8px; padding:10px 14px; }
        .ad-pf-label { color:#475569; font-size:0.6rem; font-weight:700; letter-spacing:0.8px; margin-bottom:3px; }
        .ad-pf-val   { color:#e2e8f0; font-size:0.85rem; word-break:break-word; }

        .ad-chip { background:#1e293b; border:1px solid #334155; border-radius:6px; display:flex; align-items:center; gap:8px; font-size:0.75rem; padding:4px 10px; }
        .ad-chip span { color:#94a3b8; }
        .ad-chip strong { font-family:'JetBrains Mono',monospace; }
      `}</style>

      <div className="ad-greeting">
        <h1>Admin Console <span className="ad-role-chip">ADMIN</span></h1>
        <p>{user?.name} · {user?.registration_number}</p>
      </div>

      <div className="ad-main-tabs">
        {[["manage","⚙ Manage"],["logs","📋 Audit Logs"]].map(([id, label]) => (
          <button key={id} className={`ad-main-tab${tab===id?" active":""}`} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "manage" && (
        <div className="ad-manage-grid">
          <LookupPanel type="student" />
          <LookupPanel type="teacher" />
          <ApproveResult />
          <AddUser />
        </div>
      )}

      {tab === "logs" && <AuditLogs role="ADMIN" />}
    </div>
  );
}
