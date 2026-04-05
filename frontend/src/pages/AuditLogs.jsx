import { useState, useEffect, useCallback } from "react";
import api from "../api";

const DECISION_COLORS = {
  ALLOWED: { bg: "#0d2b1a", border: "#16a34a", dot: "#22c55e" },
  BLOCKED: { bg: "#2b0d0d", border: "#dc2626", dot: "#ef4444" },
};

const ACTION_LABELS = {
  MODIFY_MARKS:      "Marks Modified",
  UPDATE_ATTENDANCE: "Attendance Updated",
  APPROVE_RESULTS:   "Result Approved",
  LOGIN:             "Login",
};

function LogRow({ log, index }) {
  const colors = DECISION_COLORS[log.decision] || DECISION_COLORS.ALLOWED;
  const ts = log.timestamp
    ? new Date(log.timestamp).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
      })
    : "—";

  return (
    <div
      className="log-row"
      style={{
        "--row-delay": `${Math.min(index, 20) * 40}ms`,
        borderLeft: `3px solid ${colors.border}`,
        background:  colors.bg,
      }}
    >
      <div className="log-top">
        <span className="log-action">{ACTION_LABELS[log.action_type] || log.action_type}</span>
        <span
          className="log-badge"
          style={{ background: colors.border, color: "#fff" }}
        >
          <span className="badge-dot" style={{ background: colors.dot }} />
          {log.decision}
        </span>
      </div>

      <div className="log-meta">
        <span className="meta-item">
          <span className="meta-label">Actor</span>
          <span className="meta-val">{log.actor}</span>
        </span>
        {log.target && (
          <span className="meta-item">
            <span className="meta-label">Target</span>
            <span className="meta-val">{log.target}</span>
          </span>
        )}
        <span className="meta-item">
          <span className="meta-label">Role</span>
          <span className="meta-val">{log.role}</span>
        </span>
        {log.rule_id && log.rule_id !== "N/A" && (
          <span className="meta-item">
            <span className="meta-label">Rule</span>
            <span className="meta-val">{log.rule_id}</span>
          </span>
        )}
        <span className="meta-item">
          <span className="meta-label">Time</span>
          <span className="meta-val">{ts}</span>
        </span>
      </div>

      {log.log_id && (
        <div className="log-id">
          <span className="meta-label">Log ID</span>
          <code>{log.log_id}</code>
        </div>
      )}

      {log.blockchain_tx && (
        <div className="log-chain">
          <span className="chain-dot" />
          <span className="meta-label">On-chain TX</span>
          <code className="chain-tx">{log.blockchain_tx}</code>
        </div>
      )}

      {log.log_status && (
        <div className="log-chain" style={{ marginTop: 2 }}>
          <span
            className="chain-dot"
            style={{ background: log.log_status === "ON_CHAIN" ? "#22c55e" : "#f59e0b" }}
          />
          <span className="meta-label">
            {log.log_status === "ON_CHAIN" ? "Blockchain verified" : "Off-chain (fallback)"}
          </span>
        </div>
      )}
    </div>
  );
}

