import React from "react";

export const StatsBar: React.FC = () => {
  const stats = [
    {
      color: "#d97706", // Gold
      label: "DELIVERABILITY ACCURACY",
      value: "99.9%",
      subtitle: "multi-factor validation",
    },
    {
      color: "#3b82f6", // Steel Blue
      label: "INSPECTION CHECKS",
      value: "9+ Layers",
      subtitle: "MX, SPF, DMARC & more",
    },
    {
      color: "#10b981", // Sage Green
      label: "AVG RESPONSE TIME",
      value: "< 120ms",
      subtitle: "Cloudflare edge resolution",
    },
    {
      color: "#e11d48", // Terra Cotta / Coral
      label: "INFRASTRUCTURE BILL",
      value: "$0.00",
      subtitle: "100% free-tier guaranteed",
    },
  ];

  return (
    <div className="stats-row">
      {stats.map((stat, idx) => (
        <div key={idx} className="stat-box">
          <div className="stat-top-bar" style={{ backgroundColor: stat.color }} />
          <div className="stat-label">{stat.label}</div>
          <div className="stat-value">{stat.value}</div>
          <div className="stat-subtitle">{stat.subtitle}</div>
        </div>
      ))}
    </div>
  );
};
