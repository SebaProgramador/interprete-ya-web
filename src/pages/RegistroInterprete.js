import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, Row } from "../components/ui";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

async function ensureUserDoc(uid, data){
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) await setDoc(ref, { createdAt: Date.now(), ...data });
  else await setDoc(ref, { ...snap.data(), ...data }, { merge: true });
}

export default function RegistroInterprete(){
  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [pass,setPass] = useState("");
  const [loading,setLoading] = useState(false);
  const nav = useNavigate();

  const registrar = async () => {
    if(!email || !pass || !name){ alert("Completa nombre, correo y contraseña"); return; }
    try{
      setLoading(true);
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(cred.user, { displayName: name });
      await ensureUserDoc(cred.user.uid, {
        role:"interprete", displayName:name, email,
        certificacion:"", experiencia:"", rating:0
      });
      alert("¡Intérprete registrado!");
      nav("/");
    }catch(e){ alert(e.message); }
    finally{ setLoading(false); }
  };

  return (
    <Page title="Registro de Intérprete">
      <form style={{display:"grid", gap:12, marginTop:12}} onSubmit={e=>e.preventDefault()}>
        <input placeholder="Nombre completo" value={name} onChange={e=>setName(e.target.value)} />
        <input placeholder="Correo electrónico" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Crear contraseña" type="password" value={pass} onChange={e=>setPass(e.target.value)} />
        <Row><button className="btn" onClick={registrar} disabled={loading}>{loading? "Creando..." : "Registrar"}</button></Row>
      </form>
    </Page>
  );
}
