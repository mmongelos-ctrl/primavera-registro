export const today = () => new Date().toISOString().split("T")[0];

export const fmtDate = (d) => {
  if (!d) return "";
  const x = new Date(d + "T12:00:00");
  return x.toLocaleDateString("es-PY", { day: "2-digit", month: "short", year: "numeric" });
};

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export const sumCab = (cats) => cats.reduce((s, c) => s + (Number(c.cab) || 0), 0);

export const parseCats = (json) => {
  try { return JSON.parse(json); }
  catch { return []; }
};

export const flash = (setter, msg) => {
  setter(msg);
  setTimeout(() => setter(""), 2500);
};

export function getEstadoPot(rotaciones, potreros, lotes, pid) {
  const h = rotaciones
    .filter((r) => r.pid === pid)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  const le = h.find((x) => x.tipo === "entrada");
  const ls = h.find((x) => x.tipo === "salida");
  const enUso = !!(le && (!ls || new Date(le.fecha) > new Date(ls.fecha)));
  const diasDesc = ls && !enUso
    ? Math.floor((Date.now() - new Date(ls.fecha)) / 864e5)
    : null;
  const lote = le ? lotes.find((l) => l.id === le.loteId) : null;
  return { enUso, diasDesc, lote, hist: h };
}
