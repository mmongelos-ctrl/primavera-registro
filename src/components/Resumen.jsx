"use client";
import { useMemo } from "react";
import { Card, SectionTitle } from "./ui";
import { sumCab, fmtDate, today, getEstadoPot } from "@/lib/utils";

export default function Resumen({ d }) {
  const totalCab = d.lotes.reduce((s, l) => s + sumCab(l.categorias), 0);
  const totalHa = d.potreros.reduce((s, p) => s + p.ha, 0);

  const enUso = useMemo(() => {
    let c = 0;
    d.potreros.forEach((p) => {
      if (getEstadoPot(d.rotaciones, d.potreros, d.lotes, p.id).enUso) c++;
    });
    return c;
  }, [d]);

  const ultMov = useMemo(
    () => [...d.movimientos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 8),
    [d.movimientos]
  );

  return (
    <div>
      <SectionTitle>Hoy – {fmtDate(today())}</SectionTitle>

      <div className="grid grid-cols-2 gap-2.5">
        <Card className="text-center">
          <div className="text-2xl font-bold text-campo-800">{totalCab}</div>
          <div className="text-[11px] text-gray-500">Cabezas</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-campo-700">{totalHa.toFixed(0)}</div>
          <div className="text-[11px] text-gray-500">Ha útiles</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-amber-600">{d.lotes.length}</div>
          <div className="text-[11px] text-gray-500">Lotes activos</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-purple-600">{enUso}</div>
          <div className="text-[11px] text-gray-500">Potreros en uso</div>
        </Card>
      </div>

      <SectionTitle>Existencias por lote</SectionTitle>
      {d.lotes.map((l) => {
        const cab = sumCab(l.categorias);
        const pct = totalCab > 0 ? ((cab / totalCab) * 100).toFixed(0) : 0;
        return (
          <Card key={l.id} style={{ borderLeft: `4px solid ${l.color}` }}>
            <div className="flex justify-between mb-1">
              <div className="font-semibold text-[13px] text-campo-800">{l.nombre}</div>
              <div className="text-[13px] font-semibold" style={{ color: l.color }}>{cab} cab</div>
            </div>
            <div className="text-[11px] text-gray-400 mb-1">
              {l.categorias.map((c) => `${c.cat} (${c.cab})`).join(" · ")}
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full">
              <div className="h-1.5 rounded-full" style={{ background: l.color, width: `${pct}%` }} />
            </div>
          </Card>
        );
      })}

      <SectionTitle>Últimos movimientos</SectionTitle>
      {ultMov.length === 0 ? (
        <Card><div className="text-gray-400 text-center py-4 text-[13px]">Sin movimientos aún.</div></Card>
      ) : (
        ultMov.map((m, i) => {
          const lo = d.lotes.find((l) => l.id === m.loteOrigenId);
          const ld = d.lotes.find((l) => l.id === m.loteDestinoId);
          const icon = m.tipo === "ALTA" ? "🟢" : m.tipo === "BAJA" ? "🔴" : "→";
          return (
            <Card key={i}>
              <div className="font-semibold text-[13px]">
                {icon} {m.tipo} · {m.cantidad} {m.categoria}
              </div>
              <div className="text-xs text-gray-500">
                {fmtDate(m.fecha)} · {lo?.nombre || "ext."} → {ld?.nombre || "ext."} · {m.motivo}
              </div>
            </Card>
          );
        })
      )}

      <div className="text-center mt-8 text-[11px] text-gray-400">
        Datos base: Plan Abierto Sep 2025 · 1.594,9 ha · 1.370 cab
        <br />
        Desarrollado por De Raíz para 7 Palmas
      </div>
    </div>
  );
}
