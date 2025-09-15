// src/App.js
import React, { useEffect, useState } from "react";
import { Routes, Route, NavLink, Link, useNavigate, Navigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "./theme.css";
import {
  FaAmbulance, FaUsers, FaCalendarAlt, FaVideo, FaSignInAlt, FaSignOutAlt,
  FaUser, FaBars, FaTimes, FaRegNewspaper, FaUserPlus, FaShieldAlt, FaListOl
} from "react-icons/fa";

import { Protected } from "./components/ui";
import DevGerenteSwitch from "./components/DevGerenteSwitch";

import Home from "./pages/Home";
import Home2 from "./pages/Home2";
import Login from "./pages/Login";
import Solicitar from "./pages/Solicitar";
import MisReservas from "./pages/MisReservas";
import Agendar from "./pages/Agendar";
import Interpretes from "./pages/Interpretes";
import PerfilInterprete from "./pages/PerfilInterprete";
import Noticias from "./pages/Noticias";
import Emergencia from "./pages/Emergencia";
import AdminGerente from "./pages/AdminGerente";
import Evaluacion from "./pages/Evaluacion";
import Pagar from "./pages/Pagar";
import Videollamada from "./pages/Videollamada";
import Intro from "./pages/Intro";
import LoginGerente from "./pages/LoginGerente";

/* ✅ Páginas corregidas */
import CuentaPendiente from "./pages/CuentaPendiente";        // usuario esperando
import CuentasPendientes from "./pages/CuentasPendientes";    // gerente lista

/* Logins por RUT */
import LoginUsuarioRut from "./pages/LoginUsuarioRut";
import LoginInterpreteRut from "./pages/LoginInterpreteRut";

/* Hook de rol */
import useUserRole from "./hooks/useUserRole";

const Page = ({ title, children }) => (
  <div className="container"><div className="card"><h2>{title}</h2>{children}</div></div>
);
function Recuperar() { return <Page title="Recuperar Contraseña" />; }
function ReportePage() { return <Page title="Reportar Problemas / Suplantación" />; }

/* 🔐 misma lista blanca de LoginGerente */
const GERENTES_ALLOW = new Set([
  "gerentesebastian@admin.com",
  "gerenteandre@admin.com",
]);

export default function App() {
  const [user, setUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const nav = useNavigate();
  const role = useUserRole(user);

  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          const base = {
            createdAt: Date.now(),
            displayName: u.displayName || "",
            email: u.email || "",
            role: "usuarioSordo",
            estadoCuenta: "pendiente",
            aprobado: false,
            bloqueado: false
          };
          await setDoc(ref, base);
          setUserDoc(base);
        } else {
          setUserDoc(snap.data());
        }
      } else {
        setUserDoc(null);
      }
    });
    return () => unsub();
  }, []);

  const salir = async () => { await signOut(auth); nav("/"); };

  const isGerente = !!user && (
    role === "gerente" || GERENTES_ALLOW.has((user?.email || "").toLowerCase())
  );

  const Approved = ({ children }) => {
    if (!user) return <Navigate to="/login" replace />;
    if (!userDoc) return <Page title="Verificando"><div className="badge">Cargando…</div></Page>;
    if (userDoc.bloqueado) {
      return (
        <Page title="Acceso bloqueado">
          <div className="badge" role="alert" style={{ marginTop: 8 }}>
            Tu cuenta está bloqueada. Por favor, contacta a soporte/gerencia.
          </div>
        </Page>
      );
    }
    if (userDoc.aprobado !== true) return <Navigate to="/pendiente" replace />;
    return children;
  };

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = drawerOpen ? "hidden" : prev || "";
    return () => { document.body.style.overflow = prev || ""; };
  }, [drawerOpen]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setDrawerOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      {/* ===== Header ===== */}
      <header className="sticky">
        <div className="container header-row" style={{ justifyContent: "space-between" }}>
          <Link to="/" className="brand logoWrap" onClick={closeDrawer}>
            <img src="/interpreteya-logo.png" alt="Intérprete Ya" width="36" height="36" />
            <span className="brand-text">InterpreteYa <span aria-hidden="true">🤟</span></span>
          </Link>

          <button className="btn icon mobile-toggle"
            aria-label={drawerOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={drawerOpen ? "true" : "false"}
            onClick={() => setDrawerOpen(v => !v)}>
            <FaBars />
          </button>

          <nav className="top-nav" aria-label="Principal">
            <NavLink to="/" state={{ openRegister: true, regTab: "user" }}
              className={({ isActive }) => `top-link ${isActive ? "active" : ""}`}
              onClick={closeDrawer}>
              <FaUserPlus /> Registro
            </NavLink>

            <NavLink to="/noticias" className={({ isActive }) => `top-link ${isActive ? "active" : ""}`} onClick={closeDrawer}>
              <FaRegNewspaper /> Noticias
            </NavLink>

            <NavLink to="/interpretes" className={({ isActive }) => `top-link ${isActive ? "active" : ""}`} onClick={closeDrawer}>
              <FaUsers /> Intérpretes
            </NavLink>

            <NavLink to="/emergencia" className={({ isActive }) => `top-link danger ${isActive ? "active" : ""}`} onClick={closeDrawer}>
              <FaAmbulance /> Emergencia 24/7
            </NavLink>

            {/* 🔐 Menú Gerente */}
            {isGerente && (
              <>
                <NavLink to="/gerente" className={({ isActive }) => `top-link ${isActive ? "active" : ""}`} onClick={closeDrawer}>
                  <FaShieldAlt /> Gerencia
                </NavLink>
                <NavLink to="/gerente/cuentas-pendientes" className={({ isActive }) => `top-link ${isActive ? "active" : ""}`} onClick={closeDrawer}>
                  <FaListOl /> Cuentas pendientes
                </NavLink>
              </>
            )}

            {!user ? (
              <NavLink to="/login" className="top-cta" onClick={closeDrawer}>
                <FaSignInAlt /> Ingresar
              </NavLink>
            ) : (
              <>
                <span className="badge compact"><FaUser /> {userDoc?.displayName || user?.email}</span>
                <button className="top-cta" onClick={salir}><FaSignOutAlt /> Salir</button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* ===== Drawer móvil ===== */}
      {drawerOpen && (
        <div className="drawer-backdrop" role="dialog" aria-modal="true" onClick={closeDrawer}>
          <aside className="drawer" aria-label="Menú" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <span className="drawer-title">Menú</span>
              <button className="icon-btn" aria-label="Cerrar" onClick={closeDrawer}><FaTimes /></button>
            </div>

            <nav className="drawer-list">
              <NavLink to="/" onClick={closeDrawer} className="drawer-link">Inicio</NavLink>
              <NavLink to="/" state={{ openRegister: true, regTab: "user" }} onClick={closeDrawer} className="drawer-link">Registro</NavLink>
              <NavLink to="/noticias" onClick={closeDrawer} className="drawer-link">Noticias</NavLink>
              <NavLink to="/interpretes" onClick={closeDrawer} className="drawer-link">Intérpretes</NavLink>
              <NavLink to="/emergencia" onClick={closeDrawer} className="drawer-link danger">Emergencia 24/7</NavLink>

              {isGerente && (
                <>
                  <div className="drawer-divider" />
                  <NavLink to="/gerente" onClick={closeDrawer} className="drawer-link">Gerencia</NavLink>
                  <NavLink to="/gerente/cuentas-pendientes" onClick={closeDrawer} className="drawer-link">Cuentas pendientes</NavLink>
                </>
              )}

              <div className="drawer-divider" />
              {!user ? (
                <NavLink to="/login" onClick={closeDrawer} className="drawer-link primary">Ingresar</NavLink>
              ) : (
                <>
                  <span className="drawer-user"><FaUser /> {userDoc?.displayName || user?.email}</span>
                  <button className="drawer-link primary" onClick={() => { closeDrawer(); salir(); }}>Salir</button>
                </>
              )}
            </nav>
          </aside>
        </div>
      )}

      {/* ===== Rutas ===== */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home2" element={<Home2 />} />
        <Route path="/intro" element={<Intro />} />

        {/* Login selector y logins por RUT */}
        <Route path="/login" element={<Login />} />
        <Route path="/login-usuario" element={<LoginUsuarioRut />} />
        <Route path="/login-interprete" element={<LoginInterpreteRut />} />
        <Route path="/login-gerente" element={<LoginGerente />} />

        {/* Estado pendiente (usuario) */}
        <Route path="/pendiente" element={<CuentaPendiente />} />

        <Route path="/recuperar" element={<Recuperar />} />
        <Route path="/interpretes" element={<Interpretes />} />
        <Route path="/interprete/:id" element={<PerfilInterprete />} />
        <Route path="/noticias" element={<Noticias />} />
        <Route path="/emergencia" element={<Emergencia />} />

        {/* Requieren aprobación */}
        <Route path="/solicitar" element={<Approved><Solicitar /></Approved>} />
        <Route path="/agendar" element={<Approved><Agendar /></Approved>} />
        <Route path="/mis-reservas" element={<Approved><MisReservas /></Approved>} />
        <Route path="/pagar" element={<Approved><Pagar /></Approved>} />
        <Route path="/evaluacion" element={<Approved><Evaluacion /></Approved>} />
        <Route path="/videollamada" element={<Approved><Videollamada /></Approved>} />

        {/* Gerencia */}
        <Route
          path="/gerente"
          element={
            <Protected user={user}>
              {isGerente ? <AdminGerente user={user} role={role} /> : <Navigate to="/" replace />}
            </Protected>
          }
        />
        <Route
          path="/gerente/cuentas-pendientes"
          element={
            <Protected user={user}>
              {isGerente ? <CuentasPendientes /> : <Navigate to="/" replace />}
            </Protected>
          }
        />

        <Route path="/reporte" element={<ReportePage />} />
      </Routes>

      {/* ===== Bottom-Nav (móvil) ===== */}
      <nav className="bottom-nav" aria-label="Acciones rápidas">
        {user && userDoc?.aprobado === true && !userDoc?.bloqueado ? (
          <>
            <NavLink to="/solicitar" className={({ isActive }) => `bn-item ${isActive ? "active" : ""}`}>
              <FaUsers /><span>Solicitar</span>
            </NavLink>
            <NavLink to="/emergencia" className={({ isActive }) => `bn-item danger ${isActive ? "active" : ""}`}>
              <FaAmbulance /><span>Emergencia</span>
            </NavLink>
            <NavLink to="/videollamada" className={({ isActive }) => `bn-item ${isActive ? "active" : ""}`}>
              <FaVideo /><span>Video</span>
            </NavLink>
            <NavLink to="/mis-reservas" className={({ isActive }) => `bn-item ${isActive ? "active" : ""}`}>
              <FaCalendarAlt /><span>Reservas</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/" state={{ openRegister: true, regTab: "user" }}
              className={({ isActive }) => `bn-item ${isActive ? "active" : ""}`}>
              <FaUserPlus /><span>Registro</span>
            </NavLink>
            <NavLink to="/emergencia" className={({ isActive }) => `bn-item danger ${isActive ? "active" : ""}`}>
              <FaAmbulance /><span>Emergencia</span>
            </NavLink>
            <NavLink to="/interpretes" className={({ isActive }) => `bn-item ${isActive ? "active" : ""}`}>
              <FaUsers /><span>Intérpretes</span>
            </NavLink>
            {!user ? (
              <NavLink to="/login" className={({ isActive }) => `bn-item ${isActive ? "active" : ""}`}>
                <FaSignInAlt /><span>Ingresar</span>
              </NavLink>
            ) : (
              <NavLink to="/videollamada" className={({ isActive }) => `bn-item ${isActive ? "active" : ""}`}>
                <FaVideo /><span>Video</span>
              </NavLink>
            )}
          </>
        )}
      </nav>

      <footer className="container" style={{ opacity: .8 }}>
        <div className="badge">© {new Date().getFullYear()} Intérprete Ya — interpreteya.cl</div>
      </footer>
    </>
  );
}
