// src/pages/Home2.js
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./home2.css"; // hereda home.css y agrega pequeños ajustes

export default function Home2() {
  const navigate = useNavigate();

  // ======= UI State =======
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [regTab, setRegTab] = useState("user");
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);

  // ======= Helpers =======
  const abrirLogin = useCallback(() => {
    setShowRegister(false);
    setShowRating(false);
    setShowLogin(true);
  }, []);
  const abrirRegister = useCallback((tab = "user") => {
    setRegTab(tab);
    setShowLogin(false);
    setShowRating(false);
    setShowRegister(true);
  }, []);
  const cerrarTodo = useCallback(() => {
    setShowLogin(false);
    setShowRegister(false);
    setShowRating(false);
  }, []);

  // Bloquear scroll si hay modal
  const hayModal = showLogin || showRegister || showRating;
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = hayModal ? "hidden" : prev;
    return () => (document.body.style.overflow = prev);
  }, [hayModal]);

  // ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && cerrarTodo();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cerrarTodo]);

  // ======= Datos demo =======
  const interpretes = [
    {
      nombre: "María González",
      img:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5cd?auto=format&fit=crop&w=688&q=80",
      rating: "4.8",
      votos: 120,
      desc: "Especialista en trámites legales • 10 años exp.",
      precio: "$20.000",
      badge: "Verificada",
      exp: "10+ años exp.",
    },
    {
      nombre: "Juan Pérez",
      img:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=687&q=80",
      rating: "4.9",
      votos: 98,
      desc: "CODA • Educación y talleres empresariales.",
      precio: "$22.000",
      badge: "Verificada",
      exp: "15+ años exp.",
    },
    {
      nombre: "Carla Silva",
      img:
        "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=687&q=80",
      rating: "4.7",
      votos: 76,
      desc: "Eventos culturales y sociales • 5 años exp.",
      precio: "$19.000",
      badge: "Verificada",
      exp: "5+ años exp.",
    },
  ];

  const noticias = [
    {
      date: "15 Jun 2025",
      tag: "Comunidad",
      title: "Talleres gratuitos de LSCh en tu comuna",
      text:
        "Conoce los talleres de lengua de señas chilena disponibles este mes en distintas regiones.",
      img:
        "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1470&q=80",
    },
    {
      date: "2 Jun 2025",
      tag: "Legislación",
      title: "Nueva ley fortalece derechos de la comunidad sorda",
      text: "Revisa los cambios que mejoran la accesibilidad y derechos en Chile.",
      img:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1470&q=80",
    },
    {
      date: "25 May 2025",
      tag: "Cultura",
      title: "Festival de Cine Sordo: conoce la programación",
      text: "El festival se realizará en Santiago el próximo mes.",
      img:
        "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1412&q=80",
    },
  ];

  const solicitarServicio = (msg) => alert(msg || "Servicio solicitado…");

  return (
    <div className="theme-cyber">
      {/* Header (mismo comportamiento) */}
      <header className="iy2-header gradient-bg sticky neon-header" role="banner">
        <div className="container">
          <div className="header-row">
            <div className="logo-group" aria-label="Inicio InterpreteYa" onClick={() => navigate("/")}>
              <i className="fas fa-hands-sign-language logo-icon" aria-hidden="true" />
              <h1 className="brand">InterpreteYa</h1>
            </div>
            <div className="auth-actions" role="group" aria-label="Acciones de sesión">
              <button type="button" className="ubereats-btn-secondary neon-btn" onClick={abrirLogin}>
                Ingresar
              </button>
              <button type="button" className="ubereats-btn neon-btn-strong" onClick={() => abrirRegister("user")}>
                Regístrate
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ===== Main ===== */}
      <main className="container main-pad" role="main">
        {/* Nuestros intérpretes */}
        <section className="mb-16" aria-labelledby="interpretes-titulo">
          <div className="row-between mb-8">
            <h2 id="interpretes-titulo" className="h2 neon-title">Nuestros Intérpretes</h2>
            <button type="button" className="link-blue neon-link" onClick={() => navigate("/lista-interpretes")}>
              Ver todos
            </button>
          </div>

          <div className="grid intérpretes">
            {interpretes.map((p) => (
              <article className="interpreter-card neon-tile" key={p.nombre}>
                <div className="img-wrap">
                  <img src={p.img} alt={`Intérprete ${p.nombre}`} loading="lazy" decoding="async" />
                  <div className="img-badge" aria-label={`Calificación ${p.rating} con ${p.votos} votos`}>
                    ★ {p.rating} ({p.votos})
                  </div>
                </div>
                <div className="card-body">
                  <div className="top">
                    <h3 className="name">{p.nombre}</h3>
                    <div className="verified" title={p.badge}>
                      <i className="fas fa-check-circle" aria-hidden="true" /> {p.badge}
                    </div>
                  </div>
                  <p className="desc">{p.desc}</p>
                  <div className="bottom">
                    <div className="price">
                      <span className="strong">{p.precio}</span>
                      <span className="muted neon-muted"> / 60 min</span>
                    </div>
                    <button type="button" className="chip-btn neon-btn" onClick={() => setShowRating(true)}>
                      Agendar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Servicios */}
        <section className="mb-16" aria-labelledby="servicios-titulo">
          <h2 id="servicios-titulo" className="h2 center mb-8 neon-title">Elige tu servicio</h2>
          <div className="grid services">
            <div className="service-card svc-blue neon-card">
              <div className="svc-ico-bg neon-chip" aria-hidden="true"><i className="fas fa-bolt" /></div>
              <h3 className="svc-h3">Intérprete Ahora</h3>
              <p className="svc-p neon-muted">Conecta inmediatamente con un intérprete disponible</p>
              <div className="svc-stack">
                <button className="svc-btn neon-pill" onClick={() => solicitarServicio("Intérprete Ahora - 10 min - $5.000")}>10 min - $5.000</button>
                <button className="svc-btn neon-pill" onClick={() => solicitarServicio("Intérprete Ahora - 30 min - $12.000")}>30 min - $12.000</button>
                <button className="svc-btn strong neon-btn" onClick={() => solicitarServicio("Intérprete Ahora - 60 min - $20.000")}>60 min - $20.000</button>
              </div>
            </div>

            <div className="service-card svc-purple neon-card">
              <div className="svc-ico-bg neon-chip" aria-hidden="true"><i className="fas fa-calendar-alt" /></div>
              <h3 className="svc-h3">Agendar</h3>
              <p className="svc-p neon-muted">Programa con anticipación para asegurar disponibilidad</p>
              <div className="svc-stack">
                <button className="svc-btn neon-pill" onClick={() => solicitarServicio("Agendar - 10 min - $4.500")}>10 min - $4.500</button>
                <button className="svc-btn neon-pill" onClick={() => solicitarServicio("Agendar - 30 min - $10.800")}>30 min - $10.800</button>
                <button className="svc-btn strong neon-btn" onClick={() => solicitarServicio("Agendar - 60 min - $18.000")}>60 min - $18.000</button>
              </div>
            </div>

            <div className="service-card svc-green neon-card">
              <div className="svc-ico-bg neon-chip" aria-hidden="true"><i className="fas fa-video" /></div>
              <h3 className="svc-h3">Videollamada</h3>
              <p className="svc-p neon-muted">Interpretación remota con conexión segura</p>
              <div className="svc-stack">
                <button className="svc-btn neon-pill" onClick={() => solicitarServicio("Videollamada - 10 min - $6.000")}>10 min - $6.000</button>
                <button className="svc-btn neon-pill" onClick={() => solicitarServicio("Videollamada - 30 min - $15.000")}>30 min - $15.000</button>
                <button className="svc-btn strong neon-btn-strong" onClick={() => navigate("/videollamada")}>Ir a videollamada</button>
              </div>
            </div>
          </div>
        </section>

        {/* Emergencia */}
        <section className="emergency mb-16 neon-card neon-emg" aria-labelledby="emg-titulo">
          <div className="emg-col">
            <h2 id="emg-titulo" className="emg-title">Emergencia - Ayuda Inmediata</h2>
            <p className="emg-text neon-muted">
              Si necesitas ayuda urgente con interpretación para servicios de emergencia,
              presiona el botón y te conectaremos de inmediato.
            </p>
            <div className="emg-info">
              <i className="fas fa-info-circle" aria-hidden="true" /> Servicio gratuito para emergencias reales
            </div>
          </div>
          <div className="emg-col btn-col">
            <button type="button" className="emg-btn neon-btn-strong" onClick={() => navigate("/emergencia")}>
              <i className="fas fa-phone-alt" aria-hidden="true" /> EMERGENCIA
            </button>
          </div>
        </section>

        {/* Noticias */}
        <section className="mb-16" aria-labelledby="news-titulo">
          <h2 id="news-titulo" className="h2 mb-8 neon-title">Noticias y Comunidad</h2>
          <div className="grid news">
            {noticias.map((n) => (
              <article className="news-card neon-tile" key={n.title}>
                <img src={n.img} alt={n.title} loading="lazy" decoding="async" />
                <div className="news-body">
                  <div className="news-meta neon-muted" aria-label="Metadatos de noticia">
                    <span>{n.date}</span><span>•</span><span>{n.tag}</span>
                  </div>
                  <h3 className="news-h3">{n.title}</h3>
                  <p className="news-p neon-muted">{n.text}</p>
                  <Link to="/blog" className="news-link neon-link">Leer más</Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* ===== Footer ===== */}
      <footer className="footer neon-footer" role="contentinfo">
        <div className="container">
          <div className="foot-grid">
            <div>
              <div className="foot-logo">
                <i className="fas fa-hands-sign-language" aria-hidden="true" />
                <span>InterpreteYa</span>
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Flag_of_Chile.svg"
                  alt="Bandera de Chile"
                />
              </div>
              <p className="foot-muted">
                Conectando a la comunidad sorda con intérpretes certificados las 24 horas del día.
              </p>
            </div>
            <div>
              <h3 className="foot-h3">Servicios</h3>
              <ul className="foot-list">
                <li><Link to="/solicitar">Intérprete Ahora</Link></li>
                <li><Link to="/agendar">Agendar Intérprete</Link></li>
                <li><Link to="/videollamada">Videollamada</Link></li>
                <li><Link to="/emergencia">Emergencias</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="foot-h3">Recursos</h3>
              <ul className="foot-list">
                <li><Link to="/aprender">Aprende LSCh</Link></li>
                <li><Link to="/blog">Blog</Link></li>
                <li><Link to="/faq">Preguntas Frecuentes</Link></li>
                <li><Link to="/reportar">Reportar Suplantación</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="foot-h3">Contáctanos</h3>
              <ul className="foot-list">
                <li><i className="fas fa-envelope" aria-hidden="true" /> contacto@interpreteya.cl</li>
                <li><i className="fas fa-phone-alt" aria-hidden="true" /> +56 9 1234 5678</li>
                <li><i className="fas fa-map-marker-alt" aria-hidden="true" /> Santiago, Chile</li>
              </ul>
              <div className="social" role="group" aria-label="Redes sociales">
                <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f" /></a>
                <a href="#" aria-label="Twitter"><i className="fab fa-twitter" /></a>
                <a href="#" aria-label="Instagram"><i className="fab fa-instagram" /></a>
                <a href="#" aria-label="YouTube"><i className="fab fa-youtube" /></a>
              </div>
            </div>
          </div>
          <div className="foot-bottom">© 2025 InterpreteYa. Todos los derechos reservados.</div>
        </div>
      </footer>

      {/* ===== MODALES (incluye rating aquí) ===== */}
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
              <button type="button" className="link-blue neon-link" onClick={() => abrirRegister("user")}>Regístrate</button>
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

            <div className="tabs" role="tablist" aria-label="Tipo de registro">
              <button type="button" role="tab" aria-selected={regTab === "user"} className={`tab-btn ${regTab === "user" ? "active" : ""}`} onClick={() => setRegTab("user")}>Usuario</button>
              <button type="button" role="tab" aria-selected={regTab === "interpreter"} className={`tab-btn ${regTab === "interpreter" ? "active" : ""}`} onClick={() => setRegTab("interpreter")}>Intérprete</button>
            </div>

            {regTab === "user" && (
              <form onSubmit={(e) => { e.preventDefault(); cerrarTodo(); navigate("/registro-usuario"); }}>
                <label className="label">Nombre Completo</label>
                <input type="text" className="input" required autoComplete="name" />
                <label className="label">Correo Electrónico</label>
                <input type="email" className="input" required autoComplete="email" />
                <label className="label">Contraseña</label>
                <input type="password" className="input" required autoComplete="new-password" />
                <label className="label">RUT</label>
                <input type="text" className="input" />
                <label className="label">Credencial de Discapacidad</label>
                <input type="file" className="input" />
                <label className="checkbox">
                  <input type="checkbox" required /> Acepto los{" "}
                  <a href="#" className="link-blue neon-link">Términos y Condiciones</a>
                </label>
                <button type="submit" className="btn-blue block mt-12 neon-btn-strong">Registrarse como Usuario</button>
                <div className="divider" />
                <div className="center">¿Ya tienes una cuenta?{" "}
                  <button type="button" className="link-blue neon-link" onClick={abrirLogin}>Inicia Sesión</button>
                </div>
              </form>
            )}

            {regTab === "interpreter" && (
              <form onSubmit={(e) => { e.preventDefault(); cerrarTodo(); navigate("/registro-interprete"); }}>
                <label className="label">Nombre Completo</label>
                <input type="text" className="input" required />
                <label className="label">Correo Electrónico</label>
                <input type="email" className="input" required />
                <label className="label">Contraseña</label>
                <input type="password" className="input" required />
                <label className="label">RUT</label>
                <input type="text" className="input" />
                <label className="label">Certificación LSCh</label>
                <input type="file" className="input" />
                <label className="label">Años de Experiencia</label>
                <input type="number" className="input" min="0" />
                <label className="checkbox">
                  <input type="checkbox" required /> Acepto los{" "}
                  <a href="#" className="link-blue neon-link">Términos y Condiciones</a>
                </label>
                <button type="submit" className="btn-purple block mt-12 neon-btn-strong">Registrarse como Intérprete</button>
                <div className="divider" />
                <div className="center">¿Ya tienes una cuenta?{" "}
                  <button type="button" className="link-blue neon-link" onClick={abrirLogin}>Inicia Sesión</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Rating */}
      {showRating && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="rating-title" onClick={cerrarTodo}>
          <div className="modal-card neon-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3 id="rating-title">Califica el Servicio</h3>
              <button className="icon-btn" onClick={cerrarTodo} aria-label="Cerrar"><i className="fas fa-times" /></button>
            </div>

            <div className="rating-center">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5cd?auto=format&fit=crop&w=688&q=80"
                alt="Intérprete"
                className="avatar"
                loading="lazy"
                decoding="async"
              />
              <h4 className="rating-name">María González</h4>
              <p className="muted neon-muted">Servicio de interpretación - 30 minutos</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); alert(`¡Gracias! Tu calificación: ${rating} ⭐`); cerrarTodo(); }}>
              <div className="rating-stars" role="radiogroup" aria-label="Calificación de 1 a 5">
                {[5, 4, 3, 2, 1].map((star) => (
                  <React.Fragment key={star}>
                    <input id={`star-${star}`} type="radio" name="rating" value={star}
                      checked={rating === star} onChange={() => setRating(star)} />
                    <label htmlFor={`star-${star}`} aria-label={`${star} estrellas`}>★</label>
                  </React.Fragment>
                ))}
              </div>
              <span className="rating-hint">Selecciona de 1 a 5 estrellas</span>

              <label className="label mt-16">Comentarios (opcional)</label>
              <textarea className="textarea" rows={3} placeholder="¿Cómo fue tu experiencia?" />
              <button type="submit" className="btn-blue block mt-16 neon-btn-strong">Enviar Calificación</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
