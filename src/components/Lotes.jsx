"use client";
import { useState } from "react";
import { Card, Btn, Sel, Inp, Lbl, SectionTitle, Toast, Dot } from "./ui";
import { CATEGORIAS } from "@/lib/data";
import { sumCab, fmtDate, uid, flash } from "@/lib/utils";

export default function Lotes({ d, addRow, replaceLotes }) {
  const [sel, setSel] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [nf, setNf] = useState({ nombre: "", color: "#2563eb", categorias: [{ cat: "", cab: "" }] });
  const [msg, setMsg] = useState("");

  const addCR = () => setNf({ ...nf, categorias: [...nf.categorias, { cat: "", cab: "" }] });
  const updC = (i, k, v) => {
    const c = [...nf.categorias];
    c[i] = { ...c[i], [k]: k === "cab" ? parseInt(v) || 0 : v };
    setNf({ ...nf, categorias: c });
  };
  const rmC = (i) => { const c = [...nf.categorias]; c.splice(i, 1); setNf({ ...nf, categorias: c }); };

  const crear = async () => {
    if (!nf.nombre.trim()) { flash(setMsg, "Ingresá un nombre"); return; }
    const cats = nf.categorias.filter((c) => c.cat && c.cab > 0);
    if (!cats.length) { flash(setMsg, "Agregá al menos una categoría"); return; }
    await addRow("Lotes", {
      id: "L" + uid(),
      nombre: nf.nombre.trim(),
      color: nf.color,
      categorias_json: JSON.stringify(cats),
    });
    setNf({ nombre: "", color: "#2563eb", categorias: [{ cat: "", cab: "" }] });
    setShowNew(false);
    flash(setMsg, "Lote creado ✓");
  };

  // Detail
  if (sel) {
    const lote = d.lotes.find((l) => l.id === sel);
    if (!lote) { setSel(null); return null; }
    const movs = [...d.movimientos]
      .filter((m) => m.loteOrigenId === sel || m.loteDestinoId === sel)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    const rots = [...d.rotaciones]
      .filter((r) => r.loteId === sel)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    // Potreros donde está hoy
    const potsAhora = (() => {
      const map = {};
      rots.forEach((r) => {
        if (!map[r.pid] || new Date(r.fecha) > new Date(map[r.pid].f))
          map[r.pid] = { f: r.fecha, t: r.tipo };
      });
      return Object.entries(map)
        .filter(([, v]) => v.t === "entrada")
        .map(([pid]) => d.potreros.find((p) => p.id === pid))
        .filter(Boolean);
    })();

    return (
      <div>
        <button onClick={() => setSel(null)} className="text-campo-800 font-semibold text-sm py-3.5 flex items-center gap-1">
          ← Volver
        </button>
        <Card style={{ borderTop: `4px solid ${lote.color}` }}>
          <div className="font-display text-xl text-campo-800">{lote.nombre}</div>
          <div className="text-2xl font-bold my-2" style={{ color: lote.color }}>
            {sumCab(lote.categorias)} cab
          </div>
          {lote.categorias.map((c, i) => (
            <div key={i} className="text-[13px] text-gray-500">• {c.cat}: <b>{c.cab}</b></div>
          ))}
        </Card>

        {potsAhora.length > 0 && (
          <>
            <SectionTitle>Potreros donde está hoy</SectionTitle>
            {potsAhora.map((p) => (
              <Card key={p.id}>
                <span className="font-semibold">{p.nombre}</span>{" "}
                <span className="text-gray-500 text-xs">({p.ha} ha)</span>
              </Card>
            ))}
          </>
        )}

        <SectionTitle>Movimientos ({movs.length})</SectionTitle>
        {movs.length === 0 ? (
          <Card><div className="text-gray-400 text-center py-3 text-[13px]">Sin movimientos.</div></Card>
        ) : (
          movs.map((m, i) => {
            const esO = m.loteOrigenId === sel;
            const otro = esO
              ? d.lotes.find((l) => l.id === m.loteDestinoId)
              : d.lotes.find((l) => l.id === m.loteOrigenId);
            return (
              <Card key={i}>
                <div className="font-semibold text-[13px]">
                  {m.tipo} · {esO ? "−" : "+"}{m.cantidad} {m.categoria}
                </div>
                <div className="text-xs text-gray-500">
                  {fmtDate(m.fecha)} · {esO ? "Hacia" : "Desde"} {otro?.nombre || "externo"} · {m.motivo}
                </div>
              </Card>
            );
          })
        )}

        <SectionTitle>Rotaciones ({rots.length})</SectionTitle>
        {rots.length === 0 ? (
          <Card><div className="text-gray-400 text-center py-3 text-[13px]">Sin rotaciones.</div></Card>
        ) : (
          rots.map((r, i) => {
            const p = d.potreros.find((x) => x.id === r.pid);
            return (
              <Card key={i}>
                <div className="flex gap-2 items-center">
                  <Dot color={r.tipo === "entrada" ? "#059669" : "#ef4444"} />
                  <div>
                    <div className="font-semibold text-[13px]">
                      {r.tipo === "entrada" ? "Entrada" : "Salida"} – {p?.nombre}
                    </div>
                    <div className="text-xs text-gray-500">{fmtDate(r.fecha)}{r.nota ? ` · ${r.nota}` : ""}</div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    );
  }

  // List
  return (
    <div>
      <div className="flex justify-between items-center">
        <SectionTitle>Lotes ({d.lotes.length})</SectionTitle>
        <Btn onClick={() => setShowNew(!showNew)} v={showNew ? "s" : "p"} className="text-[13px] !py-2 !px-3.5">
          {showNew ? "Cancelar" : "+ Nuevo lote"}
        </Btn>
      </div>

      {showNew && (
        <Card className="!border-2 !border-dashed !border-campo-800">
          <div className="font-semibold text-campo-800 mb-2.5">Conformar nuevo lote</div>
          <div className="grid gap-2.5">
            <div className="grid grid-cols-[1fr_60px] gap-2">
              <div><Lbl>Nombre</Lbl><Inp value={nf.nombre} onChange={(v) => setNf({ ...nf, nombre: v })} placeholder="Ej: Lote 9 – Recría" /></div>
              <div><Lbl>Color</Lbl><input type="color" value={nf.color} onChange={(e) => setNf({ ...nf, color: e.target.value })} className="w-full h-[38px] border-none rounded-lg cursor-pointer" /></div>
            </div>
            <div className="font-semibold text-[13px] text-gray-700">Categorías:</div>
            {nf.categorias.map((c, i) => (
              <div key={i} className="grid grid-cols-[1fr_80px_32px] gap-1.5 items-end">
                <Sel value={c.cat} onChange={(v) => updC(i, "cat", v)}>
                  <option value="">Categoría…</option>
                  {CATEGORIAS.map((x) => <option key={x} value={x}>{x}</option>)}
                </Sel>
                <Inp type="number" value={c.cab || ""} onChange={(v) => updC(i, "cab", v)} placeholder="Cab" />
                {nf.categorias.length > 1 && (
                  <button onClick={() => rmC(i)} className="text-red-500 text-lg cursor-pointer bg-transparent border-none p-0">✕</button>
                )}
              </div>
            ))}
            <button onClick={addCR} className="bg-transparent border border-dashed border-gray-400 rounded-lg py-2 text-gray-500 cursor-pointer text-[13px]">
              + Agregar categoría
            </button>
            <Btn onClick={crear}>Crear lote</Btn>
            <Toast msg={msg} />
          </div>
        </Card>
      )}

      <Toast msg={msg} />

      {d.lotes.map((l) => (
        <Card key={l.id} style={{ borderLeft: `4px solid ${l.color}`, cursor: "pointer" }}>
          <div onClick={() => setSel(l.id)} className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-campo-800">{l.nombre}</div>
              <div className="text-xs text-gray-500">
                {sumCab(l.categorias)} cab · {l.categorias.map((c) => c.cat).join(", ")}
              </div>
            </div>
            <div className="text-gray-400 text-lg">›</div>
          </div>
        </Card>
      ))}
    </div>
  );
}
