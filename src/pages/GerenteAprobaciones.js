// src/pages/GerenteAprobaciones.js
import React from "react";
import { Button, Card } from "../components/ui";
import { db, auth } from "../firebase";
import {
  collection, query, where, limit, getDocs,
  doc, updateDoc, serverTimestamp
} from "firebase/firestore";

export default function GerenteAprobaciones(){
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const me = auth.currentUser;

  async function cargar(){
    setLoading(true);
    const q = query(collection(db, "users"), where("estadoCuenta", "==", "pendiente"), limit(50));
    const s = await getDocs(q);
    const arr = s.docs.map(d => ({ id: d.id, ...d.data() }));
    setItems(arr);
    setLoading(false);
  }

  React.useEffect(()=>{ cargar(); }, []);

  async function aprobar(id){
    await updateDoc(doc(db, "users", id), {
      estadoCuenta: "aprobado",
      aprobado: true,
      aprobadoEn: serverTimestamp(),
      aprobadoPorUid: me?.uid || null,
      aprobadoPorEmail: me?.email || null
    });
    await cargar();
  }

  async function rechazar(id){
    await updateDoc(doc(db, "users", id), {
      estadoCuenta: "rechazado",
      aprobado: false,
      rechazadoEn: serverTimestamp(),
      rechazadoPorUid: me?.uid || null,
      rechazadoPorEmail: me?.email || null
    });
    await cargar();
  }

  return (
    <div className="container">
      <h1 className="heroTitle">Gerente · Aprobaciones</h1>
      <p className="heroSub">Revisa y aprueba/rechaza cuentas nuevas.</p>

      {loading && <div className="badge" style={{marginTop:12}}>Cargando…</div>}

      {!loading && items.length === 0 && (
        <div className="badge" style={{marginTop:12}}>No hay solicitudes pendientes.</div>
      )}

      <div className="grid3" style={{marginTop:12}}>
        {items.map(u => (
          <Card key={u.id} title={u.displayName || u.email} subtitle={u.email}>
            <div className="table" style={{marginTop:8}}>
              <div className="badge">RUT/DNI: <b>{u.dni || "-"}</b></div>
              <div className="badge">Credencial: <b>{u.credencialDiscapacidad || "-"}</b></div>
              <div className="badge">Sordera: <b>{u.tipoSordera || "-"}</b></div>
              <div className="badge">Estado: <b>{u.estado || "-"}</b></div>
              <div className="badge">Prof: <b>{u.profesion || "-"}</b></div>
            </div>
            <div className="row" style={{marginTop:12, justifyContent:"flex-end", gap:8}}>
              <Button variant="secondary" onClick={()=>rechazar(u.id)}>Rechazar</Button>
              <Button onClick={()=>aprobar(u.id)}>Aprobar</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
