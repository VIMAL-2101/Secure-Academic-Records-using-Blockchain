import { useState } from "react";
import api from "../api";

const ROLES = ["STUDENT", "TEACHER", "ADMIN"];

const defaultForm = {
  registration_number: "",
  name: "",
  password: "",
  role: "STUDENT",
  department: "",
  year: "",
  phone: "",
  address: "",
  dob: "",
  gender: "",
};

export default function AdminPanel({ user }) {
  const [form, setForm]     = useState(defaultForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  if (user?.role !== "ADMIN") {
    return <div style={{ padding: 24, color: "#e53935" }}>⛔ Access denied. Admins only.</div>;
  }

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    if (!form.registration_number || !form.name || !form.password || !form.role) {
      setResult({ status: "ERROR", message: "Registration number, name, password and role are required." });
      return;
    }
    setLoading(true); setResult(null);
    try {
      const res = await api.post("/add-user", {
        ...form,
        registration_number: Number(form.registration_number),
        year: form.year ? Number(form.year) : undefined,
      });
      setResult(res.data);
      if (res.data.status === "SUCCESS") setForm(defaultForm);
    } catch (err) {
      setResult({ status: "ERROR", message: err?.response?.data?.detail || "Failed to add user." });
    }
    setLoading(false);
  };

  const isStudent = form.role === "STUDENT";

  return (
    <div style={wrap}>
      <h2 style={{ marginBottom: 4 }}>Add New User</h2>
      <p style={sub}>Only admins can create new students, teachers, or admins.</p>

      <div style={formCard}>
        {/* Role selector */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {ROLES.map(r => (
            <button key={r} style={{ ...roleBtn, ...(form.role === r ? roleBtnActive : {}) }}
              onClick={() => set("role", r)}>{r}</button>
          ))}
        </div>

        <Row label="Registration Number *">
          <input style={inputStyle} type="number" placeholder="e.g. 20210051"
            value={form.registration_number} onChange={e => set("registration_number", e.target.value)} />
        </Row>

        <Row label="Full Name *">
          <input style={inputStyle} placeholder="e.g. John Doe"
            value={form.name} onChange={e => set("name", e.target.value)} />
        </Row>

        <Row label="Password *">
          <input style={inputStyle} type="password" placeholder="Set a password"
            value={form.password} onChange={e => set("password", e.target.value)} />
        </Row>

        <Row label="Department">
          <input style={inputStyle} placeholder="e.g. CSE"
            value={form.department} onChange={e => set("department", e.target.value)} />
        </Row>

        {isStudent && (
          <>
            <Row label="Year">
              <input style={inputStyle} type="number" min={1} max={4} placeholder="1–4"
                value={form.year} onChange={e => set("year", e.target.value)} />
            </Row>
            <Row label="Date of Birth">
              <input style={inputStyle} type="date"
                value={form.dob} onChange={e => set("dob", e.target.value)} />
            </Row>
            <Row label="Gender">
              <select style={inputStyle} value={form.gender} onChange={e => set("gender", e.target.value)}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </Row>
            <Row label="Phone">
              <input style={inputStyle} placeholder="e.g. 9000000000"
                value={form.phone} onChange={e => set("phone", e.target.value)} />
            </Row>
            <Row label="Address">
              <input style={inputStyle} placeholder="e.g. Chennai, Tamil Nadu"
                value={form.address} onChange={e => set("address", e.target.value)} />
            </Row>
          </>
        )}

        <button style={{ ...btn, opacity: loading ? 0.7 : 1, marginTop: 8 }}
          onClick={handleSubmit} disabled={loading}>
          {loading ? "Adding..." : `➕ Add ${form.role}`}
        </button>

        {result && (
          <div style={resultBox(result.status)}>
            <p style={{ color: resultColor(result.status), margin: 0, fontWeight: 600, fontSize: 13 }}>
              {result.status}
            </p>
            <p style={{ color: "#ccc", margin: "4px 0 0", fontSize: 13 }}>{result.message}</p>
          </div>
        )}
      </div>

      <div style={ruleNote}>
        <span style={{ color: "#e53935", fontSize: 12 }}> ADMIN ONLY</span>
        <span style={{ color: "#666", fontSize: 12, marginLeft: 8 }}>
        </span>
      </div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

const resultColor = s => s === "SUCCESS" ? "#4CAF50" : s === "BLOCKED" ? "#fbc02d" : "#e53935";
const resultBox = s => ({ marginTop: 14, padding: "12px 16px", borderRadius: 8,
  border: `1px solid ${resultColor(s)}`,
  background: s === "SUCCESS" ? "#1b3a1f" : s === "BLOCKED" ? "#3a2e00" : "#3a1b1b" });

const wrap     = { padding: 24 };
const sub      = { color: "#888", fontSize: 13, marginBottom: 24 };
const formCard = { background: "#1e1e1e", padding: 24, borderRadius: 10, maxWidth: 480 };
const labelStyle = { fontSize: 12, color: "#aaa", marginBottom: 4, display: "block" };
const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid #444", background: "#2c2c2c", color: "white", fontSize: 14, boxSizing: "border-box" };
const btn      = { width: "100%", padding: 11, borderRadius: 8, border: "none", background: "#4CAF50", color: "white", fontWeight: 600, cursor: "pointer", fontSize: 14 };
const roleBtn  = { flex: 1, padding: "8px", borderRadius: 6, border: "1px solid #444", background: "transparent", color: "#888", cursor: "pointer", fontSize: 13 };
const roleBtnActive = { background: "#4CAF50", color: "white", border: "1px solid #4CAF50" };
const ruleNote = { marginTop: 16, padding: "10px 14px", borderRadius: 8, border: "1px solid #333", background: "#1a1a1a", maxWidth: 480 };
