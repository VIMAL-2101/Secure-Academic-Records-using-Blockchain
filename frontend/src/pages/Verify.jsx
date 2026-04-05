import { useState } from "react";
import api from "../api";

export default function Verify() {
  const [logId,   setLogId]   = useState("");
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleVerify = async () => {
    if (!logId.trim()) { setError("Please enter a Log ID."); return; }
    setLoading(true); setResult(null); setError("");
    try {
      const res  = await api.get(`/verify/${logId.trim()}`);
      const data = res.data;
      if (data.status === "NOT_FOUND") {
        setError("No log found with that ID.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Verification failed. Please check the Log ID and try again.");
    } finally {
      setLoading(false);
    }
  };

  const verified = result?.status === "VERIFIED";
  return (
    <div style={wrap}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
        .vf-wrap * { font-family:'DM Sans',sans-serif; box-sizing:border-box; }
        .vf-input {
          flex:1; padding:10px 14px; border-radius:8px;
          border:1px solid #334155; background:#1e293b;
          color:#e2e8f0; font-family:'JetBrains Mono',monospace;
          font-size:0.82rem; outline:none; transition:border-color 0.2s;
        }
        .vf-input:focus { border-color:#3b82f6; }
        .vf-input::placeholder { color:#475569; }
        .vf-btn {
          padding:10px 20px; border-radius:8px; border:none;
          background:#3b82f6; color:#fff; font-weight:700;
          cursor:pointer; white-space:nowrap; font-family:'DM Sans',sans-serif;
          font-size:0.85rem; transition:background 0.2s;
        }
        .vf-btn:hover:not(:disabled) { background:#2563eb; }
        .vf-btn:disabled { opacity:0.55; cursor:not-allowed; }
      `}</style>

      <div className="vf-wrap">
        <h2 style={{ color:"#f8fafc", marginBottom:4, fontWeight:700, fontSize:"1.4rem" }}>Verify Audit Log</h2>
        <p style={{ color:"#64748b", fontSize:"0.82rem", marginBottom:24, maxWidth:560 }}>
          Enter a Log ID to check its integrity. The system recalculates the cryptographic
          hash and compares it against the blockchain record.
        </p>

        <div style={card}>
          <label style={lbl}>Log ID</label>
          <div style={{ display:"flex", gap:10 }}>
            <input className="vf-input" placeholder="e.g. cb4f0a63-45ae-47a2-8626-d46bcf044187"
              value={logId}
              onChange={(e) => { setLogId(e.target.value); setResult(null); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()} />
            <button className="vf-btn" onClick={handleVerify} disabled={loading}>
              {loading ? "Checking…" : "Verify"}
            </button>
          </div>
          {error && (
            <div style={{ color:"#f87171", fontSize:"0.8rem", marginTop:10,
              background:"#2b0d0d", border:"1px solid #7f1d1d", borderRadius:6, padding:"8px 12px" }}>
              {error}
            </div>
          )}
        </div>

        {result && (
          <div style={{ ...resultCard, borderColor: verified ? "#16a34a" : "#dc2626", marginTop:20 }}>

            <div style={{
              background: verified ? "#0d2b1a" : "#2b0d0d",
              padding:"20px 24px", display:"flex", alignItems:"center", gap:16,
              color: verified ? "#4ade80" : "#f87171",
            }}>
              <span style={{ fontSize:32 }}>{verified ? "✓" : "✗"}</span>
              <div>
                <div style={{ fontSize:"1.3rem", fontWeight:700 }}>{result.status}</div>
                <div style={{ fontSize:"0.8rem", opacity:0.8, marginTop:2 }}>
                  {verified
                    ? "This log has not been tampered with."
                    : "This log may have been modified or corrupted."}
                </div>
              </div>
            </div>

            <div style={{ padding:"16px 24px", display:"flex", flexDirection:"column", gap:12, borderBottom:"1px solid #1e293b" }}>
              <CheckRow label="Integrity Check"  value={result.integrity_check}  desc="Recalculated hash matches stored hash" />
              <CheckRow label="Blockchain Check" value={result.blockchain_check} desc="Stored hash matches on-chain record" />
            </div>

            <div style={{ padding:"16px 24px" }}>
              <div style={{ color:"#475569", fontSize:"0.68rem", fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase", marginBottom:12 }}>
                Hash Details
              </div>
              <HashRow label="Stored Hash"       value={result.details?.local_hash} />
              <HashRow label="Recalculated Hash" value={result.details?.recalculated_hash} />
              <HashRow label="Blockchain Hash"   value={result.details?.blockchain_hash} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckRow({ label, value, desc }) {
  const pass = value === "PASS";
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid #0f172a" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{
          width:28, height:28, borderRadius:"50%", flexShrink:0,
          background: pass ? "#0d2b1a" : "#2b0d0d",
          color:      pass ? "#4ade80" : "#f87171",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:"0.85rem", fontWeight:700,
        }}>
          {pass ? "✓" : "✗"}
        </div>
        <div>
          <div style={{ color:"#e2e8f0", fontSize:"0.85rem", fontWeight:600 }}>{label}</div>
          <div style={{ color:"#475569", fontSize:"0.72rem", marginTop:1 }}>{desc}</div>
        </div>
      </div>
      <div style={{
        fontSize:"0.72rem", fontWeight:700, padding:"3px 10px", borderRadius:20,
        background: pass ? "#0d2b1a" : "#2b0d0d",
        color:      pass ? "#4ade80" : "#f87171",
        border:     `1px solid ${pass ? "#16a34a" : "#dc2626"}`,
      }}>
        {value}
      </div>
    </div>
  );
}

function HashRow({ label, value }) {
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ color:"#475569", fontSize:"0.62rem", fontWeight:700, letterSpacing:"0.8px", textTransform:"uppercase", marginBottom:3 }}>
        {label}
      </div>
      <div style={{
        fontFamily:"'JetBrains Mono',monospace", fontSize:"0.72rem",
        color: value ? "#94a3b8" : "#334155", wordBreak:"break-all",
      }}>
        {value || "Not available"}
      </div>
    </div>
  );
}
const wrap       = { padding:24 };
const card       = { background:"#0f172a", border:"1px solid #1e293b", borderRadius:14, padding:"20px 22px", maxWidth:580 };
const lbl        = { fontSize:"0.68rem", color:"#64748b", fontWeight:700, letterSpacing:"0.7px", textTransform:"uppercase", display:"block", marginBottom:8 };
const resultCard = { background:"#0f172a", border:"1px solid", borderRadius:14, overflow:"hidden", maxWidth:580 };
