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

  // ===== Términos & Condiciones =====
  const [tcOpen, setTcOpen] = useState(false);
  const [tcAudience, setTcAudience] = useState("user"); // "user" | "interpreter"
  const [tcScrolledEnd, setTcScrolledEnd] = useState(false);
  const [tcAcceptedUser, setTcAcceptedUser] = useState(false);
  const [tcAcceptedInt, setTcAcceptedInt] = useState(false);

  // ===== Video state / refs =====
  const videoRef = useRef(null);
  const trackRef = useRef(null);
  const wrapRef = useRef(null);

  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(() => {
    const v = localStorage.getItem("iy_vol");
    return v !== null ? Math.max(0, Math.min(1, Number(v))) : 0.6;
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volOpen, setVolOpen] = useState(false);
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
  const hayModal = showLogin || showRegister || tcOpen;
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = hayModal ? "hidden" : prev;
    return () => (document.body.style.overflow = prev);
  }, [hayModal]);

  // Cerrar con ESC (para modales)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (tcOpen) setTcOpen(false);
        else cerrarTodo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cerrarTodo, tcOpen]);

  // Abrir modal de Registro si venimos desde otra ruta con state
  useEffect(() => {
    if (location?.state?.openRegister) {
      abrirRegister(location?.state?.regTab || "user");
      navigate(".", { replace: true, state: {} });
    }
  }, [location, abrirRegister, navigate]);

  // Inicializar video + listeners
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.playsInline = true;
    v.controls = false;
    v.preload = "metadata";
    v.volume = volume;

    const onFsChange = () => {
      const fs = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
      setIsFullscreen(!!fs);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    document.addEventListener("MSFullscreenChange", onFsChange);

    const onPointer = (e) => {
      if (e.target.closest?.(".videoControls")) return;
      const now = Date.now();
      const last = v._lastTapTs || 0;
      v._lastTapTs = now;
      if (now - last < 300) { v.paused ? v.play() : v.pause(); }
    };
    v.addEventListener("pointerdown", onPointer);

    const preventContext = (e) => e.preventDefault();
    v.addEventListener("contextmenu", preventContext);

    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("pointerdown", onPointer);
      v.removeEventListener("contextmenu", preventContext);
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
      document.removeEventListener("MSFullscreenChange", onFsChange);
    };
  }, [volume]);

  // Subtítulos ON/OFF
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    try { track.mode = captionsOn ? "showing" : "hidden"; } catch {}
  }, [captionsOn]);

  // Guardar volumen
  useEffect(() => { localStorage.setItem("iy_vol", String(volume)); }, [volume]);

  // Pausar cuando la pestaña no está visible
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onVis = () => {
      if (document.hidden && !v.paused) v.pause();
      else if (!document.hidden && v.paused) v.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Pausar si el video sale de pantalla
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !("IntersectionObserver" in window)) return;
    let userPaused = false;
    const onPlay = () => { userPaused = false; };
    const onPause = () => { userPaused = true; };
    v.addEventListener("pause", onPause);
    v.addEventListener("play", onPlay);

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting && !v.paused) v.pause();
        if (e.isIntersecting && v.paused && !userPaused) v.play().catch(() => {});
      });
    }, { threshold: 0.2 });
    io.observe(v);

    return () => {
      v.removeEventListener("pause", onPause);
      v.removeEventListener("play", onPlay);
      io.disconnect();
    };
  }, []);

  // ===== Controles de video =====
  const toggleMute = () => {
    const v = videoRef.current; if (!v) return;
    const next = !v.muted; v.muted = next; setIsMuted(next);
    if (!next && v.volume === 0) { v.volume = 0.5; setVolume(0.5); }
    setVolOpen((s) => !s);
  };

  const changeVolume = (valOrEvent) => {
    const val = typeof valOrEvent === "number" ? valOrEvent : Number(valOrEvent.target.value);
    const v = videoRef.current; if (!v) return;
    const clamped = Math.max(0, Math.min(1, val)); v.volume = clamped; setVolume(clamped);
    if (clamped > 0 && v.muted) { v.muted = false; setIsMuted(false); }
    if (clamped === 0 && !v.muted) { v.muted = true; setIsMuted(true); }
  };

  const toggleFullscreen = async () => {
    const el = wrapRef.current; if (!el) return;
    const d = document; const isFs = d.fullscreenElement || d.webkitFullscreenElement || d.msFullscreenElement;
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
    const v = videoRef.current; if (!v) return;
    if (v.paused) v.play().catch(() => {}); else v.pause();
  };

  const toggleCaptions = () => setCaptionsOn((s) => !s);

  // Atajos de teclado
  const handleKeyDown = (e) => {
    if (e.key === " ") e.preventDefault();
    switch (e.key.toLowerCase()) {
      case " ": togglePlayPause(); break;
      case "m": toggleMute(); break;
      case "f": toggleFullscreen(); break;
      case "c": toggleCaptions(); break;
      case "arrowup": changeVolume(volume + 0.05); break;
      case "arrowdown": changeVolume(volume - 0.05); break;
      default: break;
    }
  };

  const volumeIcon = isMuted || volume === 0 ? "fa-volume-mute" : volume < 0.5 ? "fa-volume-down" : "fa-volume-up";
  const volumePct = Math.round((isMuted ? 0 : volume) * 100);

  // ====== T&C helpers ======
  const openTerms = (aud) => {
    setTcAudience(aud);
    setTcScrolledEnd(false);
    setTcOpen(true);
  };

  const onScrollTerms = (e) => {
    const el = e.currentTarget;
    const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
    if (atEnd) setTcScrolledEnd(true);
  };

  const acceptTerms = () => {
    if (!tcScrolledEnd) return;
    if (tcAudience === "user") setTcAcceptedUser(true);
    else setTcAcceptedInt(true);
    setTcOpen(false);
  };

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
              <button type="button" className="ubereats-btn neon-btn-strong" onClick={() => abrirRegister("user")}>
                <i className="fas fa-user-plus" aria-hidden="true" style={{marginRight:8}}/> Registro
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
              <h2 id="hero-titulo" className="hero-title neon-title">Comunicación sin barreras</h2>
              <p className="hero-sub neon-muted">
                Conectamos a la comunidad sorda con intérpretes certificados de Lengua de Señas Chilena (LSCh) las 24 horas del día.
              </p>
              <div className="hero-ctas" role="group" aria-label="Acciones principales">
                <button type="button" className="cta-round cta-strong pulse-animation neon-cta" onClick={() => navigate("/solicitar")}>
                  <i className="fas fa-bolt" aria-hidden="true" /> Intérprete Ahora
                </button>
                <button type="button" className="cta-round cta-outline neon-cta-outline" onClick={() => navigate("/agendar")}>
                  <i className="fas fa-calendar-alt" aria-hidden="true" /> Agendar
                </button>
              </div>
            </div>

            <div className="hero-col img-col">
              <div className="hero-video-wrap" ref={wrapRef} style={{ position: "relative" }} role="region" aria-label="Reproductor de video de bienvenida" tabIndex={0} onKeyDown={handleKeyDown}>
                <video className="hero-video" ref={videoRef} poster="/assets/interpreteya-logo1.jpg" autoPlay loop muted playsInline preload="metadata" aria-label="Video de bienvenida InterpreteYa" onError={() => console.warn("No se pudo cargar el video. Revisa rutas en /public.")}>
                  <source src="/logo-bienvenido.webm" type="video/webm" />
                  <source src="/logo-bienvenido.mp4" type="video/mp4" />
                  <track ref={trackRef} kind="captions" srcLang="es" label="Español" src="/subtitles-es.vtt" default />
                  Tu navegador no soporta video HTML5.
                </video>

                <span aria-live="polite" style={{ position: "absolute", width: 1, height: 1, margin: -1, padding: 0, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 }}>
                  Volumen {volumePct}%
                </span>

                <div className="videoControls right">
                  <div className="controlBar vertical" role="group" aria-label="Controles de video" onMouseEnter={() => setVolOpen(true)} onMouseLeave={() => setVolOpen(false)}>
                    <button type="button" className="vcBtn" onClick={togglePlayPause} aria-label={isPlaying ? "Pausar video" : "Reproducir video"} title={isPlaying ? "Pausar" : "Reproducir"} aria-pressed={isPlaying}>
                      <i className={`fas ${isPlaying ? "fa-pause" : "fa-play"}`} aria-hidden="true" />
                    </button>
                    <button type="button" className="vcBtn" onClick={toggleCaptions} aria-label={captionsOn ? "Ocultar subtítulos" : "Mostrar subtítulos"} title={captionsOn ? "Subtítulos: ON" : "Subtítulos: OFF"} aria-pressed={captionsOn}>
                      <i className="fas fa-closed-captioning" aria-hidden="true" />
                    </button>
                    <div className={`volumeWrap column ${volOpen ? "vol-open" : ""}`}>
                      <button type="button" className="vcBtn" onClick={toggleMute} aria-label={isMuted ? "Activar sonido" : "Silenciar"} title={isMuted ? "Activar sonido" : "Silenciar"} aria-pressed={!isMuted}>
                        <i className={`fas ${volumeIcon}`} aria-hidden="true" />
                      </button>
                      <div className={`vertSliderBox ${volOpen ? "show" : ""}`}>
                        <input className="vcSlider vertical" type="range" min="0" max="1" step="0.01"
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
                    <button type="button" className="vcBtn" onClick={toggleFullscreen} aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"} title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"} aria-pressed={isFullscreen}>
                      <i className={`fas ${isFullscreen ? "fa-compress" : "fa-expand"}`} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Radar (demo) */}
        <section className="card white mb-8 neon-card" aria-label="Intérpretes disponibles cerca de ti">
          <div className="card-head">
            <h2 className="card-title">Intérpretes disponibles cerca de ti</h2>
            <span className="muted neon-muted"><i className="fas fa-map-marker-alt text-blue" aria-hidden="true" /> {ubicacion}</span>
          </div>

          <div className="radar-wrap neon-radar">
            <div className="radar-circle" aria-hidden="true" />
            <div className="interpreter-marker mk-1"><div className="pulse-dot" /><div className="mk-label">María G. (0.5 km)</div></div>
            <div className="interpreter-marker mk-2"><div className="pulse-dot" /><div className="mk-label">Juan P. (1.2 km)</div></div>
            <div className="interpreter-marker mk-3"><div className="pulse-dot" /><div className="mk-label">Carla S. (2.1 km)</div></div>

            <div className="radar-actions">
              <button type="button" className="btn-blue neon-btn" onClick={actualizarUbicacion}>
                <i className="fas fa-sync-alt" aria-hidden="true" /> Actualizar ubicación
              </button>
            </div>
          </div>
        </section>

        {/* Botón "Vida Intérprete" */}
        <div className="center mb-16">
          <button type="button" className="ubereats-btn neon-btn-strong" onClick={() => navigate("/home2")}>
            🤟🏼 Vida Intérprete ➜
          </button>
        </div>
      </main>

      {/* ===== MODALES ===== */}
      {showLogin && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="login-title" onClick={cerrarTodo}>
          <div className="modal-card neon-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3 id="login-title">Iniciar Sesión</h3>
              <button className="icon-btn" onClick={cerrarTodo} aria-label="Cerrar"><i className="fas fa-times" /></button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); cerrarTodo(); navigate("/login"); }}>
              <label className="label">Correo Electrónico</label>
              <input type="email" className="input" required autoComplete="email" />

              <label className="label">Contraseña</label>
              <input type="password" className="input" required autoComplete="current-password" />

              <button type="submit" className="btn-blue block mt-12 neon-btn-strong">Iniciar Sesión</button>
              <div className="center mt-10"><a className="link-blue neon-link" href="#">¿Olvidaste tu contraseña?</a></div>
            </form>

            <div className="divider" />
            <div className="center">¿No tienes una cuenta?{" "}
              <button type="button" className="link-blue neon-link" onClick={() => abrirRegister("user")}>Registro</button>
            </div>
          </div>
        </div>
      )}

      {showRegister && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="register-title" onClick={cerrarTodo}>
          <div className="modal-card neon-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3 id="register-title">Registrarse</h3>
              <button className="icon-btn" onClick={cerrarTodo} aria-label="Cerrar"><i className="fas fa-times" /></button>
            </div>

            {/* Tabs con logos */}
            <div className="tabs" role="tablist" aria-label="Tipo de registro">
              <button type="button" role="tab" aria-selected={regTab === "user"} className={`tab-btn ${regTab === "user" ? "active" : ""}`} onClick={() => setRegTab("user")}>
                <i className="fas fa-user-circle tab-ico" aria-hidden="true" />
                <span className="tab-text">Usuario</span>
              </button>
              <button type="button" role="tab" aria-selected={regTab === "interpreter"} className={`tab-btn ${regTab === "interpreter" ? "active" : ""}`} onClick={() => setRegTab("interpreter")}>
                <i className="fas fa-hands tab-ico" aria-hidden="true" />
                <span className="tab-text">Intérprete</span>
              </button>
            </div>

            {/* ===== Formulario: Usuario ===== */}
            {regTab === "user" && (
              <form onSubmit={(e) => { e.preventDefault(); cerrarTodo(); }}>
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

                {/* Casilla + enlace a T&C con gating */}
                <label className="checkbox">
                  <input
                    type="checkbox"
                    required
                    disabled={!tcAcceptedUser}
                    aria-describedby="termsNoteUser"
                  />{" "}
                  Acepto los{" "}
                  <button
                    type="button"
                    className="link-blue neon-link"
                    onClick={() => openTerms("user")}
                  >
                    Términos y Condiciones
                  </button>
                </label>
                <div id="termsNoteUser" role="note" className="muted neon-muted" style={{ marginTop: 6, lineHeight: 1.3 }}>
                  <span aria-hidden="true">🤟🏼</span>{" "}
                  <strong>Registro para la comunidad sorda.</strong>{" "}
                  <span aria-hidden="true">📄</span>{" "}
                  Debes leer hasta el final y aceptar los <em>Términos</em> para habilitar esta casilla.
                </div>

                <button type="submit" className="btn-identity user" aria-label="Registrarse como Usuario">
                  <span className="btn-ico" aria-hidden="true"><i className="fas fa-user-circle"></i></span>
                  <span className="btn-text">
                    <strong>Registrarse como Usuario</strong>
                    <small>Comunidad sorda</small>
                  </span>
                  <i className="fas fa-arrow-right btn-arrow" aria-hidden="true"></i>
                </button>

                <div className="divider" />
                <div className="center">¿Ya tienes una cuenta?{" "}
                  <button type="button" className="link-blue neon-link" onClick={() => abrirLogin()}>Inicia Sesión</button>
                </div>
              </form>
            )}

            {/* ===== Formulario: Intérprete ===== */}
            {regTab === "interpreter" && (
              <form onSubmit={(e) => { e.preventDefault(); cerrarTodo(); }}>
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

                {/* Casilla + enlace a T&C con gating */}
                <label className="checkbox">
                  <input
                    type="checkbox"
                    required
                    disabled={!tcAcceptedInt}
                    aria-describedby="termsNoteInt"
                  />{" "}
                  Acepto los{" "}
                  <button
                    type="button"
                    className="link-blue neon-link"
                    onClick={() => openTerms("interpreter")}
                  >
                    Términos y Condiciones
                  </button>
                </label>
                <div id="termsNoteInt" role="note" className="muted neon-muted" style={{ marginTop: 6, lineHeight: 1.3 }}>
                  <span aria-hidden="true">🤟🏼</span>{" "}
                  <strong>Registro para intérpretes LSCh.</strong>{" "}
                  <span aria-hidden="true">📄</span>{" "}
                  Debes leer hasta el final y aceptar los <em>Términos</em> para habilitar esta casilla.
                </div>

                <button type="submit" className="btn-identity interpreter" aria-label="Registrarse como Intérprete">
                  <span className="btn-ico" aria-hidden="true"><i className="fas fa-hands"></i></span>
                  <span className="btn-text">
                    <strong>Registrarse como Intérprete</strong>
                    <small>LSCh certificada/o</small>
                  </span>
                  <i className="fas fa-arrow-right btn-arrow" aria-hidden="true"></i>
                </button>

                <div className="divider" />
                <div className="center">¿Ya tienes una cuenta?{" "}
                  <button type="button" className="link-blue neon-link" onClick={() => abrirLogin()}>Inicia Sesión</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ===== TERMS & CONDITIONS MODAL (con gating por scroll) ===== */}
      {tcOpen && (
        <div className="modal-backdrop terms-modal" role="dialog" aria-modal="true" aria-labelledby="terms-title" onClick={() => setTcOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="terms-head">
              <h3 id="terms-title" className="terms-title">
                <i className="fas fa-file-contract" aria-hidden="true" />
                Términos y Condiciones de Uso
              </h3>
              <span className="chip-role">
                <i className={`fas ${tcAudience === "user" ? "fa-user" : "fa-hands"}`} aria-hidden="true" />
                {tcAudience === "user" ? "Usuario/a" : "Intérprete"}
              </span>
              <div className="terms-meta" aria-hidden="true">
                <i className="fas fa-calendar-day" /> Última act.: 09/2025
              </div>
              <button className="icon-btn" onClick={() => setTcOpen(false)} aria-label="Cerrar"><i className="fas fa-times" /></button>
            </div>

            <div className="terms-body" role="document" tabIndex={0} onScroll={onScrollTerms}>
              {/* Intro común */}
              <p>
                Este documento regula el acceso y uso de la aplicación desarrollada por <strong>André Heredia</strong> y <strong>Sebastián Valenzuela</strong> (la “Aplicación”), destinada a brindar servicios de interpretación en <strong>Lengua de Señas Chilena (LSCh)</strong> y, cuando corresponda, <strong>Lengua de Señas Internacional (IS)</strong>, tanto de forma <strong>presencial</strong> como por <strong>videollamada</strong>.
              </p>
              <p>
                Al registrarte y utilizar la Aplicación, declaras que has leído y aceptas estos Términos y Condiciones.
              </p>

              {/* 1. Registro */}
              <h4>1. Registro y verificación</h4>
              <ul>
                <li>Debes registrarte con datos <strong>verdaderos y completos</strong>.</li>
                {tcAudience === "user" ? (
                  <li>Podemos solicitar <strong>credencial de discapacidad</strong> u otro documento que acredite condición de persona sorda, para validación y seguridad.</li>
                ) : (
                  <li>Podemos solicitar <strong>certificación LSCh</strong> y otros antecedentes profesionales para validar tu perfil.</li>
                )}
                <li>Eres responsable de mantener tus datos actualizados y resguardar la <strong>confidencialidad</strong> de tus credenciales.</li>
              </ul>

              {/* 2. Conducta */}
              <h4>2. Conducta y respeto</h4>
              <ul>
                <li>Se exige un comportamiento respetuoso entre personas usuarias e intérpretes.</li>
                <li>Quedan prohibidos insultos, acoso, discriminación o cualquier conducta ofensiva.</li>
                <li>El incumplimiento reiterado puede implicar <strong>suspensión o cancelación</strong> de la cuenta.</li>
              </ul>

              {/* 3. Alcance */}
              <h4>3. Alcance del servicio</h4>
              <ul>
                <li>La Aplicación pone a disposición intérpretes de LSCh e IS para apoyar en salud, educación, trabajo, trámites y otros contextos.</li>
                <li>Modalidades:
                  <ul>
                    <li><strong>Presencial</strong>: sujeto a disponibilidad y traslados.</li>
                    <li><strong>Videollamada</strong>: mediante plataforma integrada.</li>
                  </ul>
                </li>
                <li>La modalidad presencial puede tener <strong>costo superior</strong> por traslados y tiempos asociados.</li>
              </ul>

              {/* 4. Emergencias */}
              <h4>4. Emergencias</h4>
              <ul>
                <li>Se podrán ofrecer <strong>servicios gratuitos</strong> en emergencias comprobadas, según disponibilidad.</li>
                <li>Emergencia: riesgo vital, urgencias médicas u otras situaciones graves y urgentes.</li>
              </ul>

              {/* 5. Pagos */}
              <h4>5. Pagos y tarifas</h4>
              <ul>
                <li>Te comprometes a pagar <strong>puntualmente</strong> los servicios solicitados.</li>
                <li>El valor depende de duración, modalidad y ubicación (para traslados).</li>
                <li><em>Referencia</em> (sujeta a cambio): videollamada hasta 10 minutos ≈ <strong>$5.000 CLP</strong>.</li>
                <li>El cobro puede ser por <strong>minuto</strong>, <strong>hora</strong> o <strong>agenda pactada</strong>.</li>
                <li>La falta de pago puede ocasionar suspensión temporal del acceso.</li>
              </ul>

              {/* 6. Datos */}
              <h4>6. Seguridad y protección de datos</h4>
              <ul>
                <li>Protegemos la <strong>confidencialidad</strong> de tu información y la usamos solo para prestar el servicio.</li>
                <li>No compartimos datos personales sin tu <strong>autorización</strong>, salvo exigencia legal.</li>
                <li>Aplicamos <strong>medidas técnicas de seguridad</strong> para proteger las interacciones.</li>
              </ul>

              {/* 7. Responsabilidad */}
              <h4>7. Responsabilidad</h4>
              <ul>
                <li>La Aplicación es una <strong>plataforma intermediaria</strong> entre usuarios e intérpretes.</li>
                <li>No somos responsables de retrasos, cancelaciones o contingencias fuera de nuestro control.</li>
                <li>La interpretación es realizada por profesionales <strong>acreditados</strong>.</li>
                <li>Debes dar a la Aplicación un uso <strong>legítimo y responsable</strong>.</li>
              </ul>

              {/* 8. Modificaciones */}
              <h4>8. Modificaciones</h4>
              <ul>
                <li>Podemos actualizar estos Términos periódicamente.</li>
                <li>Los cambios se informarán en la Aplicación y regirán desde su publicación.</li>
              </ul>

              {/* 9. Sección específica por audiencia */}
              {tcAudience === "user" ? (
                <>
                  <h4>9. Condiciones específicas — Usuario/a</h4>
                  <ul>
                    <li>El servicio es de apoyo comunicacional; no reemplaza diagnósticos médicos, asesorías legales ni decisiones de terceros.</li>
                    <li>Debes proporcionar información de contexto veraz para que la interpretación sea precisa.</li>
                  </ul>
                </>
              ) : (
                <>
                  <h4>9. Condiciones específicas — Intérprete</h4>
                  <ul>
                    <li>Debes mantener estándares profesionales de ética y confidencialidad.</li>
                    <li>La disponibilidad, tarifas y agenda pueden gestionarse desde tu perfil y están sujetas a políticas de la plataforma.</li>
                  </ul>
                </>
              )}

              {/* 10. Aceptación */}
              <h4>10. Aceptación</h4>
              <p>
                Al seleccionar <strong>“Acepto los Términos y Condiciones”</strong>, confirmas que leíste, comprendiste y aceptas plenamente este documento.
              </p>

              {/* Pista de scroll */}
              {!tcScrolledEnd && (
                <div className="scroll-tip" aria-live="polite">
                  Desplázate hasta el final para habilitar el botón <strong>Acepto</strong>.
                </div>
              )}
            </div>

            {/* Barra de estado simple */}
            <div className="terms-progress" aria-hidden="true">
              <div className={`bar ${tcScrolledEnd ? "done" : ""}`} />
            </div>

            <div className="terms-foot">
              <button className="terms-btn" onClick={() => setTcOpen(false)}>
                Cerrar
              </button>
              <button
                className="terms-btn primary"
                onClick={acceptTerms}
                disabled={!tcScrolledEnd}
                aria-disabled={!tcScrolledEnd}
                title={!tcScrolledEnd ? "Desplázate hasta el final para aceptar" : "Aceptar Términos"}
              >
                Acepto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
