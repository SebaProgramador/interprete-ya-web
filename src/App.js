// src/App.js
import React, { useEffect, useState } from "react";
import { Routes, Route, NavLink, Link, useNavigate, Navigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "./theme.css";
import { FaUserPlus, FaRegNewspaper, FaAmbulance, FaUsers, FaCalendarAlt, FaVideo, FaSignInAlt, FaSignOutAlt, FaUser, FaBars } from "react-icons/fa";

/* UI común */
import { Protected } from "./components/ui";
import DevGerenteSwitch from "./components/DevGerenteSwitch";

/* Páginas */
import Home from "./pages/Home";
import Home2 from "./pages/Home2";
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
import CuentaPendiente from "./pages/CuentaPendiente";

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
  const [userDoc, setUserDoc] = useState(null);
  const nav = useNavigate();
  const role = useUserRole(user);

  const [menuOpen, setMenuOpen] = useState(false);

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

  const Approved = ({ children }) => {
    if (!user) return <Navigate to="/login" replace />;
    if (!userDoc) return <Page title="Verificando"><div className="badge">Cargando…</div></Page>;
    if (userDoc.aprobado !== true) return <Navigate to="/pendiente" replace />;
    return children;
  };

  return (
    <>
      <header className="sticky">
        <div className="container header-row" style={{justifyContent:"space-between"}}>
          <Link to="/" className="brand logoWrap" onClick={() => setMenuOpen(false)}>
            <img src="/interpreteya-logo.png" alt="Intérprete Ya" width="36" height="36" />
            <span>PRONTO....</span>
          </Link>

          <button
            className="btn icon mobile-toggle"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen ? "true" : "false"}
            onClick={() => setMenuOpen(v => !v)}
          >
            <FaBars />
          </button>

          <nav className={`nav-links ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(false)}>
            <NavLink to="/tipo-usuario" className={({isActive}) => `btn secondary chip ${isActive ? "active" : ""}`}>
              <FaUserPlus /> Registro
            </NavLink>

            <NavLink to="/noticias" className={({isActive}) => `btn secondary chip ${isActive ? "active" : ""}`}>
              <FaRegNewspaper /> Noticias
            </NavLink>

            <NavLink to="/emergencia" className={({isActive}) => `btn emergency ${isActive ? "active" : ""}`}>
              <FaAmbulance /> Emergencia 24/7
            </NavLink>

            <NavLink to="/interpretes" className={({isActive}) => `btn secondary chip ${isActive ? "active" : ""}`}>
              <FaUsers /> Intérpretes
            </NavLink>

            {user && userDoc?.aprobado === true && (
              <>
                <NavLink to="/solicitar" className={({isActive}) => `btn pill ${isActive ? "active" : ""}`}>
                  <FaUsers /> Solicitar
                </NavLink>
                <NavLink to="/agendar" className={({isActive}) => `btn pill ${isActive ? "active" : ""}`}>
                  <FaCalendarAlt /> Agendar
                </NavLink>
                <NavLink to="/videollamada" className={({isActive}) => `btn pill ${isActive ? "active" : ""}`}>
                  <FaVideo /> Videollamada
                </NavLink>
                <NavLink to="/mis-reservas" className={({isActive}) => `btn secondary chip ${isActive ? "active" : ""}`}>
                  Mis Reservas
                </NavLink>
              </>
            )}

            {role === "gerente" && (
              <NavLink to="/gerente" className={({isActive}) => `btn secondary chip ${isActive ? "active" : ""}`}>
                Gerente
              </NavLink>
            )}

            {!user ? (
              <NavLink to="/login" className="btn">
                <FaSignInAlt /> Ingresar
              </NavLink>
            ) : (
              <>
                <span className="badge">
                  <FaUser /> {user.displayName || user.email}
                </span>
                <button className="btn" onClick={salir}>
                  <FaSignOutAlt /> Salir
                </button>
              </>
            )}

            <DevGerenteSwitch />
          </nav>
        </div>
      </header>

      {/* Rutas */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home2" element={<Home2 />} />
        <Route path="/intro" element={<Intro />} />
        <Route path="/tipo-usuario" element={<TipoUsuario />} />
        <Route path="/registro-usuario" element={<RegistroUsuario />} />
        <Route path="/registro-interprete" element={<RegistroInterprete />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar" element={<Recuperar />} />
        <Route path="/login-gerente" element={<LoginGerente />} />
        <Route path="/pendiente" element={<CuentaPendiente />} />
        <Route path="/interpretes" element={<Interpretes />} />
        <Route path="/interprete/:id" element={<PerfilInterprete />} />
        <Route path="/noticias" element={<Noticias />} />
        <Route path="/emergencia" element={<Emergencia />} />

        <Route path="/solicitar" element={<Approved><Solicitar /></Approved>} />
        <Route path="/agendar" element={<Approved><Agendar /></Approved>} />
        <Route path="/mis-reservas" element={<Approved><MisReservas /></Approved>} />
        <Route path="/pagar" element={<Approved><Pagar /></Approved>} />
        <Route path="/evaluacion" element={<Approved><Evaluacion /></Approved>} />
        <Route path="/videollamada" element={<Approved><Videollamada /></Approved>} />

        <Route path="/reporte" element={<ReportePage />} />

        <Route
          path="/gerente"
          element={
            <Protected user={user}>
              {role === "gerente" ? <AdminGerente user={user} role={role} /> : <Navigate to="/" replace />}
            </Protected>
          }
        />
      </Routes>

      {/* ───────────────────────── Bottom-Nav (móvil) ───────────────────────── */}
      <nav className="bottom-nav">
        {user && userDoc?.aprobado === true ? (
          <>
            <NavLink to="/solicitar" className={({isActive}) => `bn-item ${isActive ? "active" : ""}`}>
              <FaUsers /><span>Solicitar</span>
            </NavLink>
            <NavLink to="/emergencia" className={({isActive}) => `bn-item danger ${isActive ? "active" : ""}`}>
              <FaAmbulance /><span>Emergencia</span>
            </NavLink>
            <NavLink to="/videollamada" className={({isActive}) => `bn-item ${isActive ? "active" : ""}`}>
              <FaVideo /><span>Video</span>
            </NavLink>
            <NavLink to="/mis-reservas" className={({isActive}) => `bn-item ${isActive ? "active" : ""}`}>
              <FaCalendarAlt /><span>Reservas</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/tipo-usuario" className={({isActive}) => `bn-item ${isActive ? "active" : ""}`}>
              <FaUserPlus /><span>Registro</span>
            </NavLink>
            <NavLink to="/emergencia" className={({isActive}) => `bn-item danger ${isActive ? "active" : ""}`}>
              <FaAmbulance /><span>Emergencia</span>
            </NavLink>
            <NavLink to="/interpretes" className={({isActive}) => `bn-item ${isActive ? "active" : ""}`}>
              <FaUsers /><span>Intérpretes</span>
            </NavLink>
            {!user ? (
              <NavLink to="/login" className={({isActive}) => `bn-item ${isActive ? "active" : ""}`}>
                <FaSignInAlt /><span>Ingresar</span>
              </NavLink>
            ) : (
              <NavLink to="/videollamada" className={({isActive}) => `bn-item ${isActive ? "active" : ""}`}>
                <FaVideo /><span>Video</span>
              </NavLink>
            )}
          </>
        )}
      </nav>
      {/* ─────────────────────── Fin Bottom-Nav (móvil) ─────────────────────── */}

      <footer className="container" style={{ opacity: .8 }}>
        <div className="badge">© {new Date().getFullYear()} Intérprete Ya — interpreteya.cl</div>
      </footer>
    </>
  );
}
