import { Toaster } from "react-hot-toast";
import Header from "../components/Header";
import KeyPanel from "../components/KeyPanel";
import AlicePanel from "../components/AlicePanel";
import TransmitChannel from "../components/TransmitChannel";
import BobPanel from "../components/BobPanel";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Notification toasts — hiển thị góc trên bên phải */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1f2937",
            color: "#f9fafb",
            border: "1px solid #374151",
          },
        }}
      />

      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        {/* Bước 0: Tạo cặp khóa RSA */}
        <KeyPanel />

        {/* Bước 1-4: Alice ký → Kênh truyền → Bob xác minh */}
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-4">
          <AlicePanel />
          <TransmitChannel />
          <BobPanel />
        </div>
      </div>
    </div>
  );
}
