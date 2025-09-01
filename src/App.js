// src/App.js
import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "./theme.css";

/* UI común */
import { Protected } from "./components/ui";
import DevGerenteSwitch from "./components/DevGerenteSwitch";

/* Páginas */
import Home from "./pages/Home";
import TipoUsuario from "./pages/TipoUsuario";
import Login from "./pages/Login";
import RegistroUsuario from "./pages/RegistroUsuario";
import RegistroInterprete from "./pages/RegistroInterprete";
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
import CuentaPendiente from "./pages/CuentaPendiente"; // 👈 página de “en revisión”

/* Hook de rol */
import useUserRole from "./hooks/useUserRole";

/* Placeholders */
const Page = ({ title, children }) => (
  <div className="container">
    <div className="card"><h2>{title}</h2>{children}</div>
  </div>
);
function Recuperar() { return <Page title="Recuperar Contraseña" />; }
function ReportePage() { return <Page title="Reportar Problemas / Suplantación" />; }

export default function App() {
  const [user, setUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null); // 👈 perfil desde Firestore (aprobado, etc.)
  const nav = useNavigate();
  const role = useUserRole(user); // rol en vivo desde Firestore

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Asegurar doc de usuario (si no existe, crear perfil base)
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          await setDoc(ref, {
            createdAt: Date.now(),
            displayName: u.displayName || "",
            email: u.email || "",
            role: "usuarioSordo",
            // Si llega aquí por otros flujos, márcalo como pendiente
            estadoCuenta: "pendiente",
            aprobado: false,
          });
          setUserDoc({
            displayName: u.displayName || "",
            email: u.email || "",
            role: "usuarioSordo",
            estadoCuenta: "pendiente",
            aprobado: false,
          });
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

  /* Guardita local: requiere usuario aprobado */
  const Approved = ({ children }) => {
    if (!user) return <Navigate to="/login" replace />;
    if (!userDoc) return <Page title="Verificando"><div className="badge">Cargando…</div></Page>;
    if (userDoc.aprobado !== true) return <Navigate to="/pendiente" replace />;
    return children;
  };

  return (
    <>
      <header className="sticky">
        <div className="container header-row">
          {/* Logo / Marca */}
          <Link to="/" className="brand">
            <img src="/interpreteya-logo.png" alt="Intérprete Ya" width="36" height="36" />
            <span>PRONTO....</span>
          </Link>

          {/* Navegación */}
          <nav className="nav-links">
            <Link to="/tipo-usuario" className="btn secondary">Registro</Link>
            <Link to="/noticias" className="btn secondary">Noticias</Link>
            <Link to="/emergencia" className="btn secondary">Emergencia</Link>
            <Link to="/interpretes" className="btn secondary">Intérpretes</Link>

            {/* Mis Reservas SOLO si está aprobado */}
            {user && userDoc?.aprobado === true && (
              <Link to="/mis-reservas" className="btn secondary">Mis Reservas</Link>
            )}
            {/* Panel Gerente solo si el rol es gerente */}
            {role === "gerente" && <Link to="/gerente" className="btn secondary">Gerente</Link>}

            {!user ? (
              <Link to="/login" className="btn">Ingresar</Link>
            ) : (
              <>
                <span className="badge">👤 {user.displayName || user.email}</span>
                <button className="btn" onClick={salir}>Salir</button>
              </>
            )}

            {/* Switch de rol en modo desarrollo */}
            <DevGerenteSwitch />
          </nav>
        </div>
      </header>

      {/* Rutas */}
      <Routes>
        {/* Home y registro */}
        <Route path="/" element={<Home />} />
        <Route path="/intro" element={<Intro />} />
        <Route path="/tipo-usuario" element={<TipoUsuario />} />
        <Route path="/registro-usuario" element={<RegistroUsuario />} />
        <Route path="/registro-interprete" element={<RegistroInterprete />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar" element={<Recuperar />} />
        <Route path="/login-gerente" element={<LoginGerente />} />
        <Route path="/pendiente" element={<CuentaPendiente />} /> {/* 👈 nueva ruta */}

        {/* Intérpretes (públicas) */}
        <Route path="/interpretes" element={<Interpretes />} />
        <Route path="/interprete/:id" element={<PerfilInterprete />} />

        {/* Noticias / Emergencia (públicas) */}
        <Route path="/noticias" element={<Noticias />} />
        <Route path="/emergencia" element={<Emergencia />} />

        {/* Reservas / Flujo de servicio — requieren APROBADO */}
        <Route path="/solicitar" element={
          <Approved><Solicitar /></Approved>
        } />
        <Route path="/agendar" element={
          <Approved><Agendar /></Approved>
        } />
        <Route path="/mis-reservas" element={
          <Approved><MisReservas /></Approved>
        } />
        <Route path="/pagar" element={
          <Approved><Pagar /></Approved>
        } />
        <Route path="/evaluacion" element={
          <Approved><Evaluacion /></Approved>
        } />
        <Route path="/videollamada" element={
          <Approved><Videollamada /></Approved>
        } />

        {/* Reporte (pública o como prefieras) */}
        <Route path="/reporte" element={<ReportePage />} />

        {/* Gerente (requiere login; lógica de rol la puedes manejar dentro de AdminGerente o aquí) */}
        <Route
          path="/gerente"
          element={
            <Protected user={user}>
              {/* Si prefieres bloquear aquí mismo por rol: */}
              {role === "gerente" ? <AdminGerente user={user} role={role} /> : <Navigate to="/" replace />}
            </Protected>
          }
        />
      </Routes>

      <footer className="container" style={{ opacity: .8 }}>
        <div className="badge">© {new Date().getFullYear()} Intérprete Ya — interpreteya.cl</div>
      </footer>
    </>
  );
}
