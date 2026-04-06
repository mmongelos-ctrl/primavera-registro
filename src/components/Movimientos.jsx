"use client";
import { useState, useMemo } from "react";
import { Card, Btn, Sel, Inp, Lbl, SectionTitle, Toast, Dot } from "./ui";
import { CATEGORIAS, MOTIVOS } from "@/lib/data";
import { sumCab, fmtDate, today, uid, flash } from "@/lib/utils";

export default function Movimientos({ d, addRow, replaceLotes }) {
  const [mode, setMode] = useState("rotacion");
  const [rf, setRf] = useState({ pid: "", loteId: "", tipo: "entrada", fecha: today(), nota: "" });
  const [mf, setMf] = useState({
    tipo: "TRANSFERENCIA", loteOrigenId: "", loteDestinoId: "",
    categoria: "", cantidad: "", fecha: today(), motivo: "Planificación", nota: "",
  });
  const [msg, setMsg] = useState("");

  const regRot = async () => {
    if (!rf.pid || !rf.loteId) { flash(setMsg, "Seleccioná potrero y lote"); return; }
    await addRow("Rotaciones", {
      id: "R" + uid(),
      fecha: rf.fecha,
      tipo: rf.tipo,
      pid: rf.pid,
      loteId: rf.loteId,
      nota: rf.nota,
      timestamp: new Date().toISOString(),
    });
    setRf({ pid: "", loteId: "", tipo: "entrada", fecha: today(), nota: "" });
    flash(setMsg, "Rotación registrada ✓");
  };

  const regMov = async () => {
    const cant = parseInt(mf.cantidad) || 0;
    if (cant <= 0) { flash(setMsg, "Ingresá cantidad > 0"); return; }
    if (mf.tipo === "TRANSFERENCIA" && (!mf.loteOrigenId || !mf.loteDestinoId)) { flash(setMsg, "Seleccioná origen y destino"); return; }
    if (mf.tipo === "ALTA" && !mf.loteDestinoId) { flash(setMsg, "Seleccioná lote destino"); return; }
    if (mf.tipo === "BAJA" && !mf.loteOrigenId) { flash(setMsg, "Seleccioná lote origen"); return; }
    if (!mf.categoria) { flash(setMsg, "Seleccioná categoría"); return; }

    // Update lotes stock
    const newLotes = d.lotes.map((l) => {
      let cats = l.categorias.map((c) => ({ ...c }));
      if (l.id === mf.loteOrigenId && (mf.tipo === "TRANSFERENCIA" || mf.tipo === "BAJA")) {
        const idx = cats.findIndex((c) => c.cat === mf.categoria);
        if (idx >= 0) cats[idx].cab = Math.max(0, cats[idx].cab - cant);
      }
      if (l.id === mf.loteDestinoId && (mf.tipo === "TRANSFERENCIA" || mf.tipo === "ALTA")) {
        const idx = cats.findIndex((c) => c.cat === mf.categoria);
        if (idx >= 0) cats[idx].cab += cant;
        else cats.push({ cat: mf.categoria, cab: cant });
      }
      return { ...l, categorias: cats.filter((c) => c.cab > 0) };
    });

    // Save movement row
    await addRow("Movimientos", {
      id: "M" + uid(),
      fecha: mf.fecha,
      tipo: mf.tipo,
      loteOrigenId: mf.loteOrigenId,
      loteDestinoId: mf.loteDestinoId,
      categoria: mf.categoria,
      cantidad: String(cant),
      motivo: mf.motivo,
      nota: mf.nota,
      timestamp: new Date().toISOString(),
    });

    // Update lotes sheet
    await replaceLotes(newLotes);

    setMf({
      tipo: "TRANSFERENCIA", loteOrigenId: "", loteDestinoId: "",
      categoria: "", cantidad: "", fecha: today(), motivo: "Planificación", nota: "",
    });
    flash(setMsg, "Movimiento registrado ✓ (stock actualizado)");
  };

  const catOrigen = useMemo(() => {
    if (!mf.loteOrigenId) return CATEGORIAS;
    const l = d.lotes.find((x) => x.id === mf.loteOrigenId);
    return l ? l.categorias.map((c) => c.cat) : CATEGORIAS;
  }, [mf.loteOrigenId, d.lotes]);

  // Timeline
  const timeline = useMemo(() => {
    return [
      ...d.rotaciones.map((r) => ({ ...r, _t: "rot", _d: r.fecha })),
      ...d.movimientos.map((m) => ({ ...m, _t: "mov", _d: m.fecha })),
    ].sort((a, b) => new Date(b._d) - new Date(a._d)).slice(0, 20);
  }, [d.rotaciones, d.movimientos]);

  return (
    <div>
      <div className="flex gap-1.5 my-3.5">
        <Btn onClick={() => setMode("rotacion")} v={mode === "rotacion" ? "p" : "s"} className="flex-1 text-[13px]">
          ↻ Rotación
        </Btn>
        <Btn onClick={() => setMode("mov")} v={mode === "mov" ? "p" : "s"} className="flex-1 text-[13px]">
          ⇄ Mov. Lote
        </Btn>
      </div>

      {mode === "rotacion" ? (
        <Card>
          <div className="font-semibold text-campo-800 mb-2.5">Entrada / Salida de potrero</div>
          <div className="grid gap-2.5">
            <div>
              <Lbl>Potrero</Lbl>
              <Sel value={rf.pid} onChange={(v) => setRf({ ...rf, pid: v })}>
                <option value="">Seleccionar…</option>
                {d.potreros.map((p) => <option key={p.id} value={p.id}>{p.nombre} ({p.ha} ha)</option>)}
              </Sel>
            </div>
            <div>
              <Lbl>Lote</Lbl>
              <Sel value={rf.loteId} onChange={(v) => setRf({ ...rf, loteId: v })}>
                <option value="">Seleccionar…</option>
                {d.lotes.map((l) => <option key={l.id} value={l.id}>{l.nombre} ({sumCab(l.categorias)} cab)</option>)}
              </Sel>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Lbl>Tipo</Lbl>
                <Sel value={rf.tipo} onChange={(v) => setRf({ ...rf, tipo: v })}>
                  <option value="entrada">Entrada</option>
                  <option value="salida">Salida</option>
                </Sel>
              </div>
              <div><Lbl>Fecha</Lbl><Inp type="date" value={rf.fecha} onChange={(v) => setRf({ ...rf, fecha: v })} /></div>
            </div>
            <div><Lbl>Nota</Lbl><Inp value={rf.nota} onChange={(v) => setRf({ ...rf, nota: v })} placeholder="Observación…" /></div>
            <Btn onClick={regRot}>Registrar rotación</Btn>
            <Toast msg={msg} />
          </div>
        </Card>
      ) : (
        <Card>
          <div className="font-semibold text-campo-800 mb-2.5">Movimiento entre lotes</div>
          <div className="grid gap-2.5">
            <div>
              <Lbl>Tipo</Lbl>
              <Sel value={mf.tipo} onChange={(v) => setMf({ ...mf, tipo: v })}>
                <option value="TRANSFERENCIA">Transferencia (entre lotes)</option>
                <option value="ALTA">Alta (nacimiento, compra)</option>
                <option value="BAJA">Baja (venta, muerte)</option>
              </Sel>
            </div>
            {(mf.tipo === "TRANSFERENCIA" || mf.tipo === "BAJA") && (
              <div>
                <Lbl>Lote Origen</Lbl>
                <Sel value={mf.loteOrigenId} onChange={(v) => setMf({ ...mf, loteOrigenId: v, categoria: "" })}>
                  <option value="">Seleccionar…</option>
                  {d.lotes.map((l) => <option key={l.id} value={l.id}>{l.nombre} ({sumCab(l.categorias)} cab)</option>)}
                </Sel>
              </div>
            )}
            {(mf.tipo === "TRANSFERENCIA" || mf.tipo === "ALTA") && (
              <div>
                <Lbl>Lote Destino</Lbl>
                <Sel value={mf.loteDestinoId} onChange={(v) => setMf({ ...mf, loteDestinoId: v })}>
                  <option value="">Seleccionar…</option>
                  {d.lotes.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                </Sel>
              </div>
            )}
            <div className="grid grid-cols-[1fr_80px] gap-2">
              <div>
                <Lbl>Categoría</Lbl>
                <Sel value={mf.categoria} onChange={(v) => setMf({ ...mf, categoria: v })}>
                  <option value="">Seleccionar…</option>
                  {(mf.tipo === "ALTA" ? CATEGORIAS : catOrigen).map((c) => <option key={c} value={c}>{c}</option>)}
                </Sel>
              </div>
              <div><Lbl>Cantidad</Lbl><Inp type="number" value={mf.cantidad} onChange={(v) => setMf({ ...mf, cantidad: v })} placeholder="0" /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Lbl>Fecha</Lbl><Inp type="date" value={mf.fecha} onChange={(v) => setMf({ ...mf, fecha: v })} /></div>
              <div>
                <Lbl>Motivo</Lbl>
                <Sel value={mf.motivo} onChange={(v) => setMf({ ...mf, motivo: v })}>
                  {MOTIVOS.map((m) => <option key={m} value={m}>{m}</option>)}
                </Sel>
              </div>
            </div>
            <div><Lbl>Nota</Lbl><Inp value={mf.nota} onChange={(v) => setMf({ ...mf, nota: v })} placeholder="Detalle…" /></div>
            <Btn onClick={regMov}>Registrar movimiento</Btn>
            <Toast msg={msg} />
          </div>
        </Card>
      )}

      <SectionTitle>Timeline</SectionTitle>
      {timeline.length === 0 ? (
        <Card><div className="text-gray-400 text-center py-4 text-[13px]">Sin registros aún.</div></Card>
      ) : (
        timeline.map((it, i) => {
          if (it._t === "rot") {
            const p = d.potreros.find((x) => x.id === it.pid);
            const l = d.lotes.find((x) => x.id === it.loteId);
            return (
              <Card key={i}>
                <div className="flex gap-2 items-center">
                  <Dot color={it.tipo === "entrada" ? "#059669" : "#ef4444"} />
                  <div>
                    <div className="font-semibold text-[13px]">Rotación: {it.tipo} – {p?.nombre}</div>
                    <div className="text-xs text-gray-500">{fmtDate(it.fecha)} · {l?.nombre}{it.nota ? ` · ${it.nota}` : ""}</div>
                  </div>
                </div>
              </Card>
            );
          } else {
            const lo = d.lotes.find((l) => l.id === it.loteOrigenId);
            const ld = d.lotes.find((l) => l.id === it.loteDestinoId);
            return (
              <Card key={i}>
                <div className="font-semibold text-[13px]">{it.tipo} · {it.cantidad} {it.categoria}</div>
                <div className="text-xs text-gray-500">{fmtDate(it.fecha)} · {lo?.nombre || "ext."} → {ld?.nombre || "ext."} · {it.motivo}</div>
              </Card>
            );
          }
        })
      )}
    </div>
  );
}
