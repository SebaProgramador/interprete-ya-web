// dentro de CuentasPendientes.jsx
async function cargar() {
  setLoading(true);
  try {
    const q = query(collection(db, "users"),
      where("estadoCuenta", "==", "pendiente"),
      limit(100)
    );
    const s = await getDocs(q);
    setItems(s.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (e) {
    console.error("Firestore error:", e);
    // Muestra badge de error en la UI
    setItems([]);
    alert("No tienes permisos para ver esta lista. Inicia sesión como GERENTE o revisa las Firestore Rules.");
  } finally {
    setLoading(false);
  }
}
