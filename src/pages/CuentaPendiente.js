// src/pages/CuentaPendiente.js
import React from "react";
import "../styles/auth-cyber.css";

export default function CuentaPendiente() {
  return (
    <div className="theme-cyber page-pad">
      <div className="cyber-bg animated tech" aria-hidden>
        <div className="circuit" />
        <div className="particles" />
      </div>

      <div className="container">
        <div className="card auth-card neon" role="status" aria-live="polite">
          <h2 className="heroTitle">Tu cuenta está en revisión 🤝</h2>
          <p className="heroSub">
            La aprobación puede tardar <b>3–4 días hábiles</b>. Te avisaremos por WhatsApp o correo.
          </p>

          <div className="row" style={{ gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <a className="btn secondary" href="/">🏠 Volver al inicio</a>
            <a className="btn" href="/reporte" aria-label="Reportar problema o suplantación">🚨 Reportar un problema</a>
          </div>
        </div>
      </div>
    </div>
  );
}
