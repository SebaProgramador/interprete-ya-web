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

  // Atajos de teclado 1/2/3/4
  const onKeyDown = (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (e.key === "1") nav("/solicitar");
    if (e.key === "2") nav("/agendar");
    if (e.key === "3") nav("/videollamada");
    if (e.key === "4") nav("/emergencia");
  };

  // Control CC (subtítulos) cuando cambie ccOn
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !v.textTracks || !v.textTracks[0]) return;
    // Oculta/mostrar subtítulos sin UI nativa
    v.textTracks[0].mode = ccOn ? "showing" : "hidden";
  }, [ccOn]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {}); // evitar error si el navegador bloquea
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
      {/* Estilos locales: NO necesitas CSS extra */}
      <style>{css}</style>

      <section className="iy-card" aria-labelledby="titulo-home">
        {/* Barra accesibilidad */}
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
        <div className="heroVideoWrap" aria-label="Presentación en video">
          <video
            ref={videoRef}
            className="heroVideo"
            playsInline
            muted
            autoPlay
            loop
            preload="metadata"
            poster="/media/intro.jpg"    // ⬅️ imagen de portada
          >
            <source src="logo-bienvenido.mp4" type="video/mp4" />
            {/* Subtítulos opcionales (VTT) */}
            <track
              kind="captions"
              src="/media/intro.vtt"
              srcLang="es"
              label="Español"
              default
            />
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
            <span className="chip">📱 Modo móvil / 💻 PC</span>
            <span className="chip">
              ⌨ Atajos: <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd>
            </span>
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

        {/* Fila extra: Emergencia 24/7 */}
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
  --panel:#0e182d;
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

/* Preferencias de accesibilidad */
.is-lg{ --scale:1.15; }
.is-hc{
  --txt:#ffffff; --muted:#cfe9ff;
  --primary:#a8f3ff; --primary-2:#d1fbff;
  --ring:#a8f3ffcc; --edge:#1d5c8d;
}

/* Fondo ciber + safe-area móvil */
.iy-container{
  min-height:100dvh; display:grid; place-items:center;
  padding: max(20px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right))
           max(28px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left));
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
@keyframes gridFloat{ from{transform:translate3d(0,0,0)} to{transform:translate3d(10px,-8px,0)} }

/* Tarjeta HUD */
.iy-card{
  width:min(100%, 980px); position:relative;
  padding: clamp(20px, 3vw, 32px);
  background:linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
  border:1px solid var(--edge); border-radius:22px; backdrop-filter: blur(10px);
  box-shadow: 0 0 0 1px #0b1b30 inset, 0 22px 60px rgba(0,0,0,0.35), 0 0 80px var(--accent);
  clip-path: polygon(0% 12px, 12px 0%, calc(100% - 12px) 0%, 100% 12px, 100% calc(100% - 12px),
    calc(100% - 12px) 100%, 12px 100%, 0% calc(100% - 12px));
}
.iy-card::before{
  content:""; position:absolute; inset:10px; border:1px solid #0f2c49; border-radius:16px;
  clip-path:inherit; pointer-events:none; box-shadow: 0 0 22px rgba(0,183,255,.15);
}

/* HERO VIDEO */
.heroVideoWrap{
  position: relative; width:100%; margin-bottom:12px; overflow:hidden;
  border:1px solid #103452; border-radius:18px;
  clip-path: polygon(0% 10px, 10px 0%, calc(100% - 10px) 0%, 100% 10px, 100% calc(100% - 10px),
    calc(100% - 10px) 100%, 10px 100%, 0% calc(100% - 10px));
  aspect-ratio: 16 / 9;
  background:#081425;
}
.heroVideo{ width:100%; height:100%; object-fit:cover; filter: saturate(1.06) contrast(1.05); }
.heroVideoWrap::after{
  content:""; position:absolute; inset:0;
  background: radial-gradient(120% 80% at 50% 10%, rgba(0,183,255,.18), transparent 60%),
              linear-gradient(180deg, rgba(0,0,0,.15), transparent 40%, rgba(0,0,0,.25));
  pointer-events:none;
}
/* Controles de video */
.videoControls{
  position:absolute; top:8px; right:8px; display:flex; gap:8px; z-index:2;
}
.vcBtn{
  min-width:40px; height:36px; border-radius:10px; cursor:pointer;
  border:1px solid #1c4166; background:#0c1a2b; color:#cfe9ff; font-weight:700;
  box-shadow: 0 6px 16px rgba(0,0,0,.35), inset 0 0 12px rgba(91,212,255,.12);
}
.vcBtn[aria-pressed="true"]{ outline:2px solid var(--ring); }

