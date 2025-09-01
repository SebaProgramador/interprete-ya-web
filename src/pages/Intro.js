import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../theme.css";

export default function Intro(){
  const nav = useNavigate();

  useEffect(()=>{
    // Bloquear scroll detrás del overlay
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  },[]);

  const cerrar = () => {
    localStorage.setItem("intro_done", "1");
    nav("/", { replace: true });
  };

  const continuar = () => {
    localStorage.setItem("intro_done", "1");
    nav("/tipo-usuario", { replace: true });
  };

  return (
    <div className="intro-overlay" role="dialog" aria-modal="true" aria-label="Introducción">
      <button className="intro-close" onClick={cerrar} aria-label="Cerrar introducción">✕</button>

      <div className="intro-content">
        <video
          className="intro-video"
          src="/intro.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="intro-cta">
          <h1 className="intro-title">Bienvenido a Intérprete Ya</h1>
          <p className="intro-sub">Apoyo visual, accesibilidad y conexión 24/7</p>
          <button className="btn" onClick={continuar}>Continuar</button>
        </div>
      </div>
    </div>
  );
}
