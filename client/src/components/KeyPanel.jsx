import { Key, Unlock, Lock, RefreshCw } from "lucide-react";

export default function KeyPanel({
  keysGenerated,
  keysLoading,
  publicKey,
  privateKey,
  onGenerateKeys,
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-bold text-gray-900">
            0
          </div>
          <h2 className="font-bold text-base text-white">
            Tạo cặp khóa RSA (2048-bit)
          </h2>
        </div>
        <button
          onClick={onGenerateKeys}
          disabled={keysLoading}
          className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-gray-900 font-bold px-5 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors shadow"
        >
          {keysLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Key className="w-4 h-4" />
          )}
          {keysLoading ? "Đang tạo..." : "Tạo cặp khóa mới"}
        </button>
      </div>

      {keysGenerated ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-xl p-4 border border-blue-900/40">
            <div className="flex items-center gap-2 mb-2">
              <Unlock className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-blue-300 text-sm">
                Khóa công khai (Public Key)
              </span>
              <span className="ml-auto text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-full">
                Chia sẻ với Bob
              </span>
            </div>
            <textarea
              value={publicKey}
              readOnly
              rows={4}
              className="w-full bg-gray-950 text-xs font-mono text-gray-300 rounded-lg p-2.5 resize-none border border-gray-700 outline-none"
            />
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-red-900/40">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-red-400" />
              <span className="font-semibold text-red-300 text-sm">
                Khóa bí mật (Private Key)
              </span>
              <span className="ml-auto text-xs bg-red-900/50 text-red-300 px-2 py-0.5 rounded-full">
                Chỉ Alice giữ
              </span>
            </div>
            <textarea
              value={privateKey}
              readOnly
              rows={4}
              className="w-full bg-gray-950 text-xs font-mono text-gray-300 rounded-lg p-2.5 resize-none border border-gray-700 outline-none"
            />
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-gray-700 rounded-xl p-10 text-center">
          <Key className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            Nhấn <strong className="text-gray-400">"Tạo cặp khóa mới"</strong>{" "}
            để bắt đầu demo
          </p>
        </div>
      )}
    </div>
  );
}
