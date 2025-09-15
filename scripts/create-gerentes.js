// scripts/create-gerentes.js (Node.js CommonJS)
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const auth = admin.auth();
const db = admin.firestore();

(async () => {
  const gerentes = [
    { email: "gerentesebastian@admin.com", password: "Seba@ADM",  displayName: "Sebastián (Gerente)" },
    { email: "gerenteandre@admin.com",     password: "Andre@ADM", displayName: "André (Gerente)" },
  ];

  for (const g of gerentes) {
    const user = await auth.createUser({
      email: g.email,
      password: g.password,
      displayName: g.displayName,
      emailVerified: true,
    });
    await db.collection("users").doc(user.uid).set({
      displayName: g.displayName,
      email: g.email,
      role: "gerente",
      aprobado: true,
      estadoCuenta: "aprobado",
      bloqueado: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    console.log("OK:", g.email);
  }

  process.exit(0);
})();
