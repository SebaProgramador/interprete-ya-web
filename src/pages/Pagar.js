// src/pages/Pagar.js
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Page, Row } from "../components/ui";

export default function Pagar(){
  const nav = useNavigate();
  const [params] = useSearchParams();

  // ✅ Acepta ?rid= o ?reserva=
  const rid = params.get("rid") || params.get("reserva");

  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [r, setR]               = useState(null);
  const [method, setMethod]     = useState("webpay"); // webpay | mercadopago

  useEffect(()=>{
    (async ()=>{
      if (!auth.currentUser){ nav("/login"); return; }
      if (!rid){ setLoading(false); return; }
      try{
        const snap = await getDoc(doc(db, "reservas", rid));
        if (!snap.exists()){
          alert("Reserva no encontrada");
          nav("/mis-reservas");
          return;
        }
        const data = { id: snap.id, ...snap.data() };
        // si no es del usuario, no permitir (reglas también lo bloquean)
        if (data.userId !== auth.currentUser.uid){
          alert("No puedes pagar esta reserva.");
          nav("/mis-reservas");
          return;
        }
        setR(data);
      }catch(e){
        alert("Error: " + e.message);
      }finally{
        setLoading(false);
      }
    })();
  },[rid, nav]);

  const confirmarPagoDemo = async () => {
    if (!r) return;
    if (!r.price || r.price <= 0){
      alert("Esta reserva no tiene precio.");
      return;
    }
    if (r.payment?.status === "paid"){
      alert("Esta reserva ya está pagada.");
      nav("/mis-reservas");
      return;
    }
    try{
      setSaving(true);
      await updateDoc(doc(db, "reservas", r.id), {
        payment: {
          status: "paid",
          method,
          paidAt: serverTimestamp()
        },
        status: "confirmada" // en demo, confirmamos al pagar
      });
      alert("✅ Pago realizado (demo). ¡Gracias!");
      nav("/mis-reservas");
    }catch(e){
      alert("Error al pagar: " + e.message);
    }finally{
      setSaving(false);
    }
  };

  if (loading) return <Page title="Pago de reserva"><p className="badge">Cargando…</p></Page>;
  if (!r) return (
    <Page title="Pago de reserva">
      <p className="badge">Reserva no disponible.</p>
      <Link className="btn secondary" to="/mis-reservas">Volver</Link>
    </Page>
  );

  const fecha = r.scheduledAt?.toDate?.() || r.createdAt?.toDate?.();
  const fechaTxt = fecha ? fecha.toLocaleString() : "—";
  const yaPagada = r.payment?.status === "paid";

  return (
    <Page title="Pago de reserva">
      <div className="card" style={{padding:12, marginBottom:12}}>
        <div className="row" style={{justifyContent:"space-between"}}>
          <strong>Reserva #{r.id.slice(0,6)}</strong>
          <span className="badge">{r.status || "pendiente"}</span>
        </div>
        <div className="row" style={{justifyContent:"space-between", marginTop:6}}>
          <span className="badge">{r.tipo}</span>
          <span className="badge">{r.minutes} min</span>
          <span>{fechaTxt}</span>
        </div>
        {r.interpreterName && (
          <div className="badge" style={{marginTop:6}}>
            Intérprete asignado: {r.interpreterName}
          </div>
        )}
        <div className="row" style={{justifyContent:"space-between", marginTop:10}}>
          <strong>Total</strong>
          <strong>${r.price?.toLocaleString("es-CL")}</strong>
        </div>
      </div>

      {yaPagada ? (
        <>
          <p className="badge" style={{background:"#1b5e20", color:"#fff"}}>Pagada ✅</p>
          <Row><Link className="btn" to="/mis-reservas">Volver</Link></Row>
        </>
      ) : (
        <>
          <div className="card" style={{padding:12}}>
            <div className="badge" style={{marginBottom:8}}>Método de pago</div>
            <label className="row" style={{gap:8, alignItems:"center"}}>
              <input
                type="radio"
                name="method"
                value="webpay"
                checked={method==="webpay"}
                onChange={()=>setMethod("webpay")}
              />
              WebPay (CL)
            </label>
            <label className="row" style={{gap:8, alignItems:"center", marginTop:6}}>
              <input
                type="radio"
                name="method"
                value="mercadopago"
                checked={method==="mercadopago"}
                onChange={()=>setMethod("mercadopago")}
              />
              MercadoPago
            </label>

            <Row style={{marginTop:12}}>
              <button className="btn" onClick={confirmarPagoDemo} disabled={saving}>
                {saving ? "Procesando…" : "Confirmar pago (demo)"}
              </button>
              <Link className="btn secondary" to="/mis-reservas" style={{marginLeft:6}}>
                Cancelar
              </Link>
            </Row>

            <p className="badge" style={{marginTop:8}}>
              * Demo: no abre pasarela real. Integraremos WebPay/MercadoPago luego.
            </p>
          </div>
        </>
      )}
    </Page>
  );
}
