import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./home.css"; // CSS separado

export default function Home() {
  const nav = useNavigate();
  const videoRef = useRef(null);

  const [bigText, setBigText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [paused, setPaused] = useState(false);
  const [ccOn, setCcOn] = useState(true);
  const [fitMode] = useState("contain"); // fijo: sin zoom

  // Atajos 1/2/3/4
  const onKeyDown = (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (e.key === "1") nav("/solicitar");
    if (e.key === "2") nav("/agendar");
    if (e.key === "3") nav("/videollamada");
    if (e.key === "4") nav("/emergencia");
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !v.textTracks || !v.textTracks[0]) return;
    v.textTracks[0].mode = ccOn ? "showing" : "hidden";
  }, [ccOn]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
  };

  return (
    <main
      className={`iy-container ${bigText ? "is-lg" : ""} ${highContrast ? "is-hc" : ""}`}
      role="main"
      aria-label="Inicio Interprete Ya"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <section className="iy-card" aria-labelledby="titulo-home">
        {/* Accesibilidad */}
        <div className="a11yBar" role="group" aria-label="Preferencias de accesibilidad">
          <button
            className="a11yBtn"
            onClick={() => setBigText((v) => !v)}
            aria-pressed={bigText}
            title="Texto grande"
          >
            A+
          </button>
          <button
            className="a11yBtn"
            onClick={() => setHighContrast((v) => !v)}
            aria-pressed={highContrast}
            title="Alto contraste"
          >
            ◻
          </button>
        </div>

        {/* HERO con VIDEO elegante */}
        <div
          className={`heroVideoWrap ${fitMode === "contain" ? "is-letterbox" : ""}`}
          aria-label="Presentación en video"
        >
          <div className="holoEdge" aria-hidden="true" />
          <video
            ref={videoRef}
            className={`heroVideo ${fitMode === "contain" ? "fit-contain" : "fit-cover"}`}
            playsInline
            muted
            autoPlay
            loop
            preload="metadata"
            poster="/media/intro.jpg"
            onClick={togglePlay}   // tap = play/pausa
          >
            <source src="/media/logo-bienvenido-1080.mp4" type="video/mp4" media="(min-width: 1025px)" />
            <source src="/media/logo-bienvenido-720.mp4"  type="video/mp4" media="(min-width: 641px)" />
            <source src="/media/logo-bienvenido-480.mp4"  type="video/mp4" media="(max-width: 640px)" />
            <source src="logo-bienvenido.mp4" type="video/mp4" />
            <track kind="captions" src="/media/intro.vtt" srcLang="es" label="Español" default />
          </video>

          <div className="videoControls" role="group" aria-label="Controles de video">
            <button
              className="vcBtn"
              onClick={togglePlay}
              aria-pressed={paused}
              title={paused ? "Reproducir" : "Pausar"}
            >
              {paused ? "▶️" : "⏸️"}
            </button>
            <button
              className="vcBtn"
              onClick={() => setCcOn((v) => !v)}
              aria-pressed={ccOn}
              title={ccOn ? "Ocultar subtítulos" : "Mostrar subtítulos"}
            >
              CC
            </button>
          </div>
        </div>

        <header className="iy-header">
          <h1 id="titulo-home" className="iy-title" aria-label="Intérprete Ya">
            <span className="grad">Intérprete&nbsp;Ya</span>
          </h1>

          <p className="iy-sub" id="sub-home" aria-live="polite">
            🤟 Accesibilidad 24/7 · 🦻 LSCh · ⚡ Soporte rápido
          </p>

          <div className="chips" aria-hidden="true">
            <span className="chip">🤟 Comunidad Sorda</span>
            <span className="chip">📱 Móvil · 💻 PC</span>
            <span className="chip">⌨ <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd></span>
          </div>
        </header>

        <nav className="grid3" aria-label="Acciones principales" aria-describedby="sub-home">
          <button
            className="btn btn-primary btn-animate"
            onClick={() => nav("/solicitar")}
            aria-label="Solicitar intérprete ahora"
          >
            <span className="btn__glow" aria-hidden="true" />
            ⚡ Solicitar Ahora <small>(1)</small>
          </button>

          <button
            className="btn btn-secondary btn-animate"
            onClick={() => nav("/agendar")}
            aria-label="Agendar intérprete"
          >
            <span className="btn__glow" aria-hidden="true" />
            🗓️ Agendar <small>(2)</small>
          </button>

          <button
            className="btn btn-secondary btn-animate"
            onClick={() => nav("/videollamada")}
            aria-label="Iniciar videollamada"
          >
            <span className="btn__glow" aria-hidden="true" />
            🎥 Videollamada <small>(3)</small>
          </button>
        </nav>

        <div className="extraRow" aria-label="Acciones rápidas">
          <button className="btn ghost btn-animate" onClick={() => nav("/emergencia")} aria-label="Abrir emergencia 24/7">
            🚨 Emergencia 24/7 <small>(4)</small>
          </button>
        </div>

        <footer className="iy-foot" aria-hidden="true">
          <div className="hint">
            Consejo: también puedes navegar con <kbd>Tab</kbd> + <kbd>Enter</kbd>.
          </div>
        </footer>
      </section>
    </main>
  );
}
