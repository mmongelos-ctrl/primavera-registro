export default function Header() {
  return (
    <div className="bg-gradient-to-br from-campo-800 to-campo-700 px-4 py-4 flex items-center gap-3.5">
      <div className="w-11 h-11 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-white font-display text-lg">
        7P
      </div>
      <div>
        <div className="font-display text-xl text-white tracking-wide">Estancia Primavera</div>
        <div className="text-[11px] text-white/50 tracking-widest uppercase">7 Palmas · Registro de campo</div>
      </div>
    </div>
  );
}
