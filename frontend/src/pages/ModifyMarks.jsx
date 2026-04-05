import { useState } from "react";
import api from "../api";

const gradeColor = (m) => {
  if (m >= 90) return "#166534";
  if (m >= 75) return "#15803d";
  if (m >= 60) return "#92400e";
  return "#991b1b";
};
const gradeLabel = (m) => {
  if (m >= 90) return "O";
  if (m >= 75) return "A";
  if (m >= 60) return "B";
  if (m >= 50) return "C";
  return "F";
};

export default function ModifyMarks() {
  const [reg,     setReg]     = useState("");
  const [course,  setCourse]  = useState("");
  const [marks,   setMarks]   = useState("");
  const [status,  setStatus]  = useState(null);
  const [loading, setLoading] = useState(false);

  function showStatus(type, timeout = 4000) {
    setStatus(type);
    setTimeout(() => setStatus(null), timeout);
  }

  const handleSubmit = async () => {
    if (!reg || !course || marks === "") {
      showStatus("error");
      return;
    }
    const m = Number(marks);
    if (isNaN(m) || m < 0 || m > 100) {
      showStatus("error");
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const res = await api.post("/modify-marks", {
        registration_number: Number(reg),
        course: course.toUpperCase(),
        marks: m,
      });
      const data = res.data;
      if (data.status === "BLOCKED") {
        showStatus("blocked");
      } else {
        showStatus("success");
        setCourse("");
        setMarks("");
      }
    } catch {
      showStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const marksNum = Number(marks);
  const validPreview = marks !== "" && !isNaN(marksNum) && marksNum >= 0 && marksNum <= 100;

  return (
    <div style={wrap}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
        .mm-wrap * { font-family:'DM Sans',sans-serif; box-sizing:border-box; }
        .mm-input {
          width:100%; padding:10px 14px; border-radius:8px;
          border:1px solid #334155; background:#1e293b; color:#e2e8f0;
          font-size:0.88rem; outline:none; transition:border-color 0.2s;
        }
        .mm-input:focus { border-color:#3b82f6; }
        .mm-input::placeholder { color:#475569; }
        .mm-btn {
          width:100%; margin-top:18px; padding:11px; border-radius:8px;
          border:none; background:#3b82f6; color:#fff; font-weight:700;
          font-size:0.9rem; cursor:pointer; transition:background 0.2s;
          font-family:'DM Sans',sans-serif;
        }
        .mm-btn:hover:not(:disabled) { background:#2563eb; }
        .mm-btn:disabled { opacity:0.55; cursor:not-allowed; }
        .mm-toast {
          border-radius:8px; font-size:0.85rem; font-weight:600;
          padding:11px 16px; margin-top:14px;
          display:flex; align-items:center; gap:8px;
          animation:toastIn 0.2s ease;
        }
        @keyframes toastIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:none} }
      `}</style>

      <div className="mm-wrap">
        <h2 style={{ color:"#f8fafc", marginBottom:4, fontWeight:700, fontSize:"1.4rem" }}>Modify Marks</h2>
        <p style={{ color:"#64748b", fontSize:"0.82rem", marginBottom:24 }}>
          Update a student's marks for a specific course.
        </p>

        <div style={card}>
          <div style={fieldGroup}>
            <label style={lbl}>Registration Number</label>
            <input className="mm-input" placeholder="e.g. 61781" value={reg}
              onChange={(e) => { setReg(e.target.value); setStatus(null); }} />
          </div>

          <div style={fieldGroup}>
            <label style={lbl}>Course Code</label>
            <input className="mm-input" placeholder="e.g. CSE401" value={course}
              onChange={(e) => { setCourse(e.target.value); setStatus(null); }} />
          </div>

          <div style={fieldGroup}>
            <label style={lbl}>New Marks (0 – 100)</label>
            <input className="mm-input" type="number" placeholder="0 – 100"
              min={0} max={100} value={marks}
              onChange={(e) => { setMarks(e.target.value); setStatus(null); }} />
          </div>

          {validPreview && (
            <div style={preview}>
              <span style={{ color:"#64748b", fontSize:"0.8rem" }}>Grade preview:</span>
              <span style={{
                background: gradeColor(marksNum), color:"#fff",
                borderRadius:6, padding:"2px 10px", fontSize:"0.78rem", fontWeight:700,
              }}>
                {gradeLabel(marksNum)}
              </span>
              <span style={{ color:"#e2e8f0", fontSize:"0.85rem", fontFamily:"'JetBrains Mono',monospace" }}>
                {marksNum} / 100
              </span>
            </div>
          )}

          <button className="mm-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Updating…" : "Update Marks"}
          </button>

          {status === "success" && (
            <div className="mm-toast" style={{ background:"#0d2b1a", border:"1px solid #16a34a", color:"#4ade80" }}>
              ✓ Done — marks updated successfully.
            </div>
          )}
          {status === "blocked" && (
            <div className="mm-toast" style={{ background:"#2b0d0d", border:"1px solid #dc2626", color:"#f87171" }}>
              ✗ Blocked — this action was denied by the compliance engine.
            </div>
          )}
          {status === "error" && (
            <div className="mm-toast" style={{ background:"#1c1a09", border:"1px solid #854d0e", color:"#fbbf24" }}>
              Check all fields — registration number, course, and marks (0–100) are required.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const wrap       = { padding: 24 };
const card       = { background:"#0f172a", border:"1px solid #1e293b", borderRadius:14, padding:"24px", maxWidth:460, display:"flex", flexDirection:"column", gap:14 };
const fieldGroup = { display:"flex", flexDirection:"column", gap:5 };
const lbl        = { fontSize:"0.68rem", color:"#64748b", fontWeight:700, letterSpacing:"0.7px", textTransform:"uppercase" };
const preview    = { display:"flex", alignItems:"center", gap:10, padding:"8px 0" };
