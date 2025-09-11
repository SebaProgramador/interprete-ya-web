import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";

export default function VideoHero({ onSolicitar = () => {}, onAgendar = () => {} }) {
  const wrapRef = useRef(null);
  const videoRef = useRef(null);
  const trackRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [volOpen, setVolOpen] = useState(false);
  const [volume, setVolume] = useState(() => {
    const v = localStorage.getItem("iy_vol");
    return v !== null ? Math.max(0, Math.min(1, Number(v))) : 0.6;
  });

  const volumePct = useMemo(() => Math.round((isMuted ? 0 : volume) * 100), [isMuted, volume]);
  const volumeIcon = useMemo(
    () => (isMuted || volume === 0 ? "fa-volume-mute" : volume < 0.5 ? "fa-volume-down" : "fa-volume-up"),
    [isMuted, volume]
  );

  // Inicialización básica del video
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true; // autoplay seguro
    v.playsInline = true;
    v.controls = false;
    v.preload = "metadata";
    v.volume = volume;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);

    const onFs = () =>
      setIsFullscreen(Boolean(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    document.addEventListener("webkitfullscreenchange", onFs);
    document.addEventListener("MSFullscreenChange", onFs);

    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      document.removeEventListener("fullscreenchange", onFs);
      document.removeEventListener("webkitfullscreenchange", onFs);
      document.removeEventListener("MSFullscreenChange", onFs);
    };
  }, [volume]);

  // Guardar volumen
  useEffect(() => localStorage.setItem("iy_vol", String(volume)), [volume]);

  // Subtítulos ON/OFF
  useEffect(() => {
    const t = trackRef.current;
    if (!t) return;
    try {
      t.mode = captionsOn ? "showing" : "hidden";
    } catch {}
  }, [captionsOn]);

  // Accesos rápidos del teclado
  const handleKeyDown = (e) => {
    if (e.key === " ") e.preventDefault();
    const key = e.key.toLowerCase();
    if (key === " ") togglePlayPause();
    if (key === "m") toggleMute();
    if (key === "f") toggleFullscreen();
    if (key === "c") setCaptionsOn((s) => !s);
    if (key === "arrowup") changeVolume(volume + 0.05);
    if (key === "arrowdown") changeVolume(volume - 0.05);
  };

  const togglePlayPause = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const next = !v.muted;
    v.muted = next;
    setIsMuted(next);
    if (!next && v.volume === 0) {
      v.volume = 0.5;
      setVolume(0.5);
    }
    setVolOpen((s) => !s);
  }, []);

  const changeVolume = (valOrEvt) => {
    const val = typeof valOrEvt === "number" ? valOrEvt : Number(valOrEvt.target.value);
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

  return (
    <section className="hero-card card">
      <div className="hero-flex">
        {/* Texto */}
        <div className="hero-col">
          <h2 className="heroTitle">
            Comunicación <br /> sin barreras <span aria-hidden="true">🤟</span>
          </h2>
          <p className="heroSub">
            Conectamos a la comunidad sorda con intérpretes certificados de Lengua de Señas Chilena (LSCh) 24/7.
            <span className="chips">
              <span className="chip">🧏‍♀️ Comunidad</span>
              <span className="chip">🎥 Videollamada</span>
              <span className="chip">📍 Presencial</span>
            </span>
          </p>
          <div className="hero-ctas" role="group" aria-label="Acciones principales">
            <button type="button" className="btn lg" onClick={onSolicitar}>
              ⚡ Intérprete Ahora
            </button>
            <button type="button" className="btn secondary lg" onClick={onAgendar}>
              📅 Agendar
            </button>
          </div>
        </div>

        {/* Video */}
        <div className="hero-col img-col">
          <div
            className="hero-video-wrap"
            ref={wrapRef}
            role="region"
            aria-label="Video de bienvenida"
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
            <video
              className="hero-video"
              ref={videoRef}
              poster="/assets/interpreteya-logo1.jpg"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              aria-label="Video de bienvenida InterpreteYa"
              onError={() => console.warn("No se pudo cargar el video. Revisa rutas en /public.")}
            >
              <source src="/logo-bienvenido.webm" type="video/webm" />
              <source src="/logo-bienvenido.mp4" type="video/mp4" />
              <track ref={trackRef} kind="captions" srcLang="es" label="Español" src="/subtitles-es.vtt" default />
              Tu navegador no soporta video HTML5.
            </video>

            {/* Estado de volumen para lectores */}
            <span className="sr-only" aria-live="polite">Volumen {volumePct}%</span>

            {/* Controles */}
            <div className="videoControls right">
              <div
                className="controlBar vertical"
                role="group"
                aria-label="Controles de video"
                onMouseEnter={() => setVolOpen(true)}
                onMouseLeave={() => setVolOpen(false)}
              >
                <button
                  type="button"
                  className="vcBtn"
                  onClick={togglePlayPause}
                  aria-label={isPlaying ? "Pausar video" : "Reproducir video"}
                  aria-pressed={isPlaying}
                  title={isPlaying ? "Pausar" : "Reproducir"}
                >
                  <i className={`fas ${isPlaying ? "fa-pause" : "fa-play"}`} aria-hidden="true" />
                </button>

                <button
                  type="button"
                  className="vcBtn"
                  onClick={() => setCaptionsOn((s) => !s)}
                  aria-label={captionsOn ? "Ocultar subtítulos" : "Mostrar subtítulos"}
                  aria-pressed={captionsOn}
                  title={captionsOn ? "Subtítulos: ON" : "Subtítulos: OFF"}
                >
                  <i className="fas fa-closed-captioning" aria-hidden="true" />
                </button>

                <div className={`volumeWrap column ${volOpen ? "vol-open" : ""}`}>
                  <button
                    type="button"
                    className="vcBtn"
                    onClick={toggleMute}
                    aria-label={isMuted ? "Activar sonido" : "Silenciar"}
                    aria-pressed={!isMuted}
                    title={isMuted ? "Activar sonido" : "Silenciar"}
                  >
                    <i className={`fas ${volumeIcon}`} aria-hidden="true" />
                  </button>
                  <div className={`vertSliderBox ${volOpen ? "show" : ""}`}>
                    <input
                      className="vcSlider vertical"
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={changeVolume}
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

                <button
                  type="button"
                  className="vcBtn"
                  onClick={toggleFullscreen}
                  aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                  aria-pressed={isFullscreen}
                  title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                >
                  <i className={`fas ${isFullscreen ? "fa-compress" : "fa-expand"}`} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
