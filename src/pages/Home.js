// src/pages/Home.js
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();
  const videoRef = useRef(null);

  const [bigText, setBigText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [paused, setPaused] = useState(false);
  const [ccOn, setCcOn] = useState(true);
  const [fitMode, setFitMode] = useState("contain"); // "contain" (sin zoom) | "cover" (llena marco)

  // Atajos de teclado 1/2/3/4
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
      <style>{css}</style>

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

        {/* HERO con VIDEO */}
        <div className={`heroVideoWrap ${fitMode === "contain" ? "is-letterbox" : ""}`} aria-label="Presentación en video">
          <video
            ref={videoRef}
            className={`heroVideo ${fitMode === "contain" ? "fit-contain" : "fit-cover"}`}
            playsInline
            muted
            autoPlay
            loop
            preload="metadata"
            poster="/media/intro.jpg"
          >
            {/* El navegador elegirá la fuente que coincida con el media query */}
            <source src="/media/logo-bienvenido-1080.mp4" type="video/mp4" media="(min-width: 1025px)" />
            <source src="/media/logo-bienvenido-720.mp4"  type="video/mp4" media="(min-width: 641px)" />
            <source src="/media/logo-bienvenido-480.mp4"  type="video/mp4" media="(max-width: 640px)" />
            {/* Fallback si no existen las variantes */}
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
            className="btn btn-primary"
            onClick={() => nav("/solicitar")}
            aria-label="Solicitar intérprete ahora"
          >
            <span className="btn__glow" aria-hidden="true" />
            ⚡ Solicitar Ahora <small>(1)</small>
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => nav("/agendar")}
            aria-label="Agendar intérprete"
          >
            <span className="btn__glow" aria-hidden="true" />
            🗓️ Agendar <small>(2)</small>
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => nav("/videollamada")}
            aria-label="Iniciar videollamada"
          >
            <span className="btn__glow" aria-hidden="true" />
            🎥 Videollamada <small>(3)</small>
          </button>
        </nav>

        <div className="extraRow" aria-label="Acciones rápidas">
          <button className="btn ghost" onClick={() => nav("/emergencia")} aria-label="Abrir emergencia 24/7">
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

