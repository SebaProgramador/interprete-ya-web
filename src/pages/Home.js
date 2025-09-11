// src/pages/Home.js
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./home.css";

import VideoHero from "../components/VideoHero";
import NearbyMap from "../components/NearbyMap";
import AuthModals from "../components/AuthModals";
import TermsModal from "../components/TermsModal";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  // ===== UI =====
  // Eliminamos showLogin (no se usa más el modal de login)
  const [showRegister, setShowRegister] = useState(false);
  const [regTab, setRegTab] = useState("user"); // "user" | "interpreter"
  const [ubicacion, setUbicacion] = useState("Santiago, Chile");

  // ===== Términos & Condiciones =====
  const [tcOpen, setTcOpen] = useState(false);
  const [tcAudience, setTcAudience] = useState("user"); // "user" | "interpreter"
  const [tcAcceptedUser, setTcAcceptedUser] = useState(false);
  const [tcAcceptedInt, setTcAcceptedInt] = useState(false);

  // Acciones rápidas
  const abrirRegister = useCallback((tab = "user") => {
    setRegTab(tab);
    setShowRegister(true);
  }, []);

  const cerrarTodo = useCallback(() => {
    setShowRegister(false);
  }, []);

  const actualizarUbicacion = () => setUbicacion("Santiago, Chile");

  // Bloqueo de scroll con modal abierto (solo registro o T&C)
  const hayModal = showRegister || tcOpen;
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = hayModal ? "hidden" : prev;
    return () => {
      document.body.style.overflow = prev;
    };
  }, [hayModal]);

  // Cerrar con ESC
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

  // Términos y Condiciones
  const openTerms = (aud) => {
    setTcAudience(aud);
    setTcOpen(true);
  };

  const acceptTerms = () => {
    if (tcAudience === "user") setTcAcceptedUser(true);
    else setTcAcceptedInt(true);
    setTcOpen(false);
  };

  return (
    <div className="theme-cyber">
      <a className="skip-link" href="#main">Saltar al contenido</a>

      {/* Header */}
      <header className="iy-header sticky" role="banner">
        <div className="container header-row">
          <button className="brand" onClick={() => navigate("/")}>
            <span className="logoWrap">
              <img src="/interpreteya-logo.png" alt="InterpreteYa" />
            </span>
            <span className="brand-text">
              InterpreteYa <span aria-hidden="true">🤟</span>
            </span>
          </button>

          <nav className="nav-actions" aria-label="Principal">
            {/* Ingresar ahora navega a /login */}
            <button
              type="button"
              className="btn secondary chip"
              onClick={() => navigate("/login")}
            >
              🔑 Ingresar
            </button>
            <button
              type="button"
              className="btn pill"
              onClick={() => abrirRegister("user")}
            >
              🧏‍♀️ Registro
            </button>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main id="main" className="container main-pad" role="main">
        <VideoHero
          onSolicitar={() => navigate("/solicitar")}
          onAgendar={() => navigate("/agendar")}
        />

        <NearbyMap
          ubicacion={ubicacion}
          onRefresh={actualizarUbicacion}
          onOpenInterpretes={() => navigate("/interpretes")}
          onOpenVida={() => navigate("/home2")}
        />
      </main>

      {/* Modales */}
      <AuthModals
        /* Desactivamos completamente el modal de login */
        showLogin={false}
        showRegister={showRegister}
        regTab={regTab}
        setRegTab={setRegTab}
        onCloseAll={cerrarTodo}
        /* Cualquier “Inicia Sesión” desde el registro envía a /login */
        onGoLogin={() => navigate("/login")}
        onOpenTerms={openTerms}
        tcAcceptedUser={tcAcceptedUser}
        tcAcceptedInt={tcAcceptedInt}
        /* Si el componente intenta abrir login, redirigimos a /login */
        onOpenLogin={() => navigate("/login")}
      />

      <TermsModal
        open={tcOpen}
        audience={tcAudience}
        onClose={() => setTcOpen(false)}
        onAccept={acceptTerms}
      />
    </div>
  );
}
