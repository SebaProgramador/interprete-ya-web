// src/pages/CuentasPendientes.js
import React from "react";
import { auth, db } from "../firebase";
import {
  collection, query, where, limit, getDocs, doc, updateDoc, serverTimestamp
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Info({ label, value }) {
  return (
    <div className="badge" style={{ marginRight: 8 }}>
      {label}: <b>{value || "-"}</b>
    </div>
  );
}

export default function CuentasPendientes() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState({ displayName: "", dni: "", profesion: "" });
  const me = auth.currentUser;
  const nav = useNavigate();

  async function cargar() {
    setLoading(true);
    const q = query(collection(db, "users"), where("estadoCuenta", "==", "pendiente"), limit(100));
    const s = await getDocs(q);
    setItems(s.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  }
  React.useEffect(() => { cargar(); }, []);

  async function aprobar(id) {
    await updateDoc(doc(db, "users", id), {
      estadoCuenta: "aprobado",
      aprobado: true,
      aprobadoEn: serverTimestamp(),
      aprobadoPorUid: me?.uid || null,
      aprobadoPorEmail: me?.email || null
    });
    await cargar();
  }
  async function rechazar(id) {
    await updateDoc(doc(db, "users", id), {
      estadoCuenta: "rechazado",
      aprobado: false,
      rechazadoEn: serverTimestamp(),
      rechazadoPorUid: me?.uid || null,
      rechazadoPorEmail: me?.email || null
    });
    await cargar();
  }
  async function bloquear(id) {
    await updateDoc(doc(db, "users", id), {
      bloqueado: true,
      bloqueadoEn: serverTimestamp(),
      bloqueadoPorUid: me?.uid || null
    });
    await cargar();
    // 👉 Deja este push solo si ya tienes la página /lista-bloqueos.
    // nav("/lista-bloqueos");
  }
  async function desbloquear(id) {
    await updateDoc(doc(db, "users", id), {
      bloqueado: false,
      desbloqueadoEn: serverTimestamp(),
      desbloqueadoPorUid: me?.uid || null
    });
    await cargar();
  }
  function onEdit(u) {
    setEditing(u.id);
    setForm({
      displayName: u.displayName || "",
      dni: u.dni || "",
      profesion: u.profesion || ""
    });
  }
  async function guardarEdicion() {
    const { displayName, dni, profesion } = form;
    await updateDoc(doc(db, "users", editing), {
      displayName, dni, profesion, actualizadoEn: serverTimestamp()
    });
    setEditing(null);
    await cargar();
  }

  return (
    <div className="container">
      <h1 className="heroTitle">Gerente · Cuentas pendientes</h1>
      <p className="heroSub">Aprueba, rechaza, bloquea o edita los registros recientes.</p>

      {loading && <div className="badge" style={{ marginTop: 12 }}>Cargando…</div>}
      {!loading && items.length === 0 && (
        <div className="badge" style={{ marginTop: 12 }}>No hay solicitudes pendientes.</div>
      )}

      <div className="grid3" style={{ marginTop: 12 }}>
        {items.map(u => (
          <article key={u.id} className="card white">
            <h3 className="card-title" style={{ marginTop: 0 }}>
              {u.displayName || u.email}
            </h3>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              <Info label="Email" value={u.email} />
              <Info label="RUT/DNI" value={u.dni} />
              <Info label="Profesión" value={u.profesion} />
              <Info label="Estado" value={u.estadoCuenta} />
              <Info label="Bloqueado" value={u.bloqueado ? "Sí" : "No"} />
            </div>

            {/* Botones */}
            <div className="row" style={{ marginTop: 12, gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button className="btn secondary" onClick={() => rechazar(u.id)} aria-label={`Rechazar a ${u.displayName || u.email}`}>❌ No aprobado</button>
              {!u.bloqueado ? (
                <button className="btn secondary" onClick={() => bloquear(u.id)} aria-label={`Bloquear a ${u.displayName || u.email}`}>🚫 Bloquear</button>
              ) : (
                <button className="btn secondary" onClick={() => desbloquear(u.id)} aria-label={`Desbloquear a ${u.displayName || u.email}`}>✅ Desbloquear</button>
              )}
              <button className="btn secondary" onClick={() => onEdit(u)} aria-label={`Editar datos de ${u.displayName || u.email}`}>✏️ Editar</button>
              <button className="btn" onClick={() => aprobar(u.id)} aria-label={`Aprobar a ${u.displayName || u.email}`}>✅ Confirmar</button>
            </div>

            {/* Edición inline */}
            {editing === u.id && (
              <div className="divider" style={{ marginTop: 12 }}>
                <label className="label" htmlFor={`nombre-${u.id}`}>Nombre</label>
                <input id={`nombre-${u.id}`} className="input" value={form.displayName}
                  onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} />

                <label className="label" htmlFor={`dni-${u.id}`}>RUT/DNI</label>
                <input id={`dni-${u.id}`} className="input" value={form.dni}
                  onChange={e => setForm(f => ({ ...f, dni: e.target.value }))} />

                <label className="label" htmlFor={`profesion-${u.id}`}>Profesión</label>
                <input id={`profesion-${u.id}`} className="input" value={form.profesion}
                  onChange={e => setForm(f => ({ ...f, profesion: e.target.value }))} />

                <div className="row" style={{ gap: 8, marginTop: 10 }}>
                  <button className="btn secondary" onClick={() => setEditing(null)}>Cancelar</button>
                  <button className="btn" onClick={guardarEdicion} aria-label="Guardar edición">Guardar</button>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
