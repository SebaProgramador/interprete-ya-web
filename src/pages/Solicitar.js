// src/pages/Solicitar.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  addDoc, collection, onSnapshot, query, where, serverTimestamp
} from "firebase/firestore";
import { Page, Row } from "../components/ui";

const PRICE = { 10: 2000, 30: 5000, 60: 9000 };
const priceFor = (min) => PRICE[min] ?? 0;

export default function Solicitar(){
  const nav = useNavigate();
  const [params] = useSearchParams();
  const preselectId = params.get("i") || params.get("interpreter") || ""; // opcional

  const [tipo, setTipo] = useState("videoconferencia"); // "presencial" | "videoconferencia"
  const [minutos, setMinutos] = useState(30);
  const [nota, setNota] = useState("");
  const [saving, setSaving] = useState(false);

  // Intérpretes para “preferencia”
  const [interps, setInterps] = useState([]);
  const [interpId, setInterpId] = useState("");
  const [interpName, setInterpName] = useState("");

  useEffect(()=>{
    // Suscribir intérpretes (role == interprete)
    const q = query(collection(db,"users"), where("role","==","interprete"));
    const unsub = onSnapshot(q, snap=>{
      const arr = snap.docs.map(d=>({id:d.id, ...d.data()}));
      setInterps(arr);
    });
    return ()=>unsub();
  },[]);

  // Si llega ?i= preselecciona
  useEffect(()=>{
    if (!preselectId || interps.length===0) return;
    const found = interps.find(x=>x.id===preselectId);
    if (found){
      setInterpId(found.id);
      setInterpName(found.displayName || "");
    }
  },[preselectId, interps]);

  const precio = useMemo(()=>priceFor(minutos), [minutos]);

  const crearYIrAPago = async () => {
    if (!auth.currentUser){ alert("Debes iniciar sesión."); nav("/login"); return; }
    try{
      setSaving(true);

      // preferencia de intérprete (no asigna, solo registra la solicitud)
      const requestedId = interpId || null;
      const requestedName = interpName || (interps.find(x=>x.id===interpId)?.displayName || null);

      const ref = await addDoc(collection(db,"reservas"), {
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || auth.currentUser.email,
        emergency: true,                // 👈 urgente
        tipo,                           // presencial | videoconferencia
        minutes: minutos,               // 10 | 30 | 60
        price: precio,
        note: nota || null,
        status: "pendiente",
        interpreterRequestedId: requestedId,
        interpreterRequestedName: requestedName,
        createdAt: serverTimestamp(),
      });

      // Ir a pagar
      nav(`/pagar?reserva=${ref.id}`);
    }catch(e){
      alert("Error al crear la reserva: " + e.message);
    }finally{
      setSaving(false);
    }
  };

  const crearSinPagar = async () => {
    if (!auth.currentUser){ alert("Debes iniciar sesión."); nav("/login"); return; }
    try{
      setSaving(true);

      const requestedId = interpId || null;
      const requestedName = interpName || (interps.find(x=>x.id===interpId)?.displayName || null);

      await addDoc(collection(db,"reservas"), {
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || auth.currentUser.email,
        emergency: true,
        tipo,
        minutes: minutos,
        price: precio,
        note: nota || null,
        status: "pendiente",
        interpreterRequestedId: requestedId,
        interpreterRequestedName: requestedName,
        createdAt: serverTimestamp(),
      });

      alert("✅ Reserva creada (urgente). Puedes pagar más tarde.");
      nav("/mis-reservas");
    }catch(e){
      alert("Error al crear la reserva: " + e.message);
    }finally{
      setSaving(false);
    }
  };

  return (
    <Page title="Solicitar Intérprete (URGENTE)">
      <div style={{display:"grid", gap:12}}>

        {/* Tipo de servicio */}
        <div className="card" style={{padding:12}}>
          <div className="badge" style={{marginBottom:8}}>Tipo de servicio</div>
          <div className="row" style={{flexWrap:"wrap", gap:8}}>
            <button
              type="button"
              className={"btn " + (tipo==="videoconferencia" ? "" : "secondary")}
              onClick={()=>setTipo("videoconferencia")}
            >
              🎥 Videoconferencia
            </button>
            <button
              type="button"
              className={"btn " + (tipo==="presencial" ? "" : "secondary")}
              onClick={()=>setTipo("presencial")}
            >
              🏠 Presencial
            </button>
          </div>
        </div>

        {/* Duración */}
        <div className="card" style={{padding:12}}>
          <div className="badge" style={{marginBottom:8}}>Duración</div>
          <div className="row" style={{flexWrap:"wrap"}}>
            {[10,30,60].map(m => (
              <button
                key={m}
                type="button"
                className={"btn " + (minutos===m ? "" : "secondary")}
                onClick={()=>setMinutos(m)}
                style={{marginRight:8, marginBottom:8}}
              >
                {m===60 ? "1 hora" : `${m} min`}
              </button>
            ))}
          </div>
        </div>

        {/* Preferencia de intérprete (opcional) */}
        <div className="card" style={{padding:12}}>
          <div className="badge" style={{marginBottom:8}}>Preferencia de intérprete (opcional)</div>
          <select
            className="btn secondary"
            value={interpId}
            onChange={e=>{
              const val = e.target.value;
              setInterpId(val);
              const found = interps.find(x=>x.id===val);
              setInterpName(found?.displayName || "");
            }}
            style={{minWidth:260}}
          >
            <option value="">— Sin preferencia —</option>
            {interps.map(i=>(
              <option key={i.id} value={i.id}>
                {i.displayName || "Intérprete"} {i.certificacion ? `· ${i.certificacion}` : ""}
              </option>
            ))}
          </select>
          {!!interpId && (
            <div className="badge" style={{marginTop:6}}>
              Solicitando a: {interpName || interpId.slice(0,6)+"…"}
            </div>
          )}
        </div>

        {/* Nota */}
        <label>
          Nota (opcional):
          <textarea
            rows={3}
            placeholder={tipo==="presencial"
              ? "Ej: Dirección y referencia rápida…"
              : "Ej: Contexto de la videollamada…"}
            value={nota}
            onChange={e=>setNota(e.target.value)}
          />
        </label>

        {/* Precio */}
        <div className="card" style={{padding:12}}>
          <div className="row" style={{justifyContent:"space-between"}}>
            <strong>Precio</strong>
            <strong>${precio.toLocaleString("es-CL")}</strong>
          </div>
          <p className="badge" style={{marginTop:8}}>
            * En modo demo. Conectaremos WebPay / MercadoPago más adelante.
          </p>
        </div>

        {/* Acciones */}
        <Row>
          <button className="btn" onClick={crearYIrAPago} disabled={saving}>
            {saving ? "Creando…" : "Pagar ahora"}
          </button>
          <button className="btn secondary" onClick={crearSinPagar} disabled={saving} style={{marginLeft:8}}>
            Crear y pagar después
          </button>
          <Link className="btn secondary" to="/agendar" style={{marginLeft:8}}>
            Mejor agendar
          </Link>
        </Row>
      </div>
    </Page>
  );
}
