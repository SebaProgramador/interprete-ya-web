// src/pages/AdminGerente.js
import React, { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection, onSnapshot, orderBy, query, updateDoc, doc, where
} from "firebase/firestore";
import { Page, Row } from "../components/ui";

/* === Lista blanca de gerentes (emails que SÍ pueden entrar) === */
const GERENTES_ALLOW = new Set([
  "gerentesebastian@admin.com",
  "gerenteandres@admin.com",
]);

const Tag = ({ children, style }) => (
  <span className="badge" style={{ marginLeft: 6, ...style }}>{children}</span>
);

export default function AdminGerente({ user, role }) {
  // ✅ Hooks primero
  const [reservas, setReservas] = useState([]);
  const [interps, setInterps] = useState([]);
  const [filtro, setFiltro] = useState("todas");
  const [busca, setBusca] = useState("");
  const [soloEmergencias, setSoloEmergencias] = useState(false);
  const [soloPagadas, setSoloPagadas] = useState(false);
  const [sel, setSel] = useState({});
  const [saving, setSaving] = useState({});

  // 👮‍♂️ Regla de acceso: rol === "gerente" O email en lista blanca
  const isGerente = !!user && (role === "gerente" || GERENTES_ALLOW.has(user?.email || ""));

  // Suscripción a reservas
  useEffect(() => {
    if (!isGerente) return;
    const q = query(collection(db, "reservas"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setReservas(arr);
      setSel(prev => {
        const next = { ...prev };
        for (const r of arr) {
          if (r.interpreterId && !next[r.id]) next[r.id] = r.interpreterId;
        }
        return next;
      });
    });
    return () => unsub();
  }, [isGerente]);

  // Suscripción a intérpretes
  useEffect(() => {
    if (!isGerente) return;
    const q = query(collection(db, "users"), where("role", "==", "interprete"));
    const unsub = onSnapshot(q, snap => {
      setInterps(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [isGerente]);

  const stats = useMemo(()=>{
    if (!isGerente)
      return { total: 0, emergencia: 0, pendiente: 0, confirmada: 0, cancelada: 0, pagada: 0 };

    const s = { total: reservas.length, emergencia: 0, pendiente: 0, confirmada: 0, cancelada: 0, pagada: 0 };
    for (const r of reservas) {
      if (r.emergency) s.emergencia++;
      if (r.payment?.status === "paid") s.pagada++;
      const st = (r.status || "pendiente");
      if (s[st] != null) s[st]++;
    }
    return s;
  }, [isGerente, reservas]);

  const lista = useMemo(() => {
    if (!isGerente) return [];
    return reservas
      .filter(r => (filtro === "todas" ? true : (r.status || "pendiente") === filtro))
      .filter(r => !soloEmergencias || r.emergency === true)
      .filter(r => !soloPagadas || r.payment?.status === "paid")
      .filter(r => {
        if (!busca.trim()) return true;
        const t = busca.toLowerCase();
        return (
          (r.userName || "").toLowerCase().includes(t) ||
          (r.email || "").toLowerCase().includes(t) ||
          (r.tipo || "").toLowerCase().includes(t) ||
          (r.id || "").toLowerCase().includes(t)
        );
      })
      .sort((a, b) => (b.emergency === true) - (a.emergency === true));
  }, [isGerente, reservas, filtro, busca, soloEmergencias, soloPagadas]);

  // ⬇️ Exportar CSV del listado filtrado
  const exportCSV = () => {
    if (lista.length === 0) { alert("No hay datos para exportar con el filtro actual."); return; }

    const rows = lista.map(r => ({
      id: r.id,
      userName: r.userName || "",
      email: r.email || "",
      tipo: r.tipo || "",
      minutes: r.minutes ?? r.duracion ?? "",
      price: r.price ?? "",
      status: r.status || "pendiente",
      emergency: r.emergency ? "sí" : "no",
      paid: r.payment?.status === "paid" ? "sí" : "no",
      interpreterRequested: r.interpreterRequestedName || r.interpreterRequestedId || "",
      interpreterAssigned: r.interpreterName || r.interpreterId || "",
      scheduledAt: r.scheduledAt?.toDate?.()?.toISOString() ?? "",
      createdAt: r.createdAt?.toDate?.()?.toISOString() ?? "",
    }));

    const headers = Object.keys(rows[0] || { id: "" });
    const csv = [
      headers.join(","),
      ...rows.map(o => headers
        .map(k => `"${String(o[k] ?? "").replace(/"/g, '""')}"`)
        .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reservas-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const setEstado = async (id, status) => {
    setSaving(s => ({ ...s, [id]: true }));
    try {
      await updateDoc(doc(db, "reservas", id), { status });
    } finally {
      setSaving(s => ({ ...s, [id]: false }));
    }
  };

  const asignar = async (r) => {
    const id = r.id;
    const interpreterId = sel[id] || null;
    if (!interpreterId) { alert("Selecciona un intérprete"); return; }
    const interp = interps.find(i => i.id === interpreterId);
    setSaving(s => ({ ...s, [id]: true }));
    try {
      await updateDoc(doc(db, "reservas", id), {
        interpreterId,
        interpreterName: interp?.displayName || null
      });
      alert("✅ Intérprete asignado");
    } catch (e) {
      alert("Error al asignar: " + e.message);
    } finally {
      setSaving(s => ({ ...s, [id]: false }));
    }
  };

  const quitar = async (r) => {
    const id = r.id;
    setSaving(s => ({ ...s, [id]: true }));
    try {
      await updateDoc(doc(db, "reservas", id), {
        interpreterId: null,
        interpreterName: null
      });
      setSel(prev => ({ ...prev, [id]: "" }));
      alert("Intérprete quitado");
    } catch (e) {
      alert("Error al quitar: " + e.message);
    } finally {
      setSaving(s => ({ ...s, [id]: false }));
    }
  };

  // ⬇️ Returns condicionales
  if (!user) return <Navigate to="/login-gerente" replace />;

  if (!isGerente) {
    return (
      <Page title="Gerente (Privado)">
        <p className="badge">Acceso restringido. Esta cuenta no está autorizada como <b>gerente</b>.</p>
      </Page>
    );
  }

  return (
    <Page title="Panel del Gerente">
      {/* Filtros y búsqueda */}
      <div className="card" style={{ marginBottom: 12 }}>
        <Row style={{gap:8, alignItems:"center"}}>
          <input
            placeholder="Buscar por nombre, email, tipo o ID"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            style={{ flex: 1, minWidth: 260 }}
          />
          <select
            className="btn secondary"
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
          >
            <option value="todas">Todas</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="cancelada">Cancelada</option>
          </select>

          <label className="badge" style={{cursor:"pointer"}}>
            <input
              type="checkbox"
              checked={soloEmergencias}
              onChange={e=>setSoloEmergencias(e.target.checked)}
              style={{marginRight:6}}
            />
            Solo emergencias
          </label>

          <label className="badge" style={{cursor:"pointer"}}>
            <input
              type="checkbox"
              checked={soloPagadas}
              onChange={e=>setSoloPagadas(e.target.checked)}
              style={{marginRight:6}}
            />
            Solo pagadas
          </label>

          <button className="btn" onClick={exportCSV}>
            ⬇️ Exportar CSV (filtro)
          </button>
        </Row>
      </div>

      {/* Resumen rápido */}
      <div className="row" style={{gap:8, marginBottom:12, flexWrap:"wrap"}}>
        <Tag>Total: {stats.total}</Tag>
        <Tag style={{background:"#c62828", color:"#fff"}}>Emergencias: {stats.emergencia}</Tag>
        <Tag>Pendientes: {stats.pendiente}</Tag>
        <Tag>Confirmadas: {stats.confirmada}</Tag>
        <Tag>Canceladas: {stats.cancelada}</Tag>
        <Tag style={{background:"#1b5e20", color:"#fff"}}>Pagadas: {stats.pagada}</Tag>
      </div>

      {/* Lista */}
      {lista.length === 0 ? (
        <p className="badge">No hay reservas para mostrar.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {lista.map(r => {
            const fecha = r.scheduledAt?.toDate?.() || r.createdAt?.toDate?.();
            const fechaTxt = fecha ? fecha.toLocaleString() : "—";
            const isEmergency = !!r.emergency;

            // Coincidencia entre solicitado y asignado
            const requestedId = r.interpreterRequestedId || null;
            const requestedName = r.interpreterRequestedName || null;
            const assignedId = r.interpreterId || null;

            const coincide = requestedId && assignedId && requestedId === assignedId;
            const difiere  = requestedId && assignedId && requestedId !== assignedId;

            return (
              <div
                key={r.id}
                className="card"
                style={{
                  padding: 12,
                  border: isEmergency ? "2px solid #c62828" : "none"
                }}
              >
                <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <b>#{r.id.slice(0, 6)}</b> — {r.userName || r.email}
                    {r.tipo && <Tag>{r.tipo}</Tag>}
                    <Tag>{r.minutes ? `${r.minutes} min` : (r.duracion || "")}</Tag>
                    {r.price ? <Tag>{`$${r.price.toLocaleString("es-CL")}`}</Tag> : null}

                    {(requestedName || requestedId) && (
                      <Tag style={{ background:"#0d47a1", color:"#fff" }}>
                        Solicita: {requestedName || `${requestedId.slice(0,6)}…`}
                      </Tag>
                    )}

                    {coincide && (
                      <Tag style={{ background:"#1b5e20", color:"#fff" }}>Asignado coincide ✔</Tag>
                    )}
                    {difiere && (
                      <Tag style={{ background:"#ffcc80", color:"#5d4037" }}>Asignado ≠ solicitado</Tag>
                    )}

                    {r.interpreterId && (
                      <Tag>Intérprete: {r.interpreterName || r.interpreterId.slice(0,6)+"…"}</Tag>
                    )}
                  </div>
                  <div>
                    <Tag>{r.status || "pendiente"}</Tag>

                    {r.payment?.status === "paid" && (
                      <Tag style={{ background:"#1b5e20", color:"#fff" }}>Pagada</Tag>
                    )}

                    {isEmergency && (
                      <Tag style={{ background: "#c62828", color: "#fff" }}>
                        EMERGENCIA
                      </Tag>
                    )}
                  </div>
                </div>

                {/* Selector de intérprete + botones */}
                <div className="row" style={{marginTop:8, alignItems:"center", gap:8, flexWrap:"wrap"}}>
                  <select
                    className="btn secondary"
                    value={sel[r.id] ?? r.interpreterId ?? ""}
                    onChange={e=>setSel(prev=>({ ...prev, [r.id]: e.target.value }))}
                    style={{minWidth:240}}
                  >
                    <option value="">— Seleccionar intérprete —</option>
                    {interps.map(i=>(
                      <option key={i.id} value={i.id}>
                        {i.displayName || "Intérprete"} {i.certificacion ? `· ${i.certificacion}` : ""}
                      </option>
                    ))}
                  </select>

                  <button
                    className="btn"
                    onClick={()=>asignar(r)}
                    disabled={saving[r.id]}
                  >
                    {saving[r.id] ? "Guardando..." : "Asignar"}
                  </button>

                  {r.interpreterId && (
                    <button
                      className="btn secondary"
                      onClick={()=>quitar(r)}
                      disabled={saving[r.id]}
                    >
                      Quitar
                    </button>
                  )}
                </div>

                <div className="row" style={{ justifyContent: "space-between", marginTop: 8 }}>
                  <span className="badge">Fecha: {fechaTxt}</span>
                  <div>
                    <button className="btn secondary" onClick={() => setEstado(r.id, "pendiente")} disabled={saving[r.id]}>Pendiente</button>
                    <button className="btn" onClick={() => setEstado(r.id, "confirmada")} style={{ marginLeft: 6 }} disabled={saving[r.id]}>Confirmar</button>
                    <button className="btn secondary" onClick={() => setEstado(r.id, "cancelada")} style={{ marginLeft: 6 }} disabled={saving[r.id]}>Cancelar</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Page>
  );
}