/* Cabecera */
.iy-header{ text-align:center; margin-bottom:18px; }
.iy-title{
  margin:0 0 8px 0; font-size: calc(var(--scale) * clamp(26px, 4.4vw, 54px));
  letter-spacing:.5px; line-height:1.05; text-shadow: 0 0 22px rgba(0,183,255,.25);
}
.grad{
  background:linear-gradient(92deg, #8de2ff 0%, var(--primary) 40%, #b7f9ff 100%);
  -webkit-background-clip:text; background-clip:text; color:transparent;
}
.iy-sub{
  margin:0 auto; max-width:720px; font-size: calc(var(--scale) * clamp(14px, 2.1vw, 18px));
  color:var(--muted);
}

/* Chips */
.chips{ display:flex; gap:10px; justify-content:center; margin-top:12px; flex-wrap:wrap;}
.chip{
  display:inline-flex; align-items:center; gap:6px; border:1px solid #163250; color:#9fdcff;
  background:#0b1a2e; padding:6px 10px; border-radius:999px; font-size: calc(var(--scale) * 12px);
}

/* Grillas */
.grid3{ display:grid; gap:14px; margin-top:18px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
.extraRow{ margin-top:12px; display:grid; gap:12px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }

/* Botones */
.btn{
  position:relative; width:100%; min-height:54px; padding:14px 16px;
  font-size: calc(var(--scale) * clamp(15px, 2.5vw, 18px));
  border-radius:14px; border:1px solid #173a58; color:var(--txt);
  background: linear-gradient(180deg, #0f2339, #0c1a2b);
  cursor:pointer; transition: transform .08s ease, box-shadow .15s ease, border-color .15s ease, background .2s ease;
  box-shadow: 0 10px 28px rgba(0,0,0,.35), 0 0 18px rgba(91,212,255,.18) inset; outline:none; isolation:isolate;
}
.btn::before{ content:""; position:absolute; inset:0; border-radius:14px; pointer-events:none; background: linear-gradient(180deg, rgba(255,255,255,.12), transparent 46%); }
.btn::after{
  content:""; position:absolute; top:-60%; left:-20%; width:40%; height:220%; transform: rotate(20deg);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.18), transparent); opacity:.0; pointer-events:none; transition: opacity .2s ease, transform .2s ease;
}
.btn:hover::after{ opacity:.9; transform: rotate(20deg) translateX(120%); }
.btn:hover{ transform: translateY(-1px); border-color: var(--ring); box-shadow: 0 14px 32px rgba(0,0,0,.45), 0 0 28px rgba(110,240,255,.35) inset; }
.btn:active{ transform: translateY(0); }
.btn:focus-visible{ box-shadow: 0 0 0 3px var(--ring), 0 10px 28px rgba(0,0,0,.35); }

.btn__glow{ position:absolute; inset:-2px; border-radius:16px; background: radial-gradient(120px 60px at 10% 0%, rgba(110,240,255,.18), transparent 60%); mix-blend-mode: screen; filter: blur(4px); animation: pulse 2.6s ease-in-out infinite; pointer-events:none; z-index:-1; }
@keyframes pulse{ 0%,100%{ opacity:.35 } 50%{ opacity:.6 } }

.btn.btn-primary{ background: linear-gradient(180deg, #0f3a56, #0b2c45); border-color:#1d74a8; }
.btn.btn-primary:hover{ box-shadow: 0 12px 34px rgba(0,0,0,.46), 0 0 26px rgba(110,240,255,.35); }
.btn.btn-secondary{ background: linear-gradient(180deg, #0e2238, #0a1a2c); border-color:#163a58; box-shadow: 0 10px 24px rgba(0,0,0,.32), 0 0 16px rgba(91,212,255,.12) inset; }
.btn.btn-secondary:hover{ box-shadow: 0 12px 28px rgba(0,0,0,.4), 0 0 22px rgba(91,212,255,.25) inset; }

.btn.ghost{ background: linear-gradient(180deg, #09172a, #071222); border-color:#13324e; color:#cfe9ff; }

/* Pie */
.iy-foot{ margin-top:14px; text-align:center; }
.hint{ color:#8fb5d1; font-size: calc(var(--scale) * 12.5px); }
kbd{ font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: calc(var(--scale) * 12px); padding:2px 6px; border-radius:6px; border:1px solid #2a4a6a; background:#0a1a2c; color:#bfe9ff; box-shadow: inset 0 -1px 0 #0d2a44; }

/* Móvil */
@media (max-width:760px){
  .iy-card{ padding:20px; }
}

/* Reduce motion */
@media (prefers-reduced-motion: reduce){
  .iy-container::before, .btn__glow{ animation:none; }
  .btn:hover::after{ transition:none; }
}
`;
