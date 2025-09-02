import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./home.css"; // CSS separado

export default function Home() {
  const nav = useNavigate();
  const videoRef = useRef(null);
  const wrapRef  = useRef(null); // contenedor para fullscreen
  const volTimerRef = useRef(null);

  // helper para saber si es pantalla estrecha (móvil)
  const isNarrow = () =>
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(max-width: 600px)").matches;

  // Accesibilidad / UI
  const [bigText, setBigText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  // Video
  const [paused, setPaused] = useState(false);
  const [ccOn, setCcOn] = useState(true);
  const [muted, setMuted] = useState(true);     // autoplay necesita muted
  const [volume, setVolume] = useState(0.8);    // 0..1
  const [fitMode] = useState("contain");        // fijo: sin zoom
  const [isFs, setIsFs] = useState(false);      // pantalla completa

  // Volumen: slider compacto en móvil (oculto por defecto)
  const [volOpen, setVolOpen] = useState(() => !isNarrow());

  // Atajos 1/2/3/4
  const onKeyDown = (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (e.key === "1") nav("/solicitar");
    if (e.key === "2") nav("/agendar");
    if (e.key === "3") nav("/videollamada");
    if (e.key === "4") nav("/emergencia");
  };

  // Subtítulos
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !v.textTracks || !v.textTracks[0]) return;
    v.textTracks[0].mode = ccOn ? "showing" : "hidden";
  }, [ccOn]);

  // Volumen/Mute
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = volume;
    v.muted  = muted;
  }, [volume, muted]);

  // Pausa/Reproduce
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay  = () => setPaused(false);
    const onPause = () => setPaused(true);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, []);

  // Fullscreen (desktop + iOS)
  useEffect(() => {
    const onFsChange = () => {
      const anyFs = document.fullscreenElement || document.webkitFullscreenElement;
      setIsFs(Boolean(anyFs));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);

    const v = videoRef.current;
    const onBegin = () => setIsFs(true);   // iOS
    const onEnd   = () => setIsFs(false);
    if (v) {
      v.addEventListener("webkitbeginfullscreen", onBegin);
      v.addEventListener("webkitendfullscreen", onEnd);
    }
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
      if (v) {
        v.removeEventListener("webkitbeginfullscreen", onBegin);
        v.removeEventListener("webkitendfullscreen", onEnd);
      }
    };
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !v.muted;
    v.muted = next;
    setMuted(next);
    if (!next && v.paused) v.play().catch(() => {});
  };

  const onVolumeChange = (e) => {
    const val = Number(e.target.value);
    setVolume(val);
    const v = videoRef.current;
    if (!v) return;
    v.volume = val;
    if (val > 0 && v.muted) { v.muted = false; setMuted(false); }
    if (val === 0 && !v.muted) { v.muted = true; setMuted(true); }
    scheduleCloseVol();
  };

  // Al tocar el icono: en móvil abre el slider; si ya está abierto, toggle mute
  const onVolumeIconClick = () => {
    if (isNarrow() && !volOpen) {
      setVolOpen(true);
      scheduleCloseVol();
      return;
    }
    toggleMute();
  };

  const scheduleCloseVol = () => {
    if (!isNarrow()) return; // en desktop no se cierra
    if (volTimerRef.current) clearTimeout(volTimerRef.current);
    volTimerRef.current = setTimeout(() => setVolOpen(false), 2500);
  };

  useEffect(() => () => { if (volTimerRef.current) clearTimeout(volTimerRef.current); }, []);

  const volumeIcon = () => {
    if (muted || volume === 0) return "🔇";
    if (volume < 0.34) return "🔈";
    if (volume < 0.67) return "🔉";
    return "🔊";
  };

  const toggleFullscreen = async () => {
    const wrap = wrapRef.current;
    const vid  = videoRef.current;
    try {
      if (vid && vid.webkitEnterFullscreen && !document.fullscreenElement) {
        vid.webkitEnterFullscreen(); // iOS
        return;
      }
      if (!document.fullscreenElement && wrap?.requestFullscreen) {
        await wrap.requestFullscreen();
      } else if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    } catch { /* noop */ }
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
          <button className="a11yBtn" onClick={() => setBigText(v => !v)} aria-pressed={bigText} title="Texto grande">A+</button>
          <button className="a11yBtn" onClick={() => setHighContrast(v => !v)} aria-pressed={highContrast} title="Alto contraste">◻</button>
        </div>

        {/* HERO con VIDEO (contain, sin recortes) */}
        <div
          ref={wrapRef}
          className={`heroVideoWrap ${fitMode === "contain" ? "is-letterbox" : ""}`}
          aria-label="Presentación en video"
        >
          <div className="holoEdge" aria-hidden="true" />
          <video
            ref={videoRef}
            className={`heroVideo ${fitMode === "contain" ? "fit-contain" : "fit-cover"}`}
            playsInline
            muted={muted}
            autoPlay
            loop
            preload="metadata"
            poster="/media/intro.jpg"
            onClick={togglePlay}  // tap = play/pausa
          >
            {/* Adaptive sources */}
            <source src="/media/logo-bienvenido-1080.mp4" type="video/mp4" media="(min-width: 1025px)" />
            <source src="/media/logo-bienvenido-720.mp4"  type="video/mp4" media="(min-width: 641px)" />
            <source src="/media/logo-bienvenido-480.mp4"  type="video/mp4" media="(max-width: 640px)" />
            <source src="logo-bienvenido.mp4" type="video/mp4" />
            <track kind="captions" src="/media/intro.vtt" srcLang="es" label="Español" default />
          </video>

          {/* Controles compactos: play/volumen/CC/fullscreen */}
          <div className="videoControls" role="group" aria-label="Controles de video">
            <button className="vcBtn" onClick={togglePlay} aria-pressed={paused} title={paused ? "Reproducir" : "Pausar"}>
              {paused ? "▶️" : "⏸️"}
            </button>

            <div className={`volumeWrap ${volOpen ? "vol-open" : ""}`} role="group" aria-label="Control de volumen">
              <button
                className="vcBtn"
                onClick={onVolumeIconClick}
                aria-pressed={!muted}
                title={muted ? "Activar sonido" : "Silenciar"}
              >
                {volumeIcon()}
              </button>
              <input
                className="vcSlider"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={onVolumeChange}
                aria-label="Volumen"
              />
            </div>

            <button
              className="vcBtn"
              onClick={() => setCcOn(v => !v)}
              aria-pressed={ccOn}
              title={ccOn ? "Ocultar subtítulos" : "Mostrar subtítulos"}
            >
              CC
            </button>

            <button
              className="vcBtn"
              onClick={toggleFullscreen}
              aria-pressed={isFs}
              title={isFs ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              {isFs ? "⤢" : "⛶"}
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
          <button className="btn btn-primary btn-animate" onClick={() => nav("/solicitar")} aria-label="Solicitar intérprete ahora">
            <span className="btn__glow" aria-hidden="true" />
            ⚡ Solicitar Ahora <small>(1)</small>
          </button>

          <button className="btn btn-secondary btn-animate" onClick={() => nav("/agendar")} aria-label="Agendar intérprete">
            <span className="btn__glow" aria-hidden="true" />
            🗓️ Agendar <small>(2)</small>
          </button>

          <button className="btn btn-secondary btn-animate" onClick={() => nav("/videollamada")} aria-label="Iniciar videollamada">
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
          <div className="hint">Consejo: también puedes navegar con <kbd>Tab</kbd> + <kbd>Enter</kbd>.</div>
        </footer>
      </section>
    </main>
  );
}
