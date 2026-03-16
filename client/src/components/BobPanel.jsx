import {
  FileText,
  Unlock,
  AlertTriangle,
  Shield,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import StepCard from "./StepCard";
import HashBox from "./HashBox";
import { truncate } from "../utils/truncate";

export default function BobPanel() {
  const {
    transmitted,
    tampered,
    aliceFile,
    signature,
    hashHB,
    hashHARecovered,
    isValid,
    verifyLoading,
    verifySignature,
    resetDemo,
  } = useAppContext();

  return (
    <div className="lg:col-span-5 bg-gray-900 border border-green-900/40 rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center font-bold text-lg shadow">
          B
        </div>
        <div>
          <h2 className="font-bold text-green-300 text-base">
            Bob — Người xác minh
          </h2>
          <p className="text-xs text-gray-500">
            Dùng Khóa công khai để kiểm tra chữ ký
          </p>
        </div>
      </div>

      {/* Bước 1: Nhận file + chữ ký từ Alice */}
      <StepCard
        number="1"
        title="Nhận file hợp đồng + Chữ ký từ Alice"
        active={transmitted}
        done={transmitted}
        theme="green"
      >
        {transmitted ? (
          <div className="space-y-2">
            <div
              className={`bg-gray-800 rounded-lg p-3 flex items-center gap-2.5 border ${tampered ? "border-red-800/60" : "border-gray-700"}`}
            >
              <FileText
                className={`w-5 h-5 flex-shrink-0 ${tampered ? "text-red-400" : "text-green-400"}`}
              />
              <div>
                <p className="text-sm font-medium text-gray-200">
                  {aliceFile?.name}
                </p>
                {tampered ? (
                  <p className="text-xs text-red-400 flex items-center gap-1 mt-0.5">
                    <AlertTriangle className="w-3 h-3" /> File đã bị kẻ tấn công
                    sửa đổi!
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {(aliceFile?.size / 1024).toFixed(2)} KB · nguyên vẹn
                  </p>
                )}
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
              <div className="text-xs text-gray-400 font-mono mb-1">
                Chữ ký nhận được
              </div>
              <p className="font-mono text-xs text-purple-300 break-all">
                {truncate(signature, 32, 24)}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic">
            Chưa nhận được dữ liệu — Alice cần nhấn "Gửi"
          </p>
        )}
      </StepCard>

      {/* Bước 2: SHA-256 file nhận được → H(M') */}
      <StepCard
        number="2"
        title="Băm file nhận được bằng SHA-256 → H(M')"
        active={transmitted && !hashHB && isValid === null}
        done={!!hashHB}
        theme="green"
      >
        {hashHB ? (
          <div className="space-y-1.5">
            <HashBox
              label={`H(M') = SHA-256(file_nhận${tampered ? "_bị_sửa" : ""})`}
              value={hashHB}
              colorClass={tampered ? "text-red-300" : "text-green-300"}
            />
            {tampered && (
              <p className="text-xs text-red-400">
                ⚠️ Hash thay đổi vì nội dung file đã bị sửa
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic">
            H(M') sẽ hiển thị sau khi xác minh
          </p>
        )}
      </StepCard>

      {/* Bước 3: Giải mã chữ ký → H(M) gốc */}
      <StepCard
        number="3"
        title="Giải mã Chữ ký bằng Khóa công khai → H(M) gốc"
        active={transmitted && !hashHARecovered && isValid === null}
        done={!!hashHARecovered}
        theme="green"
      >
        {hashHARecovered ? (
          <div className="space-y-1.5">
            <HashBox
              label="H(M) = RSA_Decrypt(Signature, PublicKey_Alice)"
              value={hashHARecovered}
              colorClass="text-blue-300"
            />
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <Unlock className="w-3 h-3 text-green-400 flex-shrink-0" />
              Khôi phục H(M) gốc mà Alice đã tạo ra khi ký
            </p>
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic">
            H(M) gốc sẽ hiển thị sau khi xác minh
          </p>
        )}
      </StepCard>

      {/* Bước 4: So sánh H(M) và H(M') → kết luận */}
      <StepCard
        number="4"
        title="So sánh H(M) và H(M') → Kết luận"
        active={transmitted && isValid === null}
        done={isValid !== null}
        theme="green"
      >
        {isValid === null ? (
          <button
            onClick={verifySignature}
            disabled={!transmitted || verifyLoading}
            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
          >
            {verifyLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Shield className="w-4 h-4" />
            )}
            {verifyLoading ? "Đang xác minh..." : "Xác minh chữ ký"}
          </button>
        ) : (
          <div className="space-y-3">
            {/* Bảng so sánh H(M) vs H(M') */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-800 rounded-lg p-2.5 border border-blue-900/50">
                <div className="text-gray-400 mb-1 font-medium">
                  H(M) (từ chữ ký)
                </div>
                <div className="font-mono text-blue-300 break-all">
                  {truncate(hashHARecovered, 16, 0)}...
                </div>
              </div>
              <div
                className={`bg-gray-800 rounded-lg p-2.5 border ${isValid ? "border-green-900/50" : "border-red-900/50"}`}
              >
                <div className="text-gray-400 mb-1 font-medium">
                  H(M') (từ file)
                </div>
                <div
                  className={`font-mono break-all ${isValid ? "text-green-300" : "text-red-300"}`}
                >
                  {truncate(hashHB, 16, 0)}...
                </div>
              </div>
            </div>

            {/* Kết luận — hợp lệ hoặc không hợp lệ */}
            <div
              className={`rounded-xl p-5 text-center border-2 transition-all ${isValid ? "bg-green-950/40 border-green-600" : "bg-red-950/40 border-red-600"}`}
            >
              {isValid ? (
                <>
                  <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
                  <p className="font-bold text-green-300 text-lg font-mono">
                    H(M) = H(M')
                  </p>
                  <p className="text-green-300 font-bold text-base mt-1">
                    ✅ Chữ ký HỢP LỆ
                  </p>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    Tài liệu còn nguyên vẹn, xác nhận chắc chắn do Alice ký
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
                  <p className="font-bold text-red-300 text-lg font-mono">
                    H(M) ≠ H(M')
                  </p>
                  <p className="text-red-300 font-bold text-base mt-1">
                    ❌ Chữ ký KHÔNG HỢP LỆ
                  </p>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    Tài liệu đã bị thay đổi hoặc chữ ký không khớp với khóa công
                    khai
                  </p>
                </>
              )}
            </div>

            {/* Nút reset để thử lại */}
            <button
              onClick={resetDemo}
              className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Thử lại với file khác
            </button>
          </div>
        )}
      </StepCard>
    </div>
  );
}
