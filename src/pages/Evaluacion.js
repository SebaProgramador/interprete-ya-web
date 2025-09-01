// src/pages/Evaluacion.js
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  addDoc, collection, doc, getDoc, getDocs,
  query, where, serverTimestamp, updateDoc, increment
} from "firebase/firestore";
import { Page, Row } from "../components/ui";

function StarsPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const v = hover || value;
  return (
    <div
      role="radiogroup"
      aria-label="Calificación"
      style={{ fontSize: 28, letterSpacing: 4, userSelect: "none" }}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          role="radio"
          aria-checked={value === n}
          tabIndex={0}
          onClick={() => onChange(n)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onChange(n); }}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          style={{ cursor: "pointer", outline: "none" }}
          title={`${n} estrella${n>1?"s":""}`}
        >
          {v >= n ? "⭐" : "☆"}
        </span>
      ))}
    </div>
  );
}

export default function Evaluacion() {
  const nav = useNavigate();
  const [params] = useSearchParams();

  // acepta ?reserva= o ?rid=
  const rid = params.get("reserva") || params.get("rid") || "";
  const interpFromQuery = params.get("interpreter") || "";
  const nameFromQuery = params.get("name") || "";

  const [loading, setLoading] = useState(true);
  const [reserva, setReserva] = useState(null);

  const [interpreterId, setInterpreterId] = useState(interpFromQuery);
  const [interpreterName, setInterpreterName] = useState(nameFromQuery);

  const [stars, setStars] = useState(5);      // ⭐ por defecto 5
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [yaExiste, setYaExiste] = useState(false);

  useEffect(() => {
    (async () => {
      if (!auth.currentUser) { nav("/login"); return; }
      if (!rid) { setLoading(false); return; }

      try {
        // 1) cargar reserva
        const rsnap = await getDoc(doc(db, "reservas", rid));
        if (!rsnap.exists()) { alert("Reserva no encontrada"); nav("/mis-reservas"); return; }
        const rdata = { id: rsnap.id, ...rsnap.data() };

        // dueño
        if (rdata.userId !== auth.currentUser.uid) {
          alert("No puedes evaluar esta reserva.");
          nav("/mis-reservas");
          return;
        }
        setReserva(rdata);

        // completar intérprete si viene desde la reserva
        if (!interpreterId && rdata.interpreterId) setInterpreterId(rdata.interpreterId);
        if (!interpreterName && rdata.interpreterName) setInterpreterName(rdata.interpreterName);

        // 2) verificar si ya existe rating de este usuario para esta reserva
        const qsnap = await getDocs(
          query(
            collection(db, "ratings"),
            where("reservationId", "==", rid),
            where("userId", "==", auth.currentUser.uid)
          )
        );
        if (!qsnap.empty || rdata.rated === true) setYaExiste(true);
      } catch (e) {
        alert("Error: " + e.message);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rid]);

  const guardar = async () => {
    if (!auth.currentUser) { nav("/login"); return; }
    if (!rid || !reserva) { alert("Falta la reserva."); return; }
    if (!interpreterId) { alert("No hay intérprete asociado."); return; }
    if (stars < 1) { alert("Selecciona una calificación (1 a 5)."); return; }

    try {
      setSaving(true);

      // doble chequeo anti-duplicado
      const qsnap = await getDocs(
        query(
          collection(db, "ratings"),
          where("reservationId", "==", rid),
          where("userId", "==", auth.currentUser.uid)
        )
      );
      if (!qsnap.empty || reserva.rated === true) {
        setYaExiste(true);
        setSaving(false);
        return;
      }

      // 1) guardar rating
      await addDoc(collection(db, "ratings"), {
        reservationId: rid,
        userId: auth.currentUser.uid,
        interpreterId,
        interpreterName: interpreterName || null,
        stars,
        comment: comment.trim() || null,
        createdAt: serverTimestamp(),
      });

      // 2) marcar reserva como evaluada
      await updateDoc(doc(db, "reservas", rid), { rated: true });

      // 3) actualizar acumulados del intérprete (para promedios rápidos)
      await updateDoc(doc(db, "users", interpreterId), {
        ratingCount: increment(1),
        ratingSum: increment(stars)
      });

      alert("✅ ¡Gracias por tu evaluación!");
      nav("/mis-reservas");
    } catch (e) {
      alert("Error al guardar: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Page title="Evaluar intérprete">
        <p className="badge">Cargando…</p>
      </Page>
    );
  }

  if (!reserva) {
    return (
      <Page title="Evaluar intérprete">
        <p className="badge">Reserva no disponible.</p>
        <Link className="btn secondary" to="/mis-reservas">Volver</Link>
      </Page>
    );
  }

  const fecha = reserva.scheduledAt?.toDate?.() || reserva.createdAt?.toDate?.() || new Date();
  const fechaTxt = fecha.toLocaleString();
  const statusTxt = reserva.status || "pendiente";

  return (
    <Page title="Evaluar intérprete">
      <div className="card" style={{ padding: 12, marginBottom: 12 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <strong>Reserva #{reserva.id.slice(0, 6)}</strong>
          <span className="badge">{statusTxt}</span>
        </div>

        <div className="row" style={{ justifyContent: "space-between", marginTop: 6 }}>
          <span className="badge">{reserva.tipo || "servicio"}</span>
          <span className="badge">{reserva.minutes ? `${reserva.minutes} min` : "—"}</span>
          <span>{fechaTxt}</span>
        </div>

        {interpreterName || interpreterId ? (
          <div className="badge" style={{ marginTop: 6 }}>
            Intérprete: {interpreterName || `${interpreterId.slice(0, 6)}…`}
          </div>
        ) : (
          <div className="badge" style={{ marginTop: 6 }}>
            * Esta reserva no tiene intérprete asignado aún.
          </div>
        )}

        {statusTxt !== "confirmada" && (
          <div className="badge" style={{ marginTop: 6 }}>
            * Sugerencia: evalúa después de que el servicio esté <b>confirmado</b>.
          </div>
        )}
      </div>

      {yaExiste ? (
        <>
          <p className="badge" style={{ background: "#1b5e20", color: "#fff" }}>
            Ya enviaste una evaluación para esta reserva. ¡Gracias!
          </p>
          <Row><Link className="btn" to="/mis-reservas">Volver</Link></Row>
        </>
      ) : (
        <div className="card" style={{ padding: 12 }}>
          <div className="badge" style={{ marginBottom: 6 }}>Tu calificación</div>
          <StarsPicker value={stars} onChange={setStars} />

          <label style={{ display: "block", marginTop: 12 }}>
            Comentarios (opcional):
            <textarea
              rows={3}
              placeholder="¿Qué tal fue el servicio?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ width: "100%", marginTop: 6 }}
            />
          </label>

          <Row style={{ marginTop: 12 }}>
            <button className="btn" onClick={guardar} disabled={saving || !interpreterId}>
              {saving ? "Guardando…" : "Enviar evaluación"}
            </button>
            <Link className="btn secondary" to="/mis-reservas" style={{ marginLeft: 6 }}>
              Cancelar
            </Link>
          </Row>

          {!interpreterId && (
            <p className="badge" style={{ marginTop: 8 }}>
              * Falta intérprete asignado. Cuando el gerente asigne uno, podrás evaluar.
            </p>
          )}
        </div>
      )}
    </Page>
  );
}
