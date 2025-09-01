// src/pages/Videollamada.js
import React, { useEffect, useRef, useState } from "react";
import { Page, Row } from "../components/ui";
import { auth } from "../firebase";

function useQuery() {
  const [q] = useState(() => new URLSearchParams(window.location.search));
  return q;
}

export default function Videollamada() {
  const q = useQuery();
  const containerRef = useRef(null);
  const apiRef = useRef(null);

  const defaultName =
    (auth.currentUser?.displayName || auth.currentUser?.email || "Invitado") + "";
  const defaultRoom =
    q.get("room") ||
    `interpreteya-${(auth.currentUser?.uid || "anon").slice(0,8)}-${Date.now()
      .toString(36)
      .slice(-5)}`;

  const [room, setRoom] = useState(defaultRoom);
  const [displayName, setDisplayName] = useState(q.get("name") || defaultName);
  const [started, setStarted] = useState(false);
  const [loadingApi, setLoadingApi] = useState(false);
  const [error, setError] = useState("");

  // Carga del script externo de Jitsi si falta
  const ensureJitsiScript = () =>
    new Promise((resolve, reject) => {
      if (window.JitsiMeetExternalAPI) return resolve();
      const s = document.createElement("script");
      s.src = "https://meet.jit.si/external_api.js";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("No se pudo cargar Jitsi API"));
      document.body.appendChild(s);
    });

  const startMeeting = async () => {
    setError("");
    setStarted(true);
    setLoadingApi(true);
    try {
      await ensureJitsiScript();
      const domain = "meet.jit.si";
      const opts = {
        roomName: room,
        parentNode: containerRef.current,
        userInfo: { displayName },
        configOverwrite: {
          prejoinPageEnabled: true,
        },
        interfaceConfigOverwrite: {
          // Deja la interfaz simple
          TOOLBAR_BUTTONS: [
            "microphone", "camera", "desktop", "tileview", "chat",
            "hangup", "fullscreen", "select-background",
          ],
        },
      };
      apiRef.current = new window.JitsiMeetExternalAPI(domain, opts);
      apiRef.current.addListener("videoConferenceJoined", () => setLoadingApi(false));
      apiRef.current.addListener("readyToClose", () => {
        // Cuando cuelgan
        setStarted(false);
        apiRef.current?.dispose();
        apiRef.current = null;
      });
    } catch (e) {
      setLoadingApi(false);
      setError(
        "No pudimos iniciar Jitsi. Abre en nueva pestaña: " +
          `https://meet.jit.si/${encodeURIComponent(room)}`
      );
    }
  };

  const openNewTab = () => {
    window.open(`https://meet.jit.si/${encodeURIComponent(room)}`, "_blank");
  };

  // Limpieza al salir de la página
  useEffect(() => {
    return () => {
      apiRef.current?.dispose();
      apiRef.current = null;
    };
  }, []);

  return (
    <Page title="Videollamada">
      {!started ? (
        <div style={{ display: "grid", gap: 12 }}>
          <label>
            Nombre para la sala (compártelo con el intérprete):
            <input
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Nombre de la sala"
            />
          </label>

          <label>
            Tu nombre para mostrar:
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Tu nombre"
            />
          </label>

          <Row>
            <button className="btn" onClick={startMeeting}>Iniciar sala aquí</button>
            <button className="btn secondary" onClick={openNewTab}>Abrir en pestaña nueva</button>
          </Row>

          <p className="badge">
            Consejo: usa buena luz 💡, cámara al frente 🎥 y fondo simple.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {loadingApi && <p className="badge">Cargando videollamada…</p>}
          {error && (
            <div className="badge" style={{ background: "#c62828", color: "#fff" }}>
              {error}{" "}
              <button className="btn secondary" onClick={openNewTab} style={{ marginLeft: 8 }}>
                Abrir ahora
              </button>
            </div>
          )}
          <div
            ref={containerRef}
            style={{
              width: "100%",
              minHeight: 520,
              borderRadius: 12,
              overflow: "hidden",
              background: "#0a192f",
            }}
          />
          <Row>
            <button
              className="btn secondary"
              onClick={() => {
                apiRef.current?.executeCommand("toggleAudio");
              }}
            >
              Silenciar / Activar mic
            </button>
            <button
              className="btn secondary"
              onClick={() => {
                apiRef.current?.executeCommand("toggleVideo");
              }}
            >
              Apagar / Prender cámara
            </button>
            <button
              className="btn"
              onClick={() => {
                apiRef.current?.dispose();
                apiRef.current = null;
                setStarted(false);
              }}
            >
              Colgar
            </button>
          </Row>
          <p className="badge">
            Enlace directo: https://meet.jit.si/<b>{room}</b>
          </p>
        </div>
      )}
    </Page>
  );
}
