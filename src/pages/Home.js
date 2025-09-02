// src/pages/Home.js
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();

  // Atajos de teclado 1/2/3
  const onKeyDown = (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (e.key === "1") nav("/solicitar");
    if (e.key === "2") nav("/agendar");
    if (e.key === "3") nav("/videollamada");
  };

  return (
    <main
      className="iy-container"
      role="main"
      aria-label="Inicio Interprete Ya"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      {/* Estilos locales: NO necesitas CSS extra */}
      <style>{css}</style>

      <section className="iy-card" aria-labelledby="titulo-home">
        <header className="iy-header">
          <h1 id="titulo-home" className="iy-title" aria-label="Intérprete Ya">
            <span className="grad">Intérprete&nbsp;Ya</span>
          </h1>
          <p className="iy-sub" id="sub-home" aria-live="polite">
            Accesibilidad 24/7 · LSCh · Soporte rápido
          </p>

          <div className="chips" aria-hidden="true">
            <span className="chip">
              Atajos: <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd>
            </span>
            <span className="chip">Modo móvil listo</span>
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
  --primary:#5bd4ff;    /* cian */
  --primary-2:#6ef0ff;  /* cian claro */
  --accent:#00b7ff55;   /* brillo */
  --ring:#5bd4ff88;
  --edge:#173757;
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

/* Fondo con sutiles líneas “ciber” */
.iy-container{
  min-height:100dvh;
  display:grid;
  place-items:center;
  padding:24px;
  position:relative;
  overflow:hidden;
}
.iy-container::before{
  content:"";
  position:absolute; inset:0;
  background:
    repeating-linear-gradient(
      90deg,
      transparent 0px, transparent 94px,
      rgba(91,212,255,.07) 95px, rgba(91,212,255,.07) 96px
    ),
    repeating-linear-gradient(
      0deg,
      transparent 0px, transparent 94px,
      rgba(91,212,255,.06) 95px, rgba(91,212,255,.06) 96px
    );
  mask: linear-gradient(180deg, transparent 0%, black 15%, black 85%, transparent 100%);
  pointer-events:none;
  animation:gridFloat 16s ease-in-out infinite alternate;
}
@keyframes gridFloat{
  from{ transform: translate3d(0,0,0); }
  to{ transform: translate3d(10px,-8px,0); }
}

/* Tarjeta estilo HUD con esquinas cortadas y doble borde */
.iy-card{
  width:min(100%, 980px);
  position:relative;
  padding:28px;
  background:linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
  border:1px solid var(--edge);
  border-radius:22px; /* el clip recorta igual */
  backdrop-filter: blur(10px);
  box-shadow:
    0 0 0 1px #0b1b30 inset,
    0 22px 60px rgba(0,0,0,0.35),
    0 0 80px var(--accent);
  clip-path: polygon(
    0% 12px, 12px 0%, calc(100% - 12px) 0%, 100% 12px,
    100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0% calc(100% - 12px)
  );
}
.iy-card::before{
  content:"";
  position:absolute; inset:10px;
  border:1px solid #0f2c49;
  border-radius:16px;
  clip-path:inherit;
  pointer-events:none;
  box-shadow: 0 0 22px rgba(0,183,255,.15);
}

/* Cabecera */
.iy-header{ text-align:center; margin-bottom:18px; }
.iy-title{
  margin:0 0 8px 0;
  font-size: clamp(28px, 4.5vw, 56px);
  letter-spacing:0.5px;
  line-height:1.05;
  text-shadow: 0 0 22px rgba(0, 183, 255, 0.25);
}
.grad{
  background:linear-gradient(92deg, #8de2ff 0%, var(--primary) 40%, #b7f9ff 100%);
  -webkit-background-clip:text; background-clip:text;
  color:transparent;
}
.iy-sub{
  margin:0 auto;
  max-width:680px;
  font-size: clamp(14px, 2.2vw, 18px);
  color:var(--muted);
}

/* Chips */
.chips{ display:flex; gap:10px; justify-content:center; margin-top:12px; flex-wrap:wrap;}
.chip{
  display:inline-flex; align-items:center; gap:6px;
  border:1px solid #163250; color:#9fdcff;
  background:#0b1a2e;
  padding:6px 10px; border-radius:999px; font-size:12px;
}

/* Grilla responsiva */
.grid3{
  display:grid; gap:14px; margin-top:18px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

/* Botón neón con brillo */
.btn{
  position:relative;
  width:100%;
  padding:14px 16px;
  font-size: clamp(15px, 2.5vw, 18px);
  border-radius:14px;
  border:1px solid #173a58;
  color:var(--txt);
  background: linear-gradient(180deg, #0f2339, #0c1a2b);
  cursor:pointer;
  transition:
    transform .08s ease,
    box-shadow .15s ease,
    border-color .15s ease,
    background .2s ease;
  box-shadow:
    0 10px 28px rgba(0,0,0,.35),
    0 0 18px rgba(91,212,255,.18) inset;
  outline: none;
  isolation:isolate; /* para el glow interno */
}
/* brillo superior */
.btn::before{
  content:"";
  position:absolute; inset:0;
  border-radius:14px; pointer-events:none;
  background: linear-gradient(180deg, rgba(255,255,255,.12), transparent 46%);
}
/* destello oblicuo (sheen) */
.btn::after{
  content:"";
  position:absolute; top:-60%; left:-20%;
  width:40%; height:220%;
  transform: rotate(20deg);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.18), transparent);
  opacity:.0; pointer-events:none;
  transition: opacity .2s ease, transform .2s ease;
}
.btn:hover::after{
  opacity:.9; transform: rotate(20deg) translateX(120%);
}
.btn:hover{
  transform: translateY(-1px);
  border-color: var(--ring);
  box-shadow:
    0 14px 32px rgba(0,0,0,.45),
    0 0 28px rgba(110,240,255,.35) inset;
}
.btn:active{ transform: translateY(0); }
.btn:focus-visible{ box-shadow: 0 0 0 3px var(--ring), 0 10px 28px rgba(0,0,0,.35); }

/* Glow pulsante muy sutil */
.btn__glow{
  position:absolute; inset:-2px; border-radius:16px;
  background: radial-gradient(120px 60px at 10% 0%, rgba(110,240,255,.18), transparent 60%);
  mix-blend-mode: screen; filter: blur(4px);
  animation: pulse 2.6s ease-in-out infinite;
  pointer-events:none; z-index:-1;
}
@keyframes pulse{
  0%,100%{ opacity:.35 }
  50%{ opacity:.6 }
}

/* Variantes */
.btn.btn-primary{
  background: linear-gradient(180deg, #0f3a56, #0b2c45);
  border-color:#1d74a8;
}
.btn.btn-primary:hover{
  box-shadow:
    0 12px 34px rgba(0,0,0,.46),
    0 0 26px rgba(110,240,255,.35);
}

.btn.btn-secondary{
  background: linear-gradient(180deg, #0e2238, #0a1a2c);
  border-color:#163a58;
  box-shadow: 0 10px 24px rgba(0,0,0,.32), 0 0 16px rgba(91,212,255,.12) inset;
}
.btn.btn-secondary:hover{
  box-shadow: 0 12px 28px rgba(0,0,0,.4), 0 0 22px rgba(91,212,255,.25) inset;
}

/* Pie */
.iy-foot{ margin-top:14px; text-align:center; }
.hint{ color:#8fb5d1; font-size:12.5px; }
kbd{
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size:12px; padding:2px 6px; border-radius:6px;
  border:1px solid #2a4a6a; background:#0a1a2c; color:#bfe9ff;
  box-shadow: inset 0 -1px 0 #0d2a44;
}

/* Móvil */
@media (max-width:760px){
  .iy-card{ padding:22px; }
}

/* Accesibilidad: reducir animaciones si el usuario lo pide */
@media (prefers-reduced-motion: reduce){
  .iy-container::before, .btn__glow{ animation: none; }
  .btn:hover::after{ transition: none; }
}
`;
