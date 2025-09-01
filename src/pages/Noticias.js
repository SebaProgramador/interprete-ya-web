import React, { useEffect, useMemo, useState } from "react";
import { auth, db } from "../firebase";
import {
  addDoc, collection, deleteDoc, doc,
  onSnapshot, orderBy, query, serverTimestamp, updateDoc
} from "firebase/firestore";
import { Page, Row } from "../components/ui";
import useUserRole from "../hooks/useUserRole";

const CATS = ["todas", "emergencia", "comunidad", "eventos", "leyes", "sistema"];

/* helpers */
const cap = (s="") => s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
const normUrl = (u="") => {
  const t = u.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return t;
  return "https://" + t;
};

export default function Noticias(){
  const user = auth.currentUser;
  const role = useUserRole(user);

  const [items, setItems] = useState([]);
  const [busca, setBusca] = useState("");
  const [cat, setCat] = useState("todas");
  const [soloEmerg, setSoloEmerg] = useState(false);

  // Preferencia del usuario: recibir alertas de emergencia
  const [notifyEmergency, setNotifyEmergency] = useState(false);
  const [savingPref, setSavingPref] = useState(false);

  // Publicar (solo gerente)
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("comunidad");
  const [isEmergency, setIsEmergency] = useState(false);
  const [sourceUrl, setSourceUrl] = useState("");
  const [posting, setPosting] = useState(false);

  /* Suscripción a noticias */
  useEffect(()=>{
    const q = query(collection(db, "news"), orderBy("createdAt","desc"));
    const unsub = onSnapshot(q, snap=>{
      setItems(snap.docs.map(d=>({ id: d.id, ...d.data() })));
    });
    return ()=>unsub();
  },[]);

  /* Cargar preferencia del usuario (si hay sesión) */
  useEffect(()=>{
    if (!user) return;
    const r = doc(db, "users", user.uid);
    const unsub = onSnapshot(r, s=>{
      if (s.exists()) setNotifyEmergency(!!s.data().notifyEmergency);
    });
    return ()=>unsub();
  },[user]);

  /* Filtro + búsqueda */
  const lista = useMemo(()=>{
    const t = busca.trim().toLowerCase();
    return items
      .filter(n => (cat==="todas" ? true : (n.category || "comunidad") === cat))
      .filter(n => !soloEmerg || !!n.isEmergency)
      .filter(n => {
        if (!t) return true;
        return (n.title||"").toLowerCase().includes(t) ||
               (n.body||"").toLowerCase().includes(t) ||
               (n.category||"").toLowerCase().includes(t);
      });
  },[items, busca, cat, soloEmerg]);

  /* Guardar preferencia de alertas */
  const savePref = async (checked)=>{
    if (!user) return;
    try{
      setSavingPref(true);
      await updateDoc(doc(db, "users", user.uid), { notifyEmergency: checked });
      setNotifyEmergency(checked);
    } finally{
      setSavingPref(false);
    }
  };

  /* Publicar noticia (solo gerente) */
  const publicar = async ()=>{
    if (role !== "gerente") { alert("Solo el gerente puede publicar."); return; }
    if (!title.trim() || !body.trim()){
      alert("Título y contenido son obligatorios");
      return;
    }
    try{
      setPosting(true);
      await addDoc(collection(db, "news"), {
        title: title.trim(),
        body: body.trim(),
        category,
        isEmergency,
        sourceUrl: normUrl(sourceUrl),
        createdAt: serverTimestamp(),
        authorId: user?.uid || null,
        authorName: user?.displayName || user?.email || "gerente"
      });
      setTitle(""); setBody(""); setIsEmergency(false); setSourceUrl("");
      alert("✅ Noticia publicada");
    }catch(e){
      alert("Error publicando: " + e.message);
    }finally{
      setPosting(false);
    }
  };

  /* Acciones de gerente en items */
  const toggleEmergency = async (n)=>{
    if (role !== "gerente") { alert("Acción solo para gerente."); return; }
    try{
      await updateDoc(doc(db, "news", n.id), { isEmergency: !n.isEmergency });
    }catch(e){
      alert("No se pudo actualizar: " + e.message);
    }
  };

  const eliminar = async (n)=>{
    if (role !== "gerente") { alert("Acción solo para gerente."); return; }
    if (!window.confirm("¿Eliminar esta noticia?")) return;
    try{
      await deleteDoc(doc(db, "news", n.id));
    }catch(e){
      alert("No se pudo eliminar: " + e.message);
    }
  };

  return (
    <Page title="Noticias y alertas">
      {/* Preferencias + filtros */}
      <div className="card" style={{marginBottom:12}}>
        <Row style={{alignItems:"center", gap:8, flexWrap:"wrap"}}>
          <input
            aria-label="Buscar noticia"
            placeholder="Buscar noticia…"
            value={busca}
            onChange={e=>setBusca(e.target.value)}
            style={{flex:1, minWidth:220}}
          />
          <select
            className="btn secondary"
            value={cat}
            onChange={e=>setCat(e.target.value)}
            aria-label="Categoría"
          >
            {CATS.map(c => <option key={c} value={c}>{cap(c)}</option>)}
          </select>
          <label className="badge" style={{cursor:"pointer"}}>
            <input
              type="checkbox"
              checked={soloEmerg}
              onChange={e=>setSoloEmerg(e.target.checked)}
              style={{marginRight:6}}
            />
            Solo emergencias
          </label>

          {user && (
            <label className="badge" style={{cursor:"pointer", marginLeft:"auto"}}>
              <input
                type="checkbox"
                checked={notifyEmergency}
                onChange={e=>savePref(e.target.checked)}
                disabled={savingPref}
                style={{marginRight:6}}
              />
              Recibir alertas de emergencia
            </label>
          )}
        </Row>
      </div>

      {/* Publicar (solo gerente) */}
      {role==="gerente" && (
        <div className="card" style={{marginBottom:12, paddingBottom:12}}>
          <div className="badge" style={{marginBottom:8}}>Publicar noticia (solo gerente)</div>
          <input
            placeholder="Título"
            value={title}
            onChange={e=>setTitle(e.target.value)}
            aria-label="Título de la noticia"
          />
          <textarea
            rows={4}
            placeholder="Contenido"
            value={body}
            onChange={e=>setBody(e.target.value)}
            style={{marginTop:8}}
            aria-label="Contenido"
          />
          <Row style={{marginTop:8, alignItems:"center", flexWrap:"wrap", gap:8}}>
            <select
              className="btn secondary"
              value={category}
              onChange={e=>setCategory(e.target.value)}
              aria-label="Categoría de publicación"
            >
              {CATS.filter(c=>c!=="todas" && c!=="emergencia").map(c=>
                <option key={c} value={c}>{cap(c)}</option>
              )}
            </select>

            <label className="badge" style={{cursor:"pointer"}}>
              <input
                type="checkbox"
                checked={isEmergency}
                onChange={e=>setIsEmergency(e.target.checked)}
                style={{marginRight:6}}
              />
              Marcar como EMERGENCIA
            </label>

            <input
              placeholder="Fuente (URL opcional)"
              value={sourceUrl}
              onChange={e=>setSourceUrl(e.target.value)}
              aria-label="Fuente de la noticia"
              style={{flex:1, minWidth:240}}
            />

            <button className="btn" onClick={publicar} disabled={posting} style={{marginLeft:"auto"}}>
              {posting ? "Publicando…" : "Publicar"}
            </button>
          </Row>
        </div>
      )}

      {/* Lista de noticias */}
      {lista.length===0 ? (
        <p className="badge">No hay noticias para mostrar.</p>
      ) : (
        <div style={{display:"grid", gap:12}}>
          {lista.map(n=>{
            const fecha = n.createdAt?.toDate?.();
            const fechaTxt = fecha ? fecha.toLocaleString() : "—";
            const catTxt = cap(n.category || "comunidad");
            return (
              <div
                key={n.id}
                className="card"
                style={{
                  padding:14,
                  border: n.isEmergency ? "2px solid #c62828" : "1px solid rgba(255,255,255,.08)"
                }}
              >
                <div className="row" style={{justifyContent:"space-between", alignItems:"center"}}>
                  <div style={{fontWeight:800, fontSize:18}}>{n.title}</div>
                  <div className="row" style={{gap:6, flexWrap:"wrap"}}>
                    {n.isEmergency && <span className="badge" style={{background:"#c62828", color:"#fff"}}>EMERGENCIA</span>}
                    <span className="badge">{catTxt}</span>
                    <span className="badge">{fechaTxt}</span>
                  </div>
                </div>

                {n.body && <p style={{marginTop:8, lineHeight:1.6}}>{n.body}</p>}

                <div className="row" style={{justifyContent:"space-between", alignItems:"center", marginTop:6}}>
                  <div className="badge">Por: {n.authorName || "sistema"}</div>
                  <div className="row" style={{gap:6, flexWrap:"wrap"}}>
                    {n.sourceUrl && (
                      <a className="btn secondary" href={n.sourceUrl} target="_blank" rel="noopener noreferrer">
                        Fuente
                      </a>
                    )}
                    {role==="gerente" && (
                      <>
                        <button className="btn secondary" onClick={()=>toggleEmergency(n)}>
                          {n.isEmergency ? "Quitar emergencia" : "Marcar emergencia"}
                        </button>
                        <button className="btn" onClick={()=>eliminar(n)}>Eliminar</button>
                      </>
                    )}
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
