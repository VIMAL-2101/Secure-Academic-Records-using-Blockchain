import { useState } from "react";
import api from "../api";

export default function Approve() {
  const [reg,      setReg]      = useState("");
  const [student,  setStudent]  = useState(null);
  const [fetching, setFetching] = useState(false);
  const [fetchErr, setFetchErr] = useState("");
  const [status,   setStatus]   = useState(null)
  const [loading,  setLoading]  = useState(false);

  function showStatus(type) {
    setStatus(type);
    setTimeout(() => setStatus(null), 4000);
  }

  const fetchStudent = async () => {
    if (!reg.trim()) return;
    setFetching(true);
    setStudent(null);
    setStatus(null);
    setFetchErr("");
    try {
      const res = await api.get(`/student/${reg.trim()}`);
      setStudent(res.data);
    } catch (err) {
      setFetchErr(err?.response?.data?.detail || "Student not found.");
    } finally {
      setFetching(false);
    }
  };

  const handleApprove = async () => {
    if (!reg) return;
    setLoading(true);
    setStatus(null);
    try {
      const res = await api.post("/approve-result", {
        registration_number: Number(reg),
      });
      const data = res.data;
      if (data.status === "BLOCKED") {
        showStatus("blocked");
      } else {
        showStatus("success");
        setStudent((prev) => prev ? { ...prev, result_status: "APPROVED" } : prev);
      }
    } catch {
      showStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const avgMarks = student?.marks && Object.values(student.marks).length > 0
    ? (Object.values(student.marks).reduce((a, b) => a + b, 0) / Object.values(student.marks).length).toFixed(1)
    : null;

  return (
    <div style={wrap}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
        .ap-wrap * { font-family:'DM Sans',sans-serif; box-sizing:border-box; }
        .ap-input {
          padding:10px 14px; border-radius:8px; border:1px solid #334155;
          background:#1e293b; color:#e2e8f0; font-size:0.88rem; outline:none;
          transition:border-color 0.2s; flex:1;
        }
        .ap-input:focus { border-color:#3b82f6; }
        .ap-input::placeholder { color:#475569; }
        .ap-toast {
          border-radius:8px; font-size:0.85rem; font-weight:600;
          padding:11px 16px; margin-top:14px;
          display:flex; align-items:center; gap:8px;
          animation:toastIn 0.2s ease;
        }
        @keyframes toastIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:none} }
      `}</style>

      <div className="ap-wrap">
        <h2 style={{ color:"#f8fafc", marginBottom:4, fontWeight:700, fontSize:"1.4rem" }}>Approve Results</h2>
        <p style={{ color:"#64748b", fontSize:"0.82rem", marginBottom:24 }}>
          Look up a student and approve their final academic result.
        </p>

        <div style={card}>
          <label style={lbl}>Student Registration Number</label>
          <div style={{ display:"flex", gap:10 }}>
            <input className="ap-input" placeholder="e.g. 61781" value={reg}
              onChange={(e) => { setReg(e.target.value); setStudent(null); setStatus(null); setFetchErr(""); }}
              onKeyDown={(e) => e.key === "Enter" && fetchStudent()} />
            <button style={searchBtn} onClick={fetchStudent} disabled={fetching}>
              {fetching ? "…" : "Look Up"}
            </button>
          </div>
          {fetchErr && (
            <div style={{ color:"#f87171", fontSize:"0.8rem", marginTop:8,
              background:"#2b0d0d", border:"1px solid #7f1d1d", borderRadius:6, padding:"8px 12px" }}>
              {fetchErr}
            </div>
          )}
        </div>

        {student && (
          <div style={{ ...card, marginTop:16 }}>

            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:4 }}>
              <div style={avatar}>{student.name?.[0] || "?"}</div>
              <div style={{ flex:1 }}>
                <div style={{ color:"#f8fafc", fontWeight:700, fontSize:"1rem" }}>{student.name}</div>
                <div style={{ color:"#64748b", fontSize:"0.78rem", marginTop:2 }}>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", color:"#3b82f6" }}>
                    #{student.registration_number}
                  </span>
                  {student.department && <span> · {student.department}</span>}
                  {student.year && <span> · Year {student.year}</span>}
                </div>
              </div>
              <div style={{
                fontSize:"0.72rem", fontWeight:700, padding:"3px 10px", borderRadius:20,
                background: student.result_status === "APPROVED" ? "#0d2b1a" : "#1c1a09",
                color:      student.result_status === "APPROVED" ? "#4ade80" : "#fbbf24",
                border:     `1px solid ${student.result_status === "APPROVED" ? "#16a34a" : "#854d0e"}`,
              }}>
                {student.result_status || "PENDING"}
              </div>
            </div>

            {student.marks && Object.keys(student.marks).length > 0 && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:8 }}>
                {Object.entries(student.marks).map(([c, m]) => (
                  <div key={c} style={markChip}>
                    <span style={{ fontSize:"0.68rem", color:"#64748b" }}>{c}</span>
                    <span style={{ fontWeight:700, fontSize:"0.9rem", fontFamily:"'JetBrains Mono',monospace", color:"#e2e8f0" }}>{m}</span>
                  </div>
                ))}
              </div>
            )}

            {avgMarks && (
              <div style={{ color:"#64748b", fontSize:"0.78rem", marginTop:4 }}>
                Average: <strong style={{ color:"#e2e8f0", fontFamily:"'JetBrains Mono',monospace" }}>{avgMarks}</strong> / 100
              </div>
            )}

            {student.result_status !== "APPROVED" ? (
              <button
                style={{ ...approveBtn, opacity: loading ? 0.6 : 1, marginTop:14 }}
                onClick={handleApprove}
                disabled={loading}
              >
                {loading ? "Approving…" : "✓ Approve Result"}
              </button>
            ) : (
              <div style={{ color:"#4ade80", fontSize:"0.85rem", fontWeight:600, marginTop:14,
                padding:"10px 14px", background:"#0d2b1a", borderRadius:8, border:"1px solid #16a34a" }}>
                ✓ Result already approved
              </div>
            )}

            {status === "success" && (
              <div className="ap-toast" style={{ background:"#0d2b1a", border:"1px solid #16a34a", color:"#4ade80" }}>
                ✓ Done — result approved successfully.
              </div>
            )}
            {status === "blocked" && (
              <div className="ap-toast" style={{ background:"#2b0d0d", border:"1px solid #dc2626", color:"#f87171" }}>
                ✗ Blocked — this action was denied by the compliance engine.
              </div>
            )}
            {status === "error" && (
              <div className="ap-toast" style={{ background:"#1c1a09", border:"1px solid #854d0e", color:"#fbbf24" }}>
                Something went wrong. Please try again.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const wrap      = { padding:24 };
const card      = { background:"#0f172a", border:"1px solid #1e293b", borderRadius:14, padding:"20px 22px", maxWidth:500 };
const lbl       = { fontSize:"0.68rem", color:"#64748b", fontWeight:700, letterSpacing:"0.7px", textTransform:"uppercase", display:"block", marginBottom:8 };
const searchBtn = { padding:"10px 18px", borderRadius:8, border:"none", background:"#3b82f6", color:"#fff", fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", fontFamily:"'DM Sans',sans-serif", fontSize:"0.85rem" };
const avatar    = { width:42, height:42, borderRadius:"50%", background:"#1e293b", border:"1px solid #334155", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem", fontWeight:700, color:"#94a3b8", flexShrink:0 };
const markChip  = { background:"#1e293b", border:"1px solid #334155", borderRadius:8, padding:"6px 12px", display:"flex", flexDirection:"column", gap:2, minWidth:60, alignItems:"center" };
const approveBtn = { width:"100%", padding:"11px", borderRadius:8, border:"none", background:"#16a34a", color:"#fff", fontWeight:700, fontSize:"0.9rem", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" };
