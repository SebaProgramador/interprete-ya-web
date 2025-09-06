// src/pages/Home.js
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./home.css";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  // ===== UI State =====
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [regTab, setRegTab] = useState("user"); // "user" | "interpreter"
  const [ubicacion, setUbicacion] = useState("Santiago, Chile");

  // ===== Video state / refs =====
  const videoRef = useRef(null);
  const trackRef = useRef(null);
  const wrapRef  = useRef(null);

  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume]   = useState(0.6);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volOpen, setVolOpen] = useState(false); // muestra el slider en móvil
  const [isPlaying, setIsPlaying] = useState(true);
  const [captionsOn, setCaptionsOn] = useState(true);

  // ===== Handlers =====
  const abrirLogin = useCallback(() => {
    setShowRegister(false);
    setShowLogin(true);
  }, []);

  const abrirRegister = useCallback((tab = "user") => {
    setRegTab(tab);
    setShowLogin(false);
    setShowRegister(true);
  }, []);

  const cerrarTodo = useCallback(() => {
    setShowLogin(false);
    setShowRegister(false);
  }, []);

  const actualizarUbicacion = () => setUbicacion("Santiago, Chile");

  // Bloquear scroll si hay modal
  const hayModal = showLogin || showRegister;
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = hayModal ? "hidden" : prev;
    return () => (document.body.style.overflow = prev);
  }, [hayModal]);

  // Cerrar con ESC (para modales)
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && cerrarTodo();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cerrarTodo]);

  // Abrir modal de Registro si venimos desde la navbar con state
  useEffect(() => {
    if (location?.state?.openRegister) {
      abrirRegister(location?.state?.regTab || "user");
      navigate(".", { replace: true, state: {} });
    }
  }, [location, abrirRegister, navigate]);

  // Inicializar video + detectar cambios de fullscreen + play/pause listeners
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    v.muted = true;            // autoplay en móvil
    v.volume = volume;

    const onFsChange = () => {
      const fs = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
      setIsFullscreen(!!fs);
    };

    const onPlay  = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    document.addEventListener("MSFullscreenChange", onFsChange);

    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
      document.removeEventListener("MSFullscreenChange", onFsChange);
    };
  }, [volume]);

  // Sincronizar subtítulos con estado
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    try {
      // Cuando hay <track>, su mode puede ser 'showing' | 'hidden'
      track.mode = captionsOn ? "showing" : "hidden";
    } catch {}
  }, [captionsOn]);

  // ===== Controles de video =====
  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !v.muted;
    v.muted = next;
    setIsMuted(next);
    // Si reactivas sonido y volumen está en 0, sube a un valor cómodo
    if (!next && v.volume === 0) {
      v.volume = 0.5;
      setVolume(0.5);
    }
    // En móvil: al tocar el icono de volumen, abre/cierra el slider
    setVolOpen((s) => !s);
  };

  const changeVolume = (valOrEvent) => {
    const val = typeof valOrEvent === "number" ? valOrEvent : Number(valOrEvent.target.value);
    const v = videoRef.current;
    if (!v) return;
    const clamped = Math.max(0, Math.min(1, val));
    v.volume = clamped;
    setVolume(clamped);
    if (clamped > 0 && v.muted) {
      v.muted = false;
      setIsMuted(false);
    }
    if (clamped === 0 && !v.muted) {
      v.muted = true;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = async () => {
    const el = wrapRef.current;
    if (!el) return;
    const d = document;
    const isFs = d.fullscreenElement || d.webkitFullscreenElement || d.msFullscreenElement;
    try {
      if (!isFs) {
        if (el.requestFullscreen) await el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        else if (el.msRequestFullscreen) el.msRequestFullscreen();
      } else {
        if (d.exitFullscreen) await d.exitFullscreen();
        else if (d.webkitExitFullscreen) d.webkitExitFullscreen();
        else if (d.msExitFullscreen) d.msExitFullscreen();
      }
    } catch {}
  };

  const togglePlayPause = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  const toggleCaptions = () => setCaptionsOn((s) => !s);

  // Atajos de teclado accesibles cuando el contenedor tiene foco
  const handleKeyDown = (e) => {
    // Evita scroll con barra espaciadora
    if (e.key === " ") e.preventDefault();

    switch (e.key.toLowerCase()) {
      case " ":
        togglePlayPause();
        break;
      case "m":
        toggleMute();
        break;
      case "f":
        toggleFullscreen();
        break;
      case "c":
        toggleCaptions();
        break;
      case "arrowup":
        changeVolume(volume + 0.05);
        break;
      case "arrowdown":
        changeVolume(volume - 0.05);
        break;
      default:
        break;
    }
  };

  // Icono según nivel de volumen
  const volumeIcon = isMuted || volume === 0
    ? "fa-volume-mute"
    : volume < 0.5
      ? "fa-volume-down"
      : "fa-volume-up";

  const volumePct = Math.round((isMuted ? 0 : volume) * 100);

  return (
    <div className="theme-cyber">
      {/* ===== Header ===== */}
      <header className="iy2-header gradient-bg sticky neon-header" role="banner">
        <div className="container">
          <div className="header-row">
            <div className="logo-group" aria-label="Inicio InterpreteYa">
              <i className="fas fa-hands-sign-language logo-icon" aria-hidden="true" />
              <h1 className="brand">InterpreteYa</h1>
            </div>
            <div className="auth-actions" role="group" aria-label="Acciones de sesión">
              <button type="button" className="ubereats-btn-secondary neon-btn" onClick={abrirLogin}>
                Ingresar
              </button>
              <button
                type="button"
                className="ubereats-btn neon-btn-strong"
                onClick={() => abrirRegister("user")}
              >
                Registro
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ===== Main ===== */}
      <main className="container main-pad" role="main">
        {/* Hero */}
        <section className="hero-card neon-card" aria-labelledby="hero-titulo">
          <div className="hero-flex">
            <div className="hero-col">
              <h2 id="hero-titulo" className="hero-title neon-title">
                Comunicación sin barreras
              </h2>
              <p className="hero-sub neon-muted">
                Conectamos a la comunidad sorda con intérpretes certificados de lengua de señas
                chilena (LSCh) las 24 horas del día.
              </p>
              <div className="hero-ctas" role="group" aria-label="Acciones principales">
                <button
                  type="button"
                  className="cta-round cta-strong pulse-animation neon-cta"
                  onClick={() => navigate("/solicitar")}
                >
                  <i className="fas fa-bolt" aria-hidden="true" /> Intérprete Ahora
                </button>
                <button
                  type="button"
                  className="cta-round cta-outline neon-cta-outline"
                  onClick={() => navigate("/agendar")}
                >
                  <i className="fas fa-calendar-alt" aria-hidden="true" /> Agendar
                </button>
              </div>
            </div>

            <div className="hero-col img-col">
              {/* Video con controles */}
              <div
                className="hero-video-wrap"
                ref={wrapRef}
                style={{ position: "relative" }}
                role="region"
                aria-label="Reproductor de video de bienvenida"
                tabIndex={0}
                onKeyDown={handleKeyDown}
              >
                <video
                  className="hero-video"
                  ref={videoRef}
                  src="/logo-bienvenido.mp4"
                  preload="metadata"
                  poster="/assets/interpreteya-logo1.jpg"
                  autoPlay
                  loop
                  muted
                  playsInline
                  aria-label="Video de bienvenida InterpreteYa"
                >
                  {/* Subtítulos: coloca subtitles-es.vtt en /public */}
                  <track
                    ref={trackRef}
                    kind="captions"
                    srcLang="es"
                    label="Español"
                    src="/subtitles-es.vtt"
                    default
                  />
                  Tu navegador no soporta video HTML5.
                </video>

                {/* Anuncio accesible del volumen (no visible) */}
                <span
                  aria-live="polite"
                  style={{
                    position: "absolute",
                    width: 1,
                    height: 1,
                    margin: -1,
                    padding: 0,
                    overflow: "hidden",
                    clip: "rect(0 0 0 0)",
                    whiteSpace: "nowrap",
                    border: 0,
                  }}
                >
                  Volumen {volumePct}%
                </span>

                {/* --- Controles a la DERECHA, en columna, para no tapar subtítulos --- */}
                <div className="videoControls right">
                  <div
                    className="controlBar vertical"
                    role="group"
                    aria-label="Controles de video"
                    onMouseEnter={() => setVolOpen(true)}
                    onMouseLeave={() => setVolOpen(false)}
                  >
                    {/* Play / Pause */}
                    <button
                      type="button"
                      className="vcBtn"
                      onClick={togglePlayPause}
                      aria-label={isPlaying ? "Pausar video" : "Reproducir video"}
                      title={isPlaying ? "Pausar" : "Reproducir"}
                      aria-pressed={isPlaying}
                    >
                      <i className={`fas ${isPlaying ? "fa-pause" : "fa-play"}`} aria-hidden="true" />
                    </button>

                    {/* Subtítulos (CC) */}
                    <button
                      type="button"
                      className="vcBtn"
                      onClick={toggleCaptions}
                      aria-label={captionsOn ? "Ocultar subtítulos" : "Mostrar subtítulos"}
                      title={captionsOn ? "Subtítulos: ON" : "Subtítulos: OFF"}
                      aria-pressed={captionsOn}
                    >
                      <i className="fas fa-closed-captioning" aria-hidden="true" />
                    </button>

                    {/* Volumen */}
                    <div className={`volumeWrap column ${volOpen ? "vol-open" : ""}`}>
                      <button
                        type="button"
                        className="vcBtn"
                        onClick={toggleMute}
                        aria-label={isMuted ? "Activar sonido" : "Silenciar"}
                        title={isMuted ? "Activar sonido" : "Silenciar"}
                        aria-pressed={!isMuted}
                      >
                        <i className={`fas ${volumeIcon}`} aria-hidden="true" />
                      </button>

                      {/* Slider vertical */}
                      <div className={`vertSliderBox ${volOpen ? "show" : ""}`}>
                        <input
                          className="vcSlider vertical"
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={isMuted ? 0 : volume}
                          onChange={(e) => changeVolume(e)}
                          onFocus={() => setVolOpen(true)}
                          onBlur={() => setVolOpen(false)}
                          aria-label="Volumen"
                          aria-valuemin={0}
                          aria-valuemax={1}
                          aria-valuenow={isMuted ? 0 : Number(volume.toFixed(2))}
                          aria-valuetext={`${volumePct}%`}
                          title="Volumen"
                        />
                      </div>
                    </div>

                    {/* Pantalla completa */}
                    <button
                      type="button"
                      className="vcBtn"
                      onClick={toggleFullscreen}
                      aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                      title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                      aria-pressed={isFullscreen}
                    >
                      <i className={`fas ${isFullscreen ? "fa-compress" : "fa-expand"}`} aria-hidden="true" />
                    </button>
                  </div>
                </div>
                {/* --- /Controles --- */}
              </div>
            </div>
          </div>
        </section>

        {/* Radar (demo) */}
        <section className="card white mb-8 neon-card" aria-label="Intérpretes disponibles cerca de ti">
          <div className="card-head">
            <h2 className="card-title">Intérpretes disponibles cerca de ti</h2>
            <span className="muted neon-muted">
              <i className="fas fa-map-marker-alt text-blue" aria-hidden="true" /> {ubicacion}
            </span>
          </div>

          <div className="radar-wrap neon-radar">
            <div className="radar-circle" aria-hidden="true" />
            <div className="interpreter-marker mk-1">
              <div className="pulse-dot" />
              <div className="mk-label">María G. (0.5 km)</div>
            </div>
            <div className="interpreter-marker mk-2">
              <div className="pulse-dot" />
              <div className="mk-label">Juan P. (1.2 km)</div>
            </div>
            <div className="interpreter-marker mk-3">
              <div className="pulse-dot" />
              <div className="mk-label">Carla S. (2.1 km)</div>
            </div>

            <div className="radar-actions">
              <button type="button" className="btn-blue neon-btn" onClick={actualizarUbicacion}>
                <i className="fas fa-sync-alt" aria-hidden="true" /> Actualizar ubicación
              </button>
            </div>
          </div>
        </section>

        {/* Botón "Vida Intérprete" */}
        <div className="center mb-16">
          <button
            type="button"
            className="ubereats-btn neon-btn-strong"
            onClick={() => navigate("/home2")}
          >
            🤟🏼 Vida Intérprete ➜
          </button>
        </div>
      </main>

      {/* ===== MODALES ===== */}
      {showLogin && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-title"
          onClick={cerrarTodo}
        >
          <div className="modal-card neon-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3 id="login-title">Iniciar Sesión</h3>
              <button className="icon-btn" onClick={cerrarTodo} aria-label="Cerrar">
                <i className="fas fa-times" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                cerrarTodo();
                navigate("/login");
              }}
            >
              <label className="label">Correo Electrónico</label>
              <input type="email" className="input" required autoComplete="email" />

              <label className="label">Contraseña</label>
              <input type="password" className="input" required autoComplete="current-password" />

              <button type="submit" className="btn-blue block mt-12 neon-btn-strong">
                Iniciar Sesión
              </button>

              <div className="center mt-10">
                <a className="link-blue neon-link" href="#">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </form>

            <div className="divider" />
            <div className="center">
              ¿No tienes una cuenta?{" "}
              <button type="button" className="link-blue neon-link" onClick={() => abrirRegister("user")}>
                Registro
              </button>
            </div>
          </div>
        </div>
      )}

      {showRegister && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="register-title"
          onClick={cerrarTodo}
        >
          <div className="modal-card neon-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3 id="register-title">Registrarse</h3>
              <button className="icon-btn" onClick={cerrarTodo} aria-label="Cerrar">
                <i className="fas fa-times" />
              </button>
            </div>

            {/* Tabs */}
            <div className="tabs" role="tablist" aria-label="Tipo de registro">
              <button
                type="button"
                role="tab"
                aria-selected={regTab === "user"}
                className={`tab-btn ${regTab === "user" ? "active" : ""}`}
                onClick={() => setRegTab("user")}
              >
                Usuario
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={regTab === "interpreter"}
                className={`tab-btn ${regTab === "interpreter" ? "active" : ""}`}
                onClick={() => setRegTab("interpreter")}
              >
                Intérprete
              </button>
            </div>

            {/* ===== Formulario: Usuario ===== */}
            {regTab === "user" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  cerrarTodo();
                }}
              >
                <label className="label">Nombre Completo</label>
                <input type="text" className="input" required autoComplete="name" />

                <label className="label">Correo Electrónico</label>
                <input type="email" className="input" required autoComplete="email" />

                <label className="label">Contraseña</label>
                <input type="password" className="input" required autoComplete="new-password" />

                <label className="label">RUT</label>
                <input type="text" className="input" placeholder="12.345.678-9" />

                <label className="label">Credencial de Discapacidad</label>
                <input type="file" className="input" />

                <label className="checkbox">
                  <input type="checkbox" required /> Acepto los{" "}
                  <a href="#" className="link-blue neon-link">Términos y Condiciones</a>
                </label>

                <button type="submit" className="btn-blue block mt-12 neon-btn-strong">
                  Registrarse como Usuario
                </button>

                <div className="divider" />
                <div className="center">
                  ¿Ya tienes una cuenta?{" "}
                  <button type="button" className="link-blue neon-link" onClick={abrirLogin}>
                    Inicia Sesión
                  </button>
                </div>
              </form>
            )}

            {/* ===== Formulario: Intérprete ===== */}
            {regTab === "interpreter" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  cerrarTodo();
                }}
              >
                <label className="label">Nombre Completo</label>
                <input type="text" className="input" required />

                <label className="label">Correo Electrónico</label>
                <input type="email" className="input" required />

                <label className="label">Contraseña</label>
                <input type="password" className="input" required />

                <label className="label">RUT</label>
                <input type="text" className="input" placeholder="12.345.678-9" />

                <label className="label">Certificación LSCh</label>
                <input type="file" className="input" />

                <label className="label">Años de Experiencia</label>
                <input type="number" className="input" min="0" />

                <label className="checkbox">
                  <input type="checkbox" required /> Acepto los{" "}
                  <a href="#" className="link-blue neon-link">Términos y Condiciones</a>
                </label>

                <button type="submit" className="btn-purple block mt-12 neon-btn-strong">
                  Registrarse como Intérprete
                </button>

                <div className="divider" />
                <div className="center">
                  ¿Ya tienes una cuenta?{" "}
                  <button type="button" className="link-blue neon-link" onClick={abrirLogin}>
                    Inicia Sesión
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
