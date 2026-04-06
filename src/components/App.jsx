"use client";
import { useState, useEffect, useCallback } from "react";
import { readSheet, appendRows, replaceSheet } from "@/lib/sheets";
import { POTREROS_INIT, LOTES_INIT } from "@/lib/data";
import { parseCats } from "@/lib/utils";
import Header from "./Header";
import Nav from "./Nav";
import Resumen from "./Resumen";
import Lotes from "./Lotes";
import Potreros from "./Potreros";
import Movimientos from "./Movimientos";

export default function App() {
  const [tab, setTab] = useState("resumen");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // Cargar todo al inicio
  const loadAll = useCallback(async () => {
    try {
      let [potreros, lotesRaw, rotaciones, movimientos, biomasa] = await Promise.all([
        readSheet("Potreros"),
        readSheet("Lotes"),
        readSheet("Rotaciones"),
        readSheet("Movimientos"),
        readSheet("Biomasa"),
      ]);

      // Si potreros está vacío, cargar datos iniciales
      if (potreros.length === 0) {
        await replaceSheet("Potreros", POTREROS_INIT);
        potreros = POTREROS_INIT;
      }
      if (lotesRaw.length === 0) {
        await replaceSheet("Lotes", LOTES_INIT);
        lotesRaw = LOTES_INIT;
      }

      // Parsear categorias_json de lotes
      const lotes = lotesRaw.map((l) => ({
        ...l,
        categorias: parseCats(l.categorias_json),
      }));

      // Parsear números
      potreros = potreros.map((p) => ({ ...p, ha: parseFloat(p.ha) || 0 }));
      movimientos = movimientos.map((m) => ({ ...m, cantidad: parseInt(m.cantidad) || 0 }));
      biomasa = biomasa.map((b) => ({ ...b, kgMsHa: parseFloat(b.kgMsHa) || 0 }));

      setData({ potreros, lotes, rotaciones, movimientos, biomasa });
      setError(null);
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError("Error conectando con Google Sheets. Verificá la configuración.");
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Helper para agregar fila y recargar
  const addRow = useCallback(async (sheet, row) => {
    setSyncing(true);
    try {
      await appendRows(sheet, [row]);
      await loadAll();
    } catch (err) {
      console.error(err);
      setError("Error guardando. Reintentá.");
    }
    setSyncing(false);
  }, [loadAll]);

  // Helper para reemplazar hoja completa (para lotes que se actualizan)
  const replaceLotes = useCallback(async (newLotes) => {
    setSyncing(true);
    try {
      const rows = newLotes.map((l) => ({
        id: l.id,
        nombre: l.nombre,
        color: l.color,
        categorias_json: JSON.stringify(l.categorias),
      }));
      await replaceSheet("Lotes", rows);
      await loadAll();
    } catch (err) {
      console.error(err);
      setError("Error actualizando lotes.");
    }
    setSyncing(false);
  }, [loadAll]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-campo-50">
        <div className="text-center">
          <div className="text-campo-800 font-display text-xl mb-2">Primavera</div>
          <div className="text-gray-400 text-sm">Conectando con Google Sheets…</div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-campo-50 p-6">
        <Header />
        <div className="max-w-lg mx-auto mt-8 bg-white rounded-xl p-6 shadow">
          <div className="text-red-600 font-semibold mb-2">Error de conexión</div>
          <div className="text-gray-600 text-sm mb-4">{error}</div>
          <button onClick={loadAll} className="bg-campo-800 text-white px-4 py-2 rounded-lg font-semibold">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-campo-50">
      <Header />
      {syncing && (
        <div className="bg-yellow-50 text-yellow-700 text-center text-xs py-1 font-medium">
          Guardando…
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-600 text-center text-xs py-1 cursor-pointer" onClick={() => setError(null)}>
          {error} (tocar para cerrar)
        </div>
      )}
      <Nav tab={tab} set={setTab} />
      <div className="max-w-[960px] mx-auto px-4 pb-20">
        {tab === "resumen" && <Resumen d={data} />}
        {tab === "lotes" && <Lotes d={data} addRow={addRow} replaceLotes={replaceLotes} />}
        {tab === "potreros" && <Potreros d={data} addRow={addRow} />}
        {tab === "mov" && <Movimientos d={data} addRow={addRow} replaceLotes={replaceLotes} />}
      </div>
    </div>
  );
}
