// src/pages/Emergencia.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  Timestamp,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { Page, Row } from "../components/ui";

export default function Emergencia() {
  const nav = useNavigate();
  const user = auth.currentUser;
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);

  // Carga preferencia “nightConsent”
  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(ref, (s) => {
      setConsent(!!s.data()?.nightConsent);
    });
    return () => unsub();
  }, [user]);

  const guardarConsent = async (checked) => {
    if (!user) return;
    setConsent(checked);
    await updateDoc(doc(db, "users", user.uid), { nightConsent: checked });
  };

  const pedirAyuda = async () => {
    if (!user) {
      nav("/login");
      return;
    }
    try {
      setSaving(true);

      // Vibración sutil (si está disponible) para feedback inmediato
      if (navigator?.vibrate) navigator.vibrate(120);

      // Reserva de 10 min, videoconferencia, emergencia
      await addDoc(collection(db, "reservas"), {
        userId: user.uid,
        userName: user.displayName || user.email,
        tipo: "videoconferencia",
        minutes: 10,
        price: 2000, // demo: mismo precio que “10 min”
        scheduledAt: Timestamp.fromDate(new Date()), // ahora
        note: "Solicitud de EMERGENCIA",
        emergency: true,
        status: "pendiente",
        createdAt: serverTimestamp(),
      });

      alert("✅ Emergencia enviada. Buscando intérprete…");
      nav("/mis-reservas");
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Page title="Emergencia">
      <div className="card" style={{ padding: 16 }}>
        <p className="badge" style={{ lineHeight: 1.6 }}>
          En caso de emergencia, presiona el botón para crear una reserva
          inmediata de 10 minutos por videollamada. Se notificará a intérpretes
          de turno.
        </p>

        <label className="badge" style={{ cursor: "pointer", marginTop: 8 }}>
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => guardarConsent(e.target.checked)}
            style={{ marginRight: 6 }}
          />
          Consentimiento para interrumpir sueño (solo urgencias reales).
        </label>

        <Row style={{ marginTop: 14 }}>
          <button
            className="btn danger tag-emergency"
            onClick={pedirAyuda}
            disabled={saving}
            aria-live="polite"
            aria-label="Botón de emergencia. Crea una reserva inmediata y notifica a intérpretes de turno."
            style={{ fontSize: 16, padding: "14px 18px" }}
          >
            {saving ? "Enviando…" : "🚨 Botón de Emergencia"}
          </button>
        </Row>

        <div
          className="row"
          style={{ gap: 8, marginTop: 14, flexWrap: "wrap" }}
        >
          <a className="btn secondary" href="tel:133">
            Llamar a Carabineros
          </a>
          <a className="btn secondary" href="tel:131">
            Llamar a Ambulancia
          </a>
          <a className="btn secondary" href="tel:132">
            Llamar a Bomberos
          </a>
        </div>

        <p className="badge" style={{ marginTop: 12 }}>
          * En el panel del gerente, estas reservas aparecen destacadas como{" "}
          <b>EMERGENCIA</b>.
        </p>
      </div>
    </Page>
  );
}
