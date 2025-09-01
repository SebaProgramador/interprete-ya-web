// src/pages/MisReservas.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { Page } from "../components/ui";

export default function MisReservas(){
  const [reservas, setReservas] = useState([]);

  useEffect(()=>{
    if(!auth.currentUser) return;
    const q = query(
      collection(db,"reservas"),
      where("userId","==",auth.currentUser.uid),
      orderBy("createdAt","desc")
    );
    const unsub = onSnapshot(q, snap=>{
      setReservas(snap.docs.map(d=>({id:d.id,...d.data()})));
    });
    return ()=>unsub();
  },[]);

  if (!auth.currentUser) {
    return (
      <Page title="Mis Reservas">
        <p className="badge">Debes iniciar sesión para ver tus reservas.</p>
        <Link className="btn" to="/login">Ingresar</Link>
      </Page>
    );
  }

  return (
    <Page title="Mis Reservas">
      {reservas.length===0 && <p className="badge">No tienes reservas aún.</p>}
      <div style={{display:"grid", gap:12}}>
        {reservas.map(r=>{
          const fecha = r.scheduledAt?.toDate?.() || r.createdAt?.toDate?.();
          const fechaTxt = fecha ? fecha.toLocaleString() : "—";
          const estado = r.status || "pendiente";
          const paid = r.payment?.status === "paid";
          const canPay = estado === "pendiente" && !paid && r.price > 0;

          const requestedName = r.interpreterRequestedName || (r.interpreterRequestedId ? r.interpreterRequestedId.slice(0,6)+"…" : "");
          const assignedName  = r.interpreterName || (r.interpreterId ? r.interpreterId.slice(0,6)+"…" : "");

          return (
            <div key={r.id} className="card" style={{padding:12}}>
              {/* Encabezado */}
              <div className="row" style={{justifyContent:"space-between", alignItems:"center"}}>
                <strong>
                  #{r.id.slice(0,6)} — {r.minutes ? `${r.minutes} min` : (r.duracion || "")}
                </strong>
                <div>
                  <span className="badge" style={{marginRight:6}}>{estado}</span>
                  {paid && <span className="badge" style={{background:"#1b5e20", color:"#fff"}}>Pagada</span>}
                  {r.emergency && <span className="badge" style={{background:"#c62828", color:"#fff", marginLeft:6}}>EMERGENCIA</span>}
                </div>
              </div>

              {/* Meta */}
              <div className="row" style={{justifyContent:"space-between", marginTop:6}}>
                <span className="badge">{r.tipo || "urgente"}</span>
                <span>{fechaTxt}</span>
              </div>

              {/* Intérprete solicitado / asignado */}
              {(requestedName || assignedName) && (
                <div className="row" style={{gap:8, marginTop:6, flexWrap:"wrap"}}>
                  {requestedName && (
                    <span className="badge" style={{background:"#0d47a1", color:"#fff"}}>
                      Solicita: {requestedName}
                    </span>
                  )}
                  {assignedName && (
                    <span className="badge">
                      Asignado: {assignedName}
                    </span>
                  )}
                </div>
              )}

              {/* Precio y acciones */}
              <div className="row" style={{justifyContent:"space-between", marginTop:8, alignItems:"center"}}>
                <b>{r.price ? `$${(r.price).toLocaleString("es-CL")}` : ""}</b>

                <div className="row" style={{gap:6}}>
                  {/* Botón Pagar (demo) */}
                  {canPay && (
                    <Link className="btn" to={`/pagar?reserva=${r.id}`}>
                      Pagar
                    </Link>
                  )}

                  {/* Botón Evaluar solo si está confirmada */}
                  {estado === "confirmada" && (
                    <Link
                      className="btn"
                      to={
                        `/evaluacion?reserva=${r.id}` +
                        (r.interpreterId ? `&interpreter=${r.interpreterId}` : "") +
                        (r.interpreterName ? `&name=${encodeURIComponent(r.interpreterName)}` : "")
                      }
                    >
                      Evaluar
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Page>
  );
}
