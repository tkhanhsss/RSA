import { FileText, Upload, Lock, RefreshCw } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import StepCard from "./StepCard";
import HashBox from "./HashBox";
import { truncate } from "../utils/truncate";

export default function AlicePanel() {
  const {
    keysGenerated,
    aliceFile,
    hashHA,
    signature,
    signLoading,
    fileInputRef,
    handleFileChange,
    signDocument,
  } = useAppContext();

  return (
    <div className="lg:col-span-5 bg-gray-900 border border-blue-900/40 rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center font-bold text-lg shadow">
          A
        </div>
        <div>
          <h2 className="font-bold text-blue-300 text-base">
            Alice — Người ký
          </h2>
          <p className="text-xs text-gray-500">
            Dùng Khóa bí mật để ký tài liệu
          </p>
        </div>
      </div>

      {/* Bước 1: Upload file */}
      <StepCard
        number="1"
        title="Upload file hợp đồng"
        active={keysGenerated}
        done={!!aliceFile}
        theme="blue"
      >
        <label
          className={`flex flex-col items-center gap-2 border-2 border-dashed rounded-xl p-5 cursor-pointer transition-colors ${
            aliceFile
              ? "border-blue-600 bg-blue-950/30"
              : "border-gray-700 hover:border-blue-700/60"
          }`}
        >
          <Upload
            className={`w-7 h-7 ${aliceFile ? "text-blue-400" : "text-gray-600"}`}
          />
          {aliceFile ? (
            <div className="text-center">
              <div className="flex items-center gap-1.5 text-blue-300 font-medium text-sm justify-center">
                <FileText className="w-4 h-4" />
                {aliceFile.name}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {(aliceFile.size / 1024).toFixed(2)} KB
              </div>
            </div>
          ) : (
            <span className="text-sm text-gray-500">
              Chọn file (.txt, .pdf, ...)
            </span>
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            disabled={!keysGenerated}
          />
        </label>
      </StepCard>

      {/* Bước 2: SHA-256 — H(M) */}
      <StepCard
        number="2"
        title="Băm tài liệu bằng SHA-256 → H(M)"
        active={!!aliceFile && !hashHA}
        done={!!hashHA}
        theme="blue"
      >
        {hashHA ? (
          <div className="space-y-1.5">
            <HashBox
              label="H(M) = SHA-256(file_hợp_đồng)"
              value={hashHA}
              colorClass="text-blue-300"
            />
            <p className="text-xs text-gray-500">256-bit · 64 ký tự hex</p>
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic">
            H(M) sẽ hiển thị sau khi nhấn ký tài liệu
          </p>
        )}
      </StepCard>

      {/* Bước 3: Ký tài liệu — Chữ ký số */}
      <StepCard
        number="3"
        title="Mã hóa H(M) bằng Khóa bí mật → Chữ ký"
        active={!!aliceFile && !signature}
        done={!!signature}
        theme="blue"
      >
        {!signature ? (
          <button
            onClick={signDocument}
            disabled={!aliceFile || !keysGenerated || signLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
          >
            {signLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Lock className="w-4 h-4" />
            )}
            {signLoading ? "Đang tạo chữ ký..." : "Ký tài liệu"}
          </button>
        ) : (
          <div className="space-y-2">
            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
              <div className="text-xs text-gray-400 font-mono mb-1.5">
                Chữ ký số (Digital Signature)
              </div>
              <p className="font-mono text-xs text-purple-300 break-all leading-relaxed">
                {truncate(signature, 48, 32)}
              </p>
              <p className="text-xs text-gray-600 mt-1.5">
                {signature.length / 2} bytes · RSA-2048
              </p>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-purple-400 flex-shrink-0" />
              Signature = RSA_Encrypt(H(M), PrivateKey_Alice)
            </p>
          </div>
        )}
      </StepCard>
    </div>
  );
}
