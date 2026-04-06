import { google } from "googleapis";
import { NextResponse } from "next/server";

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function getSheets() {
  return google.sheets({ version: "v4", auth: getAuth() });
}

const SHEET_ID = process.env.GOOGLE_SHEETS_ID;

// GET: leer una hoja completa
// ?sheet=Potreros
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sheet = searchParams.get("sheet");
    if (!sheet) return NextResponse.json({ error: "Falta parámetro sheet" }, { status: 400 });

    const sheets = getSheets();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${sheet}!A:Z`,
    });

    const rows = res.data.values || [];
    if (rows.length < 2) return NextResponse.json([]);

    const headers = rows[0];
    const data = rows.slice(1).map((row) => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i] || "";
      });
      return obj;
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error("GET sheets error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: agregar filas o reemplazar toda la hoja
// body: { sheet: "Rotaciones", action: "append", rows: [{...}] }
// body: { sheet: "Lotes", action: "replace", rows: [{...}] }
export async function POST(request) {
  try {
    const body = await request.json();
    const { sheet, action, rows } = body;

    if (!sheet || !rows) {
      return NextResponse.json({ error: "Faltan sheet o rows" }, { status: 400 });
    }

    const sheets = getSheets();

    if (action === "replace") {
      // Leer headers existentes
      const existing = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${sheet}!1:1`,
      });
      const headers = existing.data.values?.[0] || Object.keys(rows[0] || {});

      // Borrar contenido (mantener headers)
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SHEET_ID,
        range: `${sheet}!A2:Z10000`,
      });

      // Escribir filas nuevas
      if (rows.length > 0) {
        const values = rows.map((r) => headers.map((h) => r[h] ?? ""));
        await sheets.spreadsheets.values.update({
          spreadsheetId: SHEET_ID,
          range: `${sheet}!A2`,
          valueInputOption: "RAW",
          requestBody: { values },
        });
      }

      return NextResponse.json({ ok: true, count: rows.length });
    }

    // Default: append
    if (rows.length === 0) return NextResponse.json({ ok: true, count: 0 });

    // Leer headers para ordenar columnas
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${sheet}!1:1`,
    });
    const headers = existing.data.values?.[0] || Object.keys(rows[0]);

    const values = rows.map((r) => headers.map((h) => r[h] ?? ""));
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${sheet}!A:Z`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values },
    });

    return NextResponse.json({ ok: true, count: rows.length });
  } catch (err) {
    console.error("POST sheets error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
