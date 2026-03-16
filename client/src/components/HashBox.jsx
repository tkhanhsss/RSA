export default function HashBox({
  label,
  value,
  colorClass = "text-blue-300",
}) {
  return (
    <div className="bg-gray-800/80 rounded-lg p-3 border border-gray-700">
      <div className="text-xs text-gray-400 font-mono mb-1.5">{label}</div>
      <p
        className={`font-mono text-xs break-all leading-relaxed tracking-wide ${colorClass}`}
      >
        {value || (
          <span className="text-gray-600 italic not-italic">
            chưa có giá trị
          </span>
        )}
      </p>
    </div>
  );
}
