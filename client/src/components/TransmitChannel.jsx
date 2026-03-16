import { Send, AlertTriangle, ChevronRight } from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function TransmitChannel() {
  const { signature, transmitted, tampered, sendToBob, handleToggleTamper } =
    useAppContext();

  return (
    <div className="lg:col-span-1 flex lg:flex-col items-center justify-center gap-3 px-2 py-4">
      <div className="text-center hidden lg:block">
        <p className="text-xs text-gray-600 leading-tight">Kênh</p>
        <p className="text-xs text-gray-600 leading-tight">truyền</p>
      </div>

      {/* Đường truyền — đổi màu khi đã gửi */}
      <div className="hidden lg:flex flex-col items-center gap-1">
        <div
          className={`w-px h-6 transition-colors duration-500 ${transmitted ? "bg-purple-500" : "bg-gray-700"}`}
        />
        <ChevronRight
          className={`w-5 h-5 transition-colors duration-500 rotate-90 lg:rotate-0 ${transmitted ? "text-purple-400" : "text-gray-700"}`}
        />
        <div
          className={`w-px h-6 transition-colors duration-500 ${transmitted ? "bg-purple-500" : "bg-gray-700"}`}
        />
      </div>

      {/* Nút Gửi */}
      <button
        onClick={sendToBob}
        disabled={!signature}
        className={`flex lg:flex-col items-center gap-1.5 font-bold py-2 px-3 rounded-xl text-xs transition-all shadow ${
          signature
            ? "bg-purple-600 hover:bg-purple-500 text-white"
            : "bg-gray-800 text-gray-600 cursor-not-allowed"
        }`}
      >
        <Send className="w-4 h-4" />
        <span>Gửi</span>
      </button>

      {/* Toggle giả lập tấn công MITM */}
      <div className="flex lg:flex-col items-center gap-1.5">
        <p className="text-xs text-gray-500 text-center leading-tight hidden lg:block">
          Giả lập
          <br />
          tấn công
        </p>
        <button
          onClick={handleToggleTamper}
          disabled={!signature}
          title="Bật để giả lập kẻ tấn công sửa nội dung file trước khi Bob nhận"
          className={`relative w-11 h-6 rounded-full transition-colors duration-300 disabled:opacity-30 focus:outline-none ${
            tampered ? "bg-red-600" : "bg-gray-700"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
              tampered ? "translate-x-5" : ""
            }`}
          />
        </button>
        {tampered && (
          <div className="text-xs text-red-400 flex items-center gap-0.5 cursor-default select-none bg-red-950/50 border border-red-800/40 rounded px-1.5 py-0.5 pointer-events-none">
            <AlertTriangle className="w-3 h-3" />
            <span>Sửa</span>
          </div>
        )}
      </div>
    </div>
  );
}
