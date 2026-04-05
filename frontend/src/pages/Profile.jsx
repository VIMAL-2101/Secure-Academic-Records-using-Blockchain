import { useState } from "react";
import api from "../api";
export default function Profile({ user }) {
  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>My Profile</h2>

      <div style={grid}>
        <div style={{ ...card, gridColumn: "span 2" }}>
          <div style={profileGrid}>
            <div>
              <p style={fieldLabel}>Name</p>
              <p style={fieldValue}>{user.name || "—"}</p>
            </div>

            <div>
              <p style={fieldLabel}>Registration Number</p>
              <p style={fieldValue}>{user.registration_number}</p>
            </div>

            <div>
              <p style={fieldLabel}>Department</p>
              <p style={fieldValue}>{user.department || "—"}</p>
            </div>

            <div>
              <p style={fieldLabel}>Year</p>
              <p style={fieldValue}>{user.year || "—"}</p>
            </div>

            <div>
              <p style={fieldLabel}>Date of Birth</p>
              <p style={fieldValue}>{user.dob || "—"}</p>
            </div>

            <div>
              <p style={fieldLabel}>Phone</p>
              <p style={fieldValue}>{user.phone || "—"}</p>
            </div>

            <div>
              <p style={fieldLabel}>Address</p>
              <p style={fieldValue}>{user.address || "—"}</p>
            </div>

            <div>
              <p style={fieldLabel}>Gender</p>
              <p style={fieldValue}>{user.gender || "—"}</p>
            </div>
          </div>
        </div>

        <div style={card}>
          <h4>Result Status</h4>
          <span style={statusBadge(user.result_status)}>
            {user.result_status || "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: "15px",
  marginBottom: "24px",
};

const profileGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "16px",
};

const card = {
  background: "#1e1e1e",
  padding: "16px",
  borderRadius: "10px",
  boxShadow: "0 0 8px rgba(0,0,0,0.4)",
};

const fieldLabel = {
  fontSize: "11px",
  color: "#888",
  textTransform: "uppercase",
};

const fieldValue = {
  fontSize: "15px",
  fontWeight: "500",
};

const statusBadge = (val) => ({
  display: "inline-block",
  padding: "6px 14px",
  borderRadius: "20px",
  background:
    val === "APPROVED"
      ? "#4CAF50"
      : val === "REJECTED"
      ? "#e53935"
      : "#fbc02d",
  color: val === "PENDING" ? "black" : "white",
});
