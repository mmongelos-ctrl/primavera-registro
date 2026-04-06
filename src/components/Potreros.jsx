"use client";
import { useState, useMemo, useRef } from "react";
import { Card, Btn, Inp, Lbl, SectionTitle, Toast, Badge, Dot } from "./ui";
import { fmtDate, today, uid, flash, getEstadoPot } from "@/lib/utils";

export default function Potreros({ d, addRow }) {
  const [sel, setSel] = useState(null);
  const [filter, setFilter] = useState("todos");
  const [bf, setBf] = useState({ kgMsHa: "", fecha: today(), nota: "", foto: "" });
  const [msg, setMsg] = useState("");
  const fileRef = useRef();

  const zonas = useMemo(() => [...new Set(d.potreros.map((p) => p.zona))], [d]);
  const filtered = filter === "todos" ? d.potreros : d.potreros.filter((p) => p.zona === filter);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const mx = 600;
        let w = img.width, h = img.height;
        if (w > mx) { h *= mx / w; w = mx; }
        if (h > mx) { w *= mx / h; h = mx; }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        setBf((f) => ({ ...f, foto: canvas.toDataURL("image/jpeg", 0.7) }));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const regBio = async () => {
    if (!bf.kgMsHa) { flash(setMsg, "Ingresá Kg MS/Ha"); return; }
    await addRow("Biomasa", {
      id: "B" + uid(),
      fecha: bf.fecha,
      pid: sel,
      kgMsHa: bf.kgMsHa,
      nota: bf.nota,
      fotoUrl: bf.foto,
      timestamp: new Date().toISOString(),
    });
    setBf({ kgMsHa: "", fecha: today(), nota: "", foto: "" });
    flash(setMsg, "Biomasa registrada ✓");
  };

  // Detail
  if (sel) {
    const pot = d.potreros.find((p) => p.id === sel);
    if (!pot) { setSel(null); return null; }
    const { enUso, diasDesc, lote, hist } = getEstadoPot(d.rotaciones, d.potreros, d.lotes, pot.id);
    const bios = [...d.biomasa].filter((b) => b.pid === sel).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    const lastBio = bios[0];

    return (
      <div>
        <button onClick={() => { setSel(null); setBf({ kgMsHa: "", fecha: today(), nota: "", foto: "" }); }}
          className="text-campo-800 font-semibold text-sm py-3.5 flex items-center gap-1">← Volver</button>

        <Card>
          <div className="flex justify-between items-start">
            <div>
              <div className="font-display text-xl text-campo-800">{pot.nombre}</div>
              <div className="text-gray-500 text-[13px] mt-0.5">{pot.zona} · {pot.ha} ha</div>
            </div>
            <div className="text-right">
              {enUso ? <Badge color="#059669">EN USO</Badge> : <Badge color="#9ca3af">DESCANSANDO</Badge>}
              {diasDesc != null && <div className="text-xs text-gray-500 mt-1">{diasDesc} días</div>}
            </div>
          </div>
          {lote && enUso && (
            <div className="mt-2.5 p-2 rounded-lg" style={{ background: `${lote.color}10`, borderLeft: `4px solid ${lote.color}` }}>
              <div className="text-xs text-gray-500">Lote presente</div>
              <div className="font-semibold" style={{ color: lote.color }}>{lote.nombre}</div>
            </div>
          )}
          {lastBio && (
            <div className="mt-2.5 p-2 bg-green-50 rounded-lg">
              <div className="text-xs text-gray-500">Última biomasa ({fmtDate(lastBio.fecha)})</div>
              <div className="font-bold text-green-600 text-lg">{lastBio.kgMsHa} Kg MS/Ha</div>
            </div>
          )}
        </Card>

        <SectionTitle>Registrar Biomasa</SectionTitle>
        <Card>
          <div className="grid gap-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div><Lbl>Kg MS/Ha</Lbl><Inp type="number" value={bf.kgMsHa} onChange={(v) => setBf({ ...bf, kgMsHa: v })} placeholder="800" /></div>
              <div><Lbl>Fecha</Lbl><Inp type="date" value={bf.fecha} onChange={(v) => setBf({ ...bf, fecha: v })} /></div>
            </div>
            <div><Lbl>Nota</Lbl><Inp value={bf.nota} onChange={(v) => setBf({ ...bf, nota: v })} placeholder="Observación…" /></div>
            <div>
              <Lbl>Foto (opcional)</Lbl>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
              <div className="flex gap-2 items-center">
                <Btn onClick={() => fileRef.current.click()} v="s" className="text-[13px] !py-2 !px-3">
                  📷 {bf.foto ? "Cambiar" : "Agregar"} foto
                </Btn>
                {bf.foto && <img src={bf.foto} className="w-12 h-12 rounded-lg object-cover" alt="" />}
              </div>
            </div>
            <Btn onClick={regBio}>Registrar biomasa</Btn>
            <Toast msg={msg} />
          </div>
        </Card>

        <SectionTitle>Historial de biomasa ({bios.length})</SectionTitle>
        {bios.length === 0 ? (
          <Card><div className="text-gray-400 text-center py-3 text-[13px]">Sin registros.</div></Card>
        ) : (
          bios.map((b, i) => (
            <Card key={i}>
              <div className="flex gap-2.5 items-start">
                {b.fotoUrl && <img src={b.fotoUrl} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" alt="" />}
                <div>
                  <div className="font-bold text-green-600 text-base">{b.kgMsHa} Kg MS/Ha</div>
                  <div className="text-xs text-gray-500">{fmtDate(b.fecha)}{b.nota ? ` · ${b.nota}` : ""}</div>
                </div>
              </div>
            </Card>
          ))
        )}

        <SectionTitle>Historial de uso ({hist.length})</SectionTitle>
        {hist.length === 0 ? (
          <Card><div className="text-gray-400 text-center py-3 text-[13px]">Sin rotaciones.</div></Card>
        ) : (
          hist.map((r, i) => {
            const lt = d.lotes.find((l) => l.id === r.loteId);
            return (
              <Card key={i}>
                <div className="flex gap-2 items-center">
                  <Dot color={r.tipo === "entrada" ? "#059669" : "#ef4444"} />
                  <div>
                    <div className="font-semibold text-[13px]">{r.tipo === "entrada" ? "Entrada" : "Salida"} – {lt?.nombre || "?"}</div>
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
  const totalHa = filtered.reduce((s, p) => s + p.ha, 0);
  return (
    <div>
      <SectionTitle>Potreros ({filtered.length}) · {totalHa.toFixed(1)} ha</SectionTitle>
      <div className="flex gap-1.5 flex-wrap mb-3.5">
        {["todos", ...zonas].map((z) => (
          <button key={z} onClick={() => setFilter(z)}
            className={`px-3 py-1 rounded-full text-[11px] font-medium cursor-pointer font-sans ${
              filter === z
                ? "bg-campo-800 text-white border-2 border-campo-800"
                : "bg-white text-gray-700 border border-gray-300"
            }`}
          >
            {z === "todos" ? "Todos" : z}
          </button>
        ))}
      </div>
      {filtered.map((p) => {
        const { enUso, lote } = getEstadoPot(d.rotaciones, d.potreros, d.lotes, p.id);
        const lb = [...d.biomasa].filter((b) => b.pid === p.id).sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];
        return (
          <Card key={p.id} style={{ cursor: "pointer" }}>
            <div onClick={() => setSel(p.id)} className="flex justify-between items-center">
              <div>
                <div className="font-semibold text-campo-800">{p.nombre}</div>
                <div className="text-xs text-gray-500">
                  {p.ha} ha{lote && enUso ? ` · ${lote.nombre}` : ""}{lb ? ` · ${lb.kgMsHa} KgMS/Ha` : ""}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {enUso
                  ? <div className="w-2.5 h-2.5 rounded-full bg-green-600" />
                  : <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />}
                <div className="text-gray-400 text-lg">›</div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
