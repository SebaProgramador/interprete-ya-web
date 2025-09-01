import React from "react";

export default function Stars({ value = 0, size = 18, showNumber = true }) {
  const full = Math.max(0, Math.min(5, Math.floor(value || 0)));
  return (
    <span aria-label={`rating ${Number(value || 0).toFixed(1)} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ fontSize: size, lineHeight: 1, marginRight: 2 }}>
          {i < full ? "★" : "☆"}
        </span>
      ))}
      {showNumber && (
        <span className="badge" style={{ marginLeft: 6 }}>
          {Number(value || 0).toFixed(1)}
        </span>
      )}
    </span>
  );
}
