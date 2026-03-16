import { Shield } from "lucide-react";

export default function Header() {
  return (
    <div className="bg-gradient-to-r from-blue-950 via-gray-900 to-green-950 border-b border-gray-800 px-6 py-5">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Demo Chữ Ký Số RSA
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Minh họa trực quan quy trình ký và xác minh tài liệu bằng RSA +
            SHA-256
          </p>
        </div>
      </div>
    </div>
  );
}