export default function AuditLogs({ role }) {
  const [logs,           setLogs]           = useState([]);
  const [search,         setSearch]         = useState("");
  const [query,          setQuery]          = useState("");
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState("");
  const [filterDecision, setFilterDecision] = useState("ALL");

  const fetchLogs = useCallback(async (actorQuery) => {
    setLoading(true);
    setError("");
    try {
      const params = actorQuery ? { actor: actorQuery } : {};
      const res = await api.get("/audit-logs", { params });
      setLogs(res.data);
    } catch (e) {
      setError(e?.response?.data?.detail || "Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(query);
  }, [query, fetchLogs]);

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(search.trim());
  };

  const displayed = filterDecision === "ALL"
    ? logs
    : logs.filter((l) => l.decision === filterDecision);

  const searchPlaceholder = role === "ADMIN"
    ? "Search by reg. number — student or teacher…"
    : "Search by student registration number…";

  return (
    <div className="audit-wrap">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Sora:wght@400;500;600;700&display=swap');

        .audit-wrap { font-family:'Sora',sans-serif; color:#e2e8f0; }

        .audit-header {
          display:flex; align-items:flex-end; justify-content:space-between;
          margin-bottom:24px; gap:16px; flex-wrap:wrap;
        }
        .audit-title { font-size:1.6rem; font-weight:700; color:#f8fafc; letter-spacing:-0.5px; }
        .audit-subtitle { font-size:0.78rem; color:#64748b; margin-top:4px; }

        .search-row { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px; align-items:center; }
        .search-input {
          background:#0f172a; border:1px solid #1e293b; border-radius:8px;
          color:#e2e8f0; font-family:'JetBrains Mono',monospace; font-size:0.8rem;
          padding:8px 14px; width:280px; outline:none; transition:border-color 0.2s;
        }
        .search-input:focus { border-color:#3b82f6; }
        .search-input::placeholder { color:#475569; }

        .search-btn {
          background:#3b82f6; border:none; border-radius:8px; color:#fff;
          cursor:pointer; font-family:'Sora',sans-serif; font-size:0.78rem;
          font-weight:600; padding:8px 18px; transition:background 0.2s;
        }
        .search-btn:hover { background:#2563eb; }

        .ghost-btn {
          background:transparent; border:1px solid #334155; border-radius:8px;
          color:#94a3b8; cursor:pointer; font-size:0.78rem; padding:8px 14px;
          transition:all 0.2s;
        }
        .ghost-btn:hover { border-color:#64748b; color:#e2e8f0; }

        .filter-tabs { display:flex; gap:6px; }
        .filter-tab {
          background:transparent; border:1px solid #1e293b; border-radius:6px;
          color:#64748b; cursor:pointer; font-size:0.72rem; font-weight:600;
          letter-spacing:0.5px; padding:5px 12px; text-transform:uppercase; transition:all 0.15s;
        }
        .filter-tab.active { background:#1e293b; border-color:#334155; color:#e2e8f0; }

        .audit-stats { display:flex; gap:12px; margin-bottom:20px; flex-wrap:wrap; }
        .stat-chip {
          background:#0f172a; border:1px solid #1e293b; border-radius:8px;
          padding:8px 16px; font-size:0.78rem;
        }
        .stat-chip strong {
          display:block; font-size:1.2rem; font-weight:700; color:#f8fafc;
          font-family:'JetBrains Mono',monospace;
        }
        .stat-chip span { color:#64748b; }

        .log-list { display:flex; flex-direction:column; gap:10px; }
        .log-row {
          border-radius:10px; padding:14px 18px;
          animation:slideIn 0.3s ease both; animation-delay:var(--row-delay);
          transition:transform 0.15s;
        }
        .log-row:hover { transform:translateX(3px); }
        @keyframes slideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

        .log-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
        .log-action { font-weight:600; font-size:0.9rem; color:#f1f5f9; }
        .log-badge {
          display:flex; align-items:center; gap:5px; border-radius:20px;
          font-size:0.68rem; font-weight:700; letter-spacing:0.8px;
          padding:3px 10px; text-transform:uppercase;
        }
        .badge-dot { border-radius:50%; display:inline-block; height:6px; width:6px; }

        .log-meta { display:flex; flex-wrap:wrap; gap:16px; }
        .meta-item { display:flex; flex-direction:column; gap:1px; }
        .meta-label { color:#475569; font-size:0.62rem; font-weight:600; letter-spacing:0.8px; text-transform:uppercase; }
        .meta-val { color:#cbd5e1; font-family:'JetBrains Mono',monospace; font-size:0.78rem; }

        .log-id {
          display:flex; align-items:center; gap:8px;
          margin-top:10px; padding-top:10px;
          border-top:1px solid rgba(255,255,255,0.05);
        }
        .log-id code { color:#64748b; font-family:'JetBrains Mono',monospace; font-size:0.7rem; }

        .log-chain { display:flex; align-items:center; gap:8px; margin-top:6px; }
        .chain-dot { background:#f59e0b; border-radius:50%; height:6px; width:6px; flex-shrink:0; }
        .chain-tx {
          color:#92400e; font-family:'JetBrains Mono',monospace; font-size:0.68rem;
          overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:300px;
        }

        .audit-empty { text-align:center; padding:60px 0; color:#475569; }
        .audit-empty .empty-icon { font-size:2.5rem; margin-bottom:12px; }
        .audit-empty p { font-size:0.9rem; }

        .audit-error {
          background:#2b0d0d; border:1px solid #7f1d1d; border-radius:10px;
          color:#f87171; font-size:0.85rem; padding:14px 18px; margin-bottom:16px;
        }

        .loading-pulse { display:flex; flex-direction:column; gap:10px; }
        .pulse-bar {
          background:linear-gradient(90deg,#0f172a 25%,#1e293b 50%,#0f172a 75%);
          background-size:200% 100%; animation:pulse 1.4s infinite;
          border-radius:8px; height:72px;
        }
        @keyframes pulse { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      <div className="audit-header">
        <div>
          <div className="audit-title">Audit Logs</div>
          <div className="audit-subtitle">
            {role === "ADMIN"
              ? "All system activity — students & teachers"
              : "Your actions + all student activity logs"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <div className="filter-tabs">
            {["ALL", "ALLOWED", "BLOCKED"].map((f) => (
              <button
                key={f}
                className={`filter-tab${filterDecision === f ? " active" : ""}`}
                onClick={() => setFilterDecision(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            className="ghost-btn"
            onClick={() => fetchLogs(query)}
            disabled={loading}
            title="Refresh logs"
          >
            {loading ? "⟳" : "↻ Refresh"}
          </button>
        </div>
      </div>

      <form className="search-row" onSubmit={handleSearch}>
        <input
          className="search-input"
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="search-btn" type="submit">Search</button>
        {query && (
          <button
            className="ghost-btn"
            type="button"
            onClick={() => { setSearch(""); setQuery(""); }}
          >
            ✕ Clear
          </button>
        )}
      </form>

      {!loading && !error && (
        <div className="audit-stats">
          <div className="stat-chip">
            <strong>{displayed.length}</strong>
            <span>Total</span>
          </div>
          <div className="stat-chip">
            <strong style={{ color: "#4ade80" }}>
              {displayed.filter((l) => l.decision === "ALLOWED").length}
            </strong>
            <span>Allowed</span>
          </div>
          <div className="stat-chip">
            <strong style={{ color: "#f87171" }}>
              {displayed.filter((l) => l.decision === "BLOCKED").length}
            </strong>
            <span>Blocked</span>
          </div>
          {query && (
            <div className="stat-chip">
              <strong style={{ color: "#60a5fa" }}>{query}</strong>
              <span>Filtered by</span>
            </div>
          )}
        </div>
      )}

      {error && <div className="audit-error"> {error}</div>}

      {loading ? (
        <div className="loading-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="pulse-bar" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="audit-empty">
          <div className="empty-icon">🔍</div>
          <p>
            {query
              ? `No logs found for registration number "${query}".`
              : "No audit logs recorded yet."}
          </p>
          {query && (
            <p style={{ fontSize: "0.78rem", marginTop: 6, color: "#334155" }}>
              Make sure the reg. number matches exactly what's stored in the database.
            </p>
          )}
        </div>
      ) : (
        <div className="log-list">
          {displayed.map((log, i) => (
            <LogRow key={log.log_id || i} log={log} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
