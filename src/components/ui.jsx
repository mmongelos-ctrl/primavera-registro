export function Card({ children, className = "", style }) {
  return (
    <div className={`bg-white rounded-xl p-4 mb-2.5 shadow-sm ${className}`} style={style}>
      {children}
    </div>
  );
}

export function Badge({ color, children }) {
  return (
    <span
      className="inline-block text-white rounded-md px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: color || "#e5e7eb" }}
    >
      {children}
    </span>
  );
}

export function Btn({ onClick, children, v = "p", className = "", disabled }) {
  const base = "border-none rounded-lg px-4 py-2.5 font-semibold font-sans text-sm transition-all";
  const variant =
    v === "p"
      ? "bg-campo-800 text-white"
      : v === "d"
      ? "bg-red-50 text-red-600"
      : "bg-gray-100 text-gray-700";
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`${base} ${variant} ${disabled ? "opacity-50 cursor-default" : "cursor-pointer"} ${className}`}
    >
      {children}
    </button>
  );
}

export function Sel({ value, onChange, children, className = "" }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`border border-gray-300 rounded-lg px-3 py-2 font-sans text-sm bg-white w-full box-border ${className}`}
    >
      {children}
    </select>
  );
}

export function Inp({ value, onChange, placeholder, type = "text", className = "" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`border border-gray-300 rounded-lg px-3 py-2 font-sans text-sm w-full box-border ${className}`}
    />
  );
}

export function Lbl({ children }) {
  return <div className="text-xs text-gray-500 font-medium mb-0.5">{children}</div>;
}

export function SectionTitle({ children }) {
  return <div className="font-display text-lg text-campo-800 mt-5 mb-2.5">{children}</div>;
}

export function Toast({ msg }) {
  if (!msg) return null;
  return <div className="text-center text-green-600 font-semibold text-sm py-1.5">{msg}</div>;
}

export function Dot({ color }) {
  return (
    <div
      className="w-2 h-2 rounded-full flex-shrink-0"
      style={{ background: color }}
    />
  );
}