/* ================== CSS en JS (local) ================== */
const css = `
:root{
  --bg:#0b1220;
  --bg2:#0a162b;
  --txt:#e6f1ff;
  --muted:#9fb3c8;
  --primary:#5bd4ff;
  --primary-2:#6ef0ff;
  --accent:#00b7ff55;
  --ring:#5bd4ff88;
  --edge:#173757;
  --scale:1;
}

*{box-sizing:border-box}
html,body,#root{height:100%}
body{
  margin:0; color:var(--txt);
  font-family:ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  background:
    radial-gradient(1200px 800px at 18% 12%, #0e2a4f66 0%, transparent 60%),
    radial-gradient(1000px 700px at 82% 78%, #0b3a6a66 0%, transparent 70%),
    linear-gradient(180deg, var(--bg2), var(--bg));
}

/* Accesibilidad */
.is-lg{ --scale:1.12; }
.is-hc{ --txt:#fff; --muted:#cfe9ff; --primary:#a8f3ff; --primary-2:#d1fbff; --ring:#a8f3ffcc; --edge:#1d5c8d; }

/* Contenedor */
.iy-container{
  min-height:100dvh; display:grid; place-items:center;
  padding: max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right))
           max(22px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
  position:relative; overflow:hidden;
}
.iy-container::before{
  content:""; position:absolute; inset:0;
  background:
    repeating-linear-gradient(90deg, transparent 0px, transparent 94px, rgba(91,212,255,.07) 95px, rgba(91,212,255,.07) 96px),
    repeating-linear-gradient(0deg,  transparent 0px, transparent 94px, rgba(91,212,255,.06) 95px, rgba(91,212,255,.06) 96px);
  mask: linear-gradient(180deg, transparent 0%, black 15%, black 85%, transparent 100%);
  pointer-events:none; animation:gridFloat 16s ease-in-out infinite alternate;
}
@keyframes gridFloat{ from{ transform: translate3d(0,0,0);} to{ transform: translate3d(10px,-8px,0);} }

/* Tarjeta */
.iy-card{
  width:min(100%, 980px);
  position:relative;
  padding: clamp(16px, 3vw, 28px);
  background:linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
  border:1px solid var(--edge); border-radius:18px; backdrop-filter: blur(10px);
  box-shadow: 0 0 0 1px #0b1b30 inset, 0 22px 50px rgba(0,0,0,0.32), 0 0 60px var(--accent);
  clip-path: polygon(0% 10px, 10px 0%, calc(100% - 10px) 0%, 100% 10px, 100% calc(100% - 10px),
    calc(100% - 10px) 100%, 10px 100%, 0% calc(100% - 10px));
}
.iy-card::before{
  content:""; position:absolute; inset:8px; border:1px solid #0f2c49; border-radius:14px;
  clip-path:inherit; pointer-events:none; box-shadow: 0 0 18px rgba(0,183,255,.14);
}

/* VIDEO */
.heroVideoWrap{
  position: relative; width:100%; margin-bottom:10px; overflow:hidden;
  border:1px solid #103452; border-radius:14px;
  clip-path: polygon(0% 8px, 8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px),
    calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px));
  aspect-ratio: 16 / 9; background:#081425;
  max-height: 420px;
}
.heroVideo{
  width:100%; height:100%;
  object-position:center center;
  /* Sin filtros para preservar nitidez real del archivo */
  filter:none; backface-visibility:hidden; -webkit-font-smoothing:antialiased;
}
/* Modos de encaje */
.heroVideo.fit-contain{ object-fit: contain; }
.heroVideo.fit-cover{ object-fit: cover; }

/* Letterboxing sutil cuando fit-contain (barras) */
.is-letterbox::before,
.is-letterbox::after{
  content:""; position:absolute; left:0; right:0; height:10px; z-index:1; pointer-events:none;
  background: linear-gradient(180deg, rgba(0,0,0,.28), transparent);
}
.is-letterbox::before{ top:0; }
.is-letterbox::after{
  bottom:0; transform: rotate(180deg);
  background: linear-gradient(180deg, rgba(0,0,0,.28), transparent);
}

.heroVideoWrap::after{
  content:""; position:absolute; inset:0;
  background:
    radial-gradient(120% 80% at 50% 10%, rgba(0,183,255,.12), transparent 60%),
    linear-gradient(180deg, rgba(0,0,0,.10), transparent 40%, rgba(0,0,0,.16));
  pointer-events:none;
}
/* Controles de video */
.videoControls{ position:absolute; top:6px; right:6px; display:flex; gap:6px; z-index:2; }
.vcBtn{
  min-width:36px; height:32px; border-radius:8px; cursor:pointer;
  border:1px solid #1c4166; background:#0c1a2b; color:#cfe9ff; font-weight:700; font-size:12px;
  box-shadow: 0 6px 12px rgba(0,0,0,.32), inset 0 0 10px rgba(91,212,255,.12);
}
.vcBtn[aria-pressed="true"]{ outline:2px solid var(--ring); }

/* Cabecera */
.iy-header{ text-align:center; margin-bottom:14px; }
.iy-title{
  margin:0 0 6px 0;
  font-size: calc(var(--scale) * clamp(22px, 5vw, 40px));
  letter-spacing:.4px; line-height:1.06;
  text-shadow: 0 0 18px rgba(0,183,255,.22);
}
.grad{ background:linear-gradient(92deg, #8de2ff 0%, var(--primary) 40%, #b7f9ff 100%); -webkit-background-clip:text; background-clip:text; color:transparent; }
.iy-sub{ margin:0 auto; max-width:680px; font-size: calc(var(--scale) * clamp(13px, 3.5vw, 16px)); color:var(--muted); }

/* Chips */
.chips{ display:flex; gap:8px; justify-content:center; margin-top:10px; flex-wrap:wrap;}
.chip{
  display:inline-flex; align-items:center; gap:6px;
  border:1px solid #163250; color:#9fdcff; background:#0b1a2e;
  padding:5px 8px; border-radius:999px; font-size: calc(var(--scale) * 11px);
}

/* Grillas */
.grid3{ display:grid; gap:10px; margin-top:12px; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); }
.extraRow{ margin-top:10px; display:grid; gap:10px; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); }

/* Botones */
.btn{
  position:relative; width:100%;
  min-height:48px; padding:12px 14px;
  font-size: calc(var(--scale) * clamp(14px, 3.5vw, 16px));
  border-radius:12px; border:1px solid #173a58; color:var(--txt);
  background: linear-gradient(180deg, #0f2339, #0c1a2b);
  cursor:pointer; transition: transform .08s ease, box-shadow .15s ease, border-color .15s ease, background .2s ease;
  box-shadow: 0 8px 22px rgba(0,0,0,.32), 0 0 14px rgba(91,212,255,.14) inset; outline:none; isolation:isolate;
}
.btn::before{ content:""; position:absolute; inset:0; border-radius:12px; pointer-events:none; background: linear-gradient(180deg, rgba(255,255,255,.10), transparent 46%); }
.btn::after{ content:""; position:absolute; top:-60%; left:-20%; width:40%; height:220%; transform: rotate(20deg); background: linear-gradient(90deg, transparent, rgba(255,255,255,.16), transparent); opacity:.0; pointer-events:none; transition: opacity .2s ease, transform .2s ease; }
.btn:hover::after{ opacity:.9; transform: rotate(20deg) translateX(120%); }
.btn:hover{ transform: translateY(-1px); border-color: var(--ring); box-shadow: 0 12px 26px rgba(0,0,0,.4), 0 0 22px rgba(110,240,255,.28) inset; }
.btn:active{ transform: translateY(0); }
.btn:focus-visible{ box-shadow: 0 0 0 3px var(--ring), 0 8px 22px rgba(0,0,0,.32); }

.btn__glow{ position:absolute; inset:-2px; border-radius:14px; background: radial-gradient(100px 50px at 10% 0%, rgba(110,240,255,.16), transparent 60%); mix-blend-mode: screen; filter: blur(3px); animation: pulse 2.6s ease-in-out infinite; pointer-events:none; z-index:-1; }
@keyframes pulse{ 0%,100%{ opacity:.32 } 50%{ opacity:.55 } }

.btn.btn-primary{ background: linear-gradient(180deg, #0f3a56, #0b2c45); border-color:#1d74a8; }
.btn.btn-primary:hover{ box-shadow: 0 10px 28px rgba(0,0,0,.44), 0 0 22px rgba(110,240,255,.32); }
.btn.btn-secondary{ background: linear-gradient(180deg, #0e2238, #0a1a2c); border-color:#163a58; box-shadow: 0 8px 20px rgba(0,0,0,.28), 0 0 12px rgba(91,212,255,.12) inset; }
.btn.btn-secondary:hover{ box-shadow: 0 10px 24px rgba(0,0,0,.36), 0 0 18px rgba(91,212,255,.22) inset; }
.btn.ghost{ background: linear-gradient(180deg, #09172a, #071222); border-color:#13324e; color:#cfe9ff; }

/* Pie */
.iy-foot{ margin-top:12px; text-align:center; }
.hint{ color:#8fb5d1; font-size: calc(var(--scale) * 12px); }
kbd{ font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: calc(var(--scale) * 11.5px); padding:2px 6px; border-radius:6px; border:1px solid #2a4a6a; background:#0a1a2c; color:#bfe9ff; box-shadow: inset 0 -1px 0 #0d2a44; }

/* 📱 Ajustes mobile */
@media (max-width: 480px){
  .heroVideoWrap{ aspect-ratio: 16 / 9; max-height: 260px; }
}
@media (max-width: 380px){
  .heroVideoWrap{ max-height: 220px; }
  .a11yBar{ top:8px; right:8px; gap:6px; }
  .a11yBtn{ min-width:34px; height:34px; border-radius:8px; }
}

/* Reduce motion */
@media (prefers-reduced-motion: reduce){
  .iy-container::before, .btn__glow{ animation:none; }
  .btn:hover::after{ transition:none; }
}
`;
