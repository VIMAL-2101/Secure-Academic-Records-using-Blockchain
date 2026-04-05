import { useEffect, useState } from "react";
import api from "../api";
function avg(obj = {}) {
  const vals = Object.values(obj).filter((v) => typeof v === "number");
  if (!vals.length) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function timeAgo(ts) {
  if (!ts) return "—";
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const ACTION_META = {
  MODIFY_MARKS:      { icon: "📝", label: "Marks Updated",     color: "#3b82f6" },
  UPDATE_ATTENDANCE: { icon: "📅", label: "Attendance Updated", color: "#8b5cf6" },
  APPROVE_RESULTS:   { icon: "✅", label: "Result Approved",    color: "#10b981" },
  LOGIN:             { icon: "🔐", label: "Login",              color: "#f59e0b" },
};

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="stat-card" style={{ "--accent": accent }}>
      <div className="stat-val">{value ?? "—"}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

function CourseBar({ course, mark, attendance }) {
  return (
    <div className="course-row">
      <div className="course-name">{course}</div>
      <div className="course-bars">
        <div className="bar-group">
          <div className="bar-label">Marks</div>
          <div className="bar-track">
            <div
              className="bar-fill marks-fill"
              style={{ width: `${mark ?? 0}%` }}
            />
          </div>
          <div className="bar-pct">{mark ?? "—"}</div>
        </div>
        <div className="bar-group">
          <div className="bar-label">Attendance</div>
          <div className="bar-track">
            <div
              className="bar-fill att-fill"
              style={{
                width: `${attendance ?? 0}%`,
                background:
                  (attendance ?? 0) < 75 ? "#ef4444" : "#10b981",
              }}
            />
          </div>
          <div className="bar-pct" style={{ color: (attendance ?? 0) < 75 ? "#f87171" : "#4ade80" }}>
            {attendance !== undefined ? `${attendance}%` : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineEvent({ event, index }) {
  const meta = ACTION_META[event.action_type] || { icon: "⚡", label: event.action_type, color: "#64748b" };
  return (
    <div className="tl-event" style={{ "--tl-delay": `${index * 50}ms`, "--tl-color": meta.color }}>
      <div className="tl-dot">{meta.icon}</div>
      <div className="tl-body">
        <div className="tl-title">{meta.label}</div>
        {event.action_type !== "LOGIN" && (
          <div className="tl-detail">
            {event.decision === "BLOCKED"
              ? <span style={{ color: "#f87171" }}>⛔ Blocked by compliance engine</span>
              : <span style={{ color: "#4ade80" }}>✓ Completed successfully</span>}
          </div>
        )}
        <div className="tl-time">{timeAgo(event.timestamp)}</div>
      </div>
      <div
        className="tl-badge"
        style={{
          background: event.decision === "BLOCKED" ? "#2b0d0d" : "#0d2b1a",
          color: event.decision === "BLOCKED" ? "#f87171" : "#4ade80",
          border: `1px solid ${event.decision === "BLOCKED" ? "#dc2626" : "#16a34a"}`,
        }}
      >
        {event.decision || "—"}
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const [user, setUser]         = useState(null);
  const [myLogs, setMyLogs]     = useState([]);
  const [tab, setTab]           = useState("overview");
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [meRes, logsRes] = await Promise.allSettled([
          api.get("/me"),
          Promise.resolve({ data: [] }),
        ]);
        if (meRes.status === "fulfilled") setUser(meRes.value.data);
        if (logsRes.status === "fulfilled") setMyLogs(logsRes.value.data);
      } catch {
        setError("Failed to load your profile.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Skeleton />;
  if (error)   return <div className="sd-error">{error}</div>;
  if (!user)   return null;
  const courses    = Array.from(new Set([...Object.keys(user.marks || {}), ...Object.keys(user.attendance || {})]));
  const avgMarks   = avg(user.marks);
  const avgAtt     = avg(user.attendance);
  const resultOk   = user.result_status === "APPROVED";
  const timeline = [
    ...Object.entries(user.marks || {}).map(([c, v]) => ({
      action_type: "MODIFY_MARKS", decision: "ALLOWED", timestamp: null,
      _label: `${c}: ${v}/100`,
    })),
    ...Object.entries(user.attendance || {}).map(([c, v]) => ({
      action_type: "UPDATE_ATTENDANCE", decision: v < 75 ? "BLOCKED" : "ALLOWED", timestamp: null,
      _label: `${c}: ${v}%`,
    })),
    ...(resultOk ? [{ action_type: "APPROVE_RESULTS", decision: "ALLOWED", timestamp: null }] : []),
  ].slice(0, 8);

  return (
    <div className="sd-wrap">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

        .sd-wrap {
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: #e2e8f0;
          max-width: 960px;
        }

        /* ── greeting ── */
        .sd-greeting {
          margin-bottom: 28px;
        }
        .sd-greeting h1 {
          font-size: 2rem;
          font-weight: 800;
          color: #f8fafc;
          letter-spacing: -0.8px;
          margin: 0 0 4px;
        }
        .sd-greeting p {
          color: #64748b;
          font-size: 0.85rem;
          margin: 0;
        }
        .sd-reg {
          font-family: 'JetBrains Mono', monospace;
          color: #3b82f6;
        }

        /* ── tabs ── */
        .sd-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 28px;
          background: #0f172a;
          border-radius: 10px;
          padding: 4px;
          width: fit-content;
        }
        .sd-tab {
          background: transparent;
          border: none;
          border-radius: 7px;
          color: #64748b;
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          padding: 7px 18px;
          transition: all 0.18s;
        }
        .sd-tab.active {
          background: #1e293b;
          color: #f8fafc;
        }

        /* ── stat cards ── */
        .sd-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          margin-bottom: 28px;
        }
        .stat-card {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-top: 3px solid var(--accent, #3b82f6);
          border-radius: 12px;
          padding: 18px 20px;
        }
        .stat-val {
          font-size: 2rem;
          font-weight: 800;
          color: #f8fafc;
          font-family: 'JetBrains Mono', monospace;
          line-height: 1;
        }
        .stat-label {
          color: #64748b;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.6px;
          margin-top: 6px;
          text-transform: uppercase;
        }
        .stat-sub {
          color: #94a3b8;
          font-size: 0.75rem;
          margin-top: 4px;
        }

        /* ── two-col layout ── */
        .sd-cols {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 20px;
        }
        @media (max-width: 768px) {
          .sd-cols { grid-template-columns: 1fr; }
        }

        /* ── section box ── */
        .sd-box {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 14px;
          padding: 20px 22px;
          margin-bottom: 0;
        }
        .sd-box-title {
          font-size: 0.78rem;
          font-weight: 700;
          color: #64748b;
          letter-spacing: 0.8px;
          margin-bottom: 16px;
          text-transform: uppercase;
        }

        /* ── course bars ── */
        .course-row {
          margin-bottom: 18px;
        }
        .course-row:last-child { margin-bottom: 0; }
        .course-name {
          font-weight: 600;
          font-size: 0.85rem;
          color: #cbd5e1;
          margin-bottom: 8px;
        }
        .course-bars { display: flex; flex-direction: column; gap: 6px; }
        .bar-group { display: flex; align-items: center; gap: 10px; }
        .bar-label {
          width: 70px;
          color: #475569;
          font-size: 0.68rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          flex-shrink: 0;
        }
        .bar-track {
          flex: 1;
          background: #1e293b;
          border-radius: 4px;
          height: 6px;
          overflow: hidden;
        }
        .bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.8s cubic-bezier(0.34,1.56,0.64,1);
        }
        .marks-fill { background: #3b82f6; }
        .bar-pct {
          color: #94a3b8;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem;
          min-width: 32px;
          text-align: right;
        }

        /* ── timeline ── */
        .tl-list {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .tl-event {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #0f172a;
          animation: fadeUp 0.3s ease both;
          animation-delay: var(--tl-delay);
          position: relative;
        }
        .tl-event:last-child { border-bottom: none; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tl-dot {
          background: #1e293b;
          border-radius: 8px;
          font-size: 1rem;
          height: 34px;
          width: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .tl-body { flex: 1; min-width: 0; }
        .tl-title {
          font-size: 0.82rem;
          font-weight: 600;
          color: #e2e8f0;
        }
        .tl-detail {
          font-size: 0.72rem;
          margin-top: 2px;
        }
        .tl-time {
          color: #475569;
          font-size: 0.68rem;
          margin-top: 3px;
          font-family: 'JetBrains Mono', monospace;
        }
        .tl-badge {
          border-radius: 20px;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.6px;
          padding: 3px 9px;
          text-transform: uppercase;
          flex-shrink: 0;
          align-self: center;
        }

        /* ── profile tab ── */
        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 480px) {
          .profile-grid { grid-template-columns: 1fr; }
        }
        .pf-field {
          background: #0f172a;
          border: 1px solid #1e293b;
          border-radius: 10px;
          padding: 14px 16px;
        }
        .pf-label {
          color: #475569;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.8px;
          margin-bottom: 4px;
          text-transform: uppercase;
        }
        .pf-val {
          color: #e2e8f0;
          font-size: 0.88rem;
          font-weight: 500;
        }
        .pf-val.mono {
          font-family: 'JetBrains Mono', monospace;
          color: #3b82f6;
        }

        /* ── result banner ── */
        .result-banner {
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding: 14px 18px;
        }
        .result-banner.approved {
          background: #0d2b1a;
          border: 1px solid #16a34a;
        }
        .result-banner.pending {
          background: #1c1a09;
          border: 1px solid #854d0e;
        }
        .result-icon { font-size: 1.4rem; }
        .result-text { font-size: 0.85rem; font-weight: 600; }

        .sd-error {
          background: #2b0d0d;
          border: 1px solid #7f1d1d;
          border-radius: 10px;
          color: #f87171;
          padding: 14px 18px;
        }

        /* ── skeleton ── */
        .skeleton-block {
          background: linear-gradient(90deg, #0f172a 25%, #1e293b 50%, #0f172a 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 10px;
        }
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div className="sd-greeting">
        <h1>Hey, {user.name?.split(" ")[0]} 👋</h1>
        <p>
          <span className="sd-reg">{user.registration_number}</span>
          {" · "}{user.department}{user.year ? ` · Year ${user.year}` : ""}
        </p>
      </div>

      <div className={`result-banner ${resultOk ? "approved" : "pending"}`}>
        <div className="result-icon">{resultOk ? "🎓" : "⏳"}</div>
        <div>
          <div className="result-text" style={{ color: resultOk ? "#4ade80" : "#fbbf24" }}>
            Result Status: {user.result_status || "PENDING"}
          </div>
          <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>
            {resultOk
              ? "Your academic result has been officially approved."
              : "Your result is awaiting admin approval."}
          </div>
        </div>
      </div>

      <div className="sd-tabs">
        {[["overview", "📊 Overview"], ["profile", "👤 Profile"]].map(([id, label]) => (
          <button
            key={id}
            className={`sd-tab${tab === id ? " active" : ""}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <div className="sd-stats">
            <StatCard
              label="Avg Marks"
              value={avgMarks !== null ? `${avgMarks}` : "—"}
              sub="out of 100"
              accent="#3b82f6"
            />
            <StatCard
              label="Avg Attendance"
              value={avgAtt !== null ? `${avgAtt}%` : "—"}
              sub={avgAtt !== null && avgAtt < 75 ? "Below 75%" : "On track"}
              accent={avgAtt !== null && avgAtt < 75 ? "#ef4444" : "#10b981"}
            />
            <StatCard
              label="Courses"
              value={courses.length}
              sub="enrolled"
              accent="#8b5cf6"
            />
            <StatCard
              label="Result"
              value={resultOk ? "✓" : "⏳"}
              sub={user.result_status || "PENDING"}
              accent={resultOk ? "#10b981" : "#f59e0b"}
            />
          </div>

          <div className="sd-cols">
            <div className="sd-box">
              <div className="sd-box-title">Course Breakdown</div>
              {courses.length === 0 ? (
                <div style={{ color: "#475569", fontSize: "0.85rem" }}>No course data yet.</div>
              ) : (
                courses.map((c) => (
                  <CourseBar
                    key={c}
                    course={c}
                    mark={user.marks?.[c]}
                    attendance={user.attendance?.[c]}
                  />
                ))
              )}
            </div>

            <div className="sd-box">
              <div className="sd-box-title">Recent Activity</div>
              {timeline.length === 0 ? (
                <div style={{ color: "#475569", fontSize: "0.85rem" }}>No activity recorded yet.</div>
              ) : (
                <div className="tl-list">
                  {timeline.map((ev, i) => (
                    <TimelineEvent key={i} event={ev} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {tab === "profile" && (
        <div>
          <div className="profile-grid">
            {[
              ["Full Name",            user.name,                  false],
              ["Registration No.",     user.registration_number,   true],
              ["Role",                 user.role,                  false],
              ["Department",           user.department || "—",     false],
              ["Year",                 user.year || "—",           false],
              ["Date of Birth",        user.dob || "—",            false],
              ["Phone",                user.phone || "—",          true],
              ["Address",              user.address || "—",        false],
              ["Gender",               user.gender || "—",         false],
              ["Result Status",        user.result_status || "—",  false],
            ].map(([label, val, mono]) => (
              <div key={label} className="pf-field">
                <div className="pf-label">{label}</div>
                <div className={`pf-val${mono ? " mono" : ""}`}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {[200, 100, 300, 200, 250].map((w, i) => (
        <div key={i} className="skeleton-block" style={{ height: w }} />
      ))}
      <style>{`
        .skeleton-block {
          background: linear-gradient(90deg,#0f172a 25%,#1e293b 50%,#0f172a 75%);
          background-size:200% 100%;
          animation:shimmer 1.4s infinite;
          border-radius:10px;
        }
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
      `}</style>
    </div>
  );
}
