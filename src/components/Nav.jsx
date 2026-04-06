const tabs = [
  { k: "resumen", l: "Resumen", i: "▦" },
  { k: "lotes", l: "Lotes", i: "◈" },
  { k: "potreros", l: "Potreros", i: "◻" },
  { k: "mov", l: "Mov.", i: "⇄" },
];

export default function Nav({ tab, set }) {
  return (
    <div className="flex bg-white border-b border-[#e0d8cf] sticky top-0 z-50">
      {tabs.map((t) => (
        <button
          key={t.k}
          onClick={() => set(t.k)}
          className={`flex-1 min-w-0 py-2.5 px-1 text-[11px] font-sans transition-all border-b-[3px] ${
            tab === t.k
              ? "border-campo-800 text-campo-800 font-semibold"
              : "border-transparent text-gray-400"
          }`}
        >
          <div className="text-base mb-0.5">{t.i}</div>
          {t.l}
        </button>
      ))}
    </div>
  );
}
