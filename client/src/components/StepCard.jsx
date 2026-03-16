export default function StepCard({
  number,
  title,
  children,
  active,
  done,
  theme = "blue",
}) {
  const ring = {
    blue: {
      on: "border-blue-700/70",
      off: "border-gray-800",
      badge: done
        ? "bg-blue-500 text-white"
        : active
          ? "bg-blue-600/80 text-white ring-2 ring-blue-400/60"
          : "bg-gray-700 text-gray-400",
    },
    green: {
      on: "border-green-700/70",
      off: "border-gray-800",
      badge: done
        ? "bg-green-500 text-white"
        : active
          ? "bg-green-600/80 text-white ring-2 ring-green-400/60"
          : "bg-gray-700 text-gray-400",
    },
  };
  const t = ring[theme];
  return (
    <div
      className={`border rounded-xl p-4 transition-all duration-300 ${
        active || done ? t.on : t.off
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${t.badge}`}
        >
          {done ? "✓" : number}
        </div>
        <span className="font-semibold text-sm text-white">{title}</span>
      </div>
      <div
        className={
          !active && !done ? "opacity-40 pointer-events-none select-none" : ""
        }
      >
        {children}
      </div>
    </div>
  );
}
