// Cliente para hablar con /api/sheets desde el browser

const BASE = "/api/sheets";

export async function readSheet(sheet) {
  const res = await fetch(`${BASE}?sheet=${encodeURIComponent(sheet)}`);
  if (!res.ok) throw new Error(`Error leyendo ${sheet}: ${res.status}`);
  return res.json();
}

export async function appendRows(sheet, rows) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sheet, action: "append", rows }),
  });
  if (!res.ok) throw new Error(`Error escribiendo en ${sheet}: ${res.status}`);
  return res.json();
}

export async function replaceSheet(sheet, rows) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sheet, action: "replace", rows }),
  });
  if (!res.ok) throw new Error(`Error reemplazando ${sheet}: ${res.status}`);
  return res.json();
}
