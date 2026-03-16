import { useState, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  Key,
  FileText,
  Shield,
  Send,
  CheckCircle,
  XCircle,
  Upload,
  Lock,
  Unlock,
  AlertTriangle,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import HashBox from "../components/HashBox";
import StepCard from "../components/StepCard";
import { truncate } from "../utils/truncate";

const API = "/api/rsa";

export default function Home() {
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [keysGenerated, setKeysGenerated] = useState(false);
  const [keysLoading, setKeysLoading] = useState(false);

  const [aliceFile, setAliceFile] = useState(null);
  const [hashHA, setHashHA] = useState("");
  const [signature, setSignature] = useState("");
  const [signLoading, setSignLoading] = useState(false);
  const fileInputRef = useRef();

  const [transmitted, setTransmitted] = useState(false);
  const [tampered, setTampered] = useState(false);

  const [hashHB, setHashHB] = useState("");
  const [hashHARecovered, setHashHARecovered] = useState("");
  const [isValid, setIsValid] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  function resetDemo() {
    setAliceFile(null);
    setHashHA("");
    setSignature("");
    setTransmitted(false);
    setTampered(false);
    setHashHB("");
    setHashHARecovered("");
    setIsValid(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function generateKeys() {
    setKeysLoading(true);
    resetDemo();
    try {
      const res = await fetch(`${API}/generate-keys`, { method: "POST" });
      const data = await res.json();
      setPublicKey(data.publicKey);
      setPrivateKey(data.privateKey);
      setKeysGenerated(true);
      toast.success("Tạo cặp khóa RSA 2048-bit thành công!");
    } catch {
      toast.error("Lỗi khi tạo khóa!");
    } finally {
      setKeysLoading(false);
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setAliceFile(file);
    setHashHA("");
    setSignature("");
    setTransmitted(false);
    setHashHB("");
    setHashHARecovered("");
    setIsValid(null);
    toast.success(`Đã chọn: ${file.name}`);
  }

  async function signDocument() {
    if (!aliceFile || !privateKey) return;
    setSignLoading(true);
    try {
      const form = new FormData();
      form.append("file", aliceFile);
      form.append("privateKey", privateKey);
      const res = await fetch(`${API}/sign`, { method: "POST", body: form });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setHashHA(data.hashHA);
      setSignature(data.signature);
      toast.success("Tạo chữ ký số thành công!");
    } catch {
      toast.error("Lỗi khi ký tài liệu!");
    } finally {
      setSignLoading(false);
    }
  }

  function sendToBob() {
    if (!signature || !aliceFile) return;
    setTransmitted(true);
    setHashHB("");
    setHashHARecovered("");
    setIsValid(null);
    if (tampered) {
      toast("⚠️ Dữ liệu đã bị giả mạo — gửi đến Bob!", { icon: "🔴" });
    } else {
      toast.success("📨 Gửi tài liệu + chữ ký đến Bob thành công!");
    }
  }

  async function verifySignature() {
    if (!transmitted || !signature || !publicKey || !aliceFile) return;
    setVerifyLoading(true);
    try {
      let fileToSend = aliceFile;
      if (tampered) {
        const buf = await aliceFile.arrayBuffer();
        const blob = new Blob(
          [
            buf,
            new TextEncoder().encode("\n[NỘI DUNG ĐÃ BỊ KẺ TẤN CÔNG SỬA ĐỔI!]"),
          ],
          { type: aliceFile.type },
        );
        fileToSend = new File([blob], aliceFile.name, { type: aliceFile.type });
      }
      const form = new FormData();
      form.append("file", fileToSend);
      form.append("publicKey", publicKey);
      form.append("signature", signature);
      const res = await fetch(`${API}/verify`, { method: "POST", body: form });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setHashHB(data.hashHB);
      setHashHARecovered(data.hashHARecovered ?? "Không thể giải mã");
      setIsValid(data.isValid);
      if (data.isValid) {
        toast.success("✅ Chữ ký HỢP LỆ — tài liệu nguyên vẹn!");
      } else {
        toast.error("❌ Chữ ký KHÔNG HỢP LỆ — tài liệu bị sửa đổi!");
      }
    } catch {
      toast.error("Lỗi khi xác minh chữ ký!");
    } finally {
      setVerifyLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
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

      {/* ── Header ── */}
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

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        {/* ── Bước 0: Tạo khóa ── */}
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
              onClick={generateKeys}
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
                Nhấn{" "}
                <strong className="text-gray-400">"Tạo cặp khóa mới"</strong> để
                bắt đầu demo
              </p>
            </div>
          )}
        </div>

        {/* ── Khu vực demo chính ── */}
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-4">
          {/* ──── Alice ──── */}
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

            {/* Alice Step 1 */}
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

            {/* Alice Step 2 */}
            <StepCard
              number="2"
              title="Băm tài liệu bằng SHA-256 → H_A"
              active={!!aliceFile && !hashHA}
              done={!!hashHA}
              theme="blue"
            >
              {hashHA ? (
                <div className="space-y-1.5">
                  <HashBox
                    label="H_A = SHA-256(file_hợp_đồng)"
                    value={hashHA}
                    colorClass="text-blue-300"
                  />
                  <p className="text-xs text-gray-500">
                    256-bit · 64 ký tự hex · duy nhất cho nội dung này
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">
                  H_A sẽ hiển thị sau khi nhấn ký tài liệu
                </p>
              )}
            </StepCard>

            {/* Alice Step 3 */}
            <StepCard
              number="3"
              title="Mã hóa H_A bằng Khóa bí mật → Chữ ký"
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
                    Signature = RSA_Encrypt(H_A, PrivateKey_Alice)
                  </p>
                </div>
              )}
            </StepCard>
          </div>

          {/* ──── Kênh truyền ──── */}
          <div className="lg:col-span-1 flex lg:flex-col items-center justify-center gap-3 px-2 py-4">
            <div className="text-center hidden lg:block">
              <p className="text-xs text-gray-600 leading-tight">Kênh</p>
              <p className="text-xs text-gray-600 leading-tight">truyền</p>
            </div>

            <div className="hidden lg:flex flex-col items-center gap-1">
              <div
                className={`w-px h-6 transition-colors duration-500 ${
                  transmitted ? "bg-purple-500" : "bg-gray-700"
                }`}
              />
              <ChevronRight
                className={`w-5 h-5 transition-colors duration-500 rotate-90 lg:rotate-0 ${
                  transmitted ? "text-purple-400" : "text-gray-700"
                }`}
              />
              <div
                className={`w-px h-6 transition-colors duration-500 ${
                  transmitted ? "bg-purple-500" : "bg-gray-700"
                }`}
              />
            </div>

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

            {/* Tamper toggle */}
            <div className="flex lg:flex-col items-center gap-1.5">
              <p className="text-xs text-gray-500 text-center leading-tight hidden lg:block">
                Giả lập
                <br />
                tấn công
              </p>
              <button
                onClick={() => {
                  setTampered(!tampered);
                  if (transmitted) {
                    setTransmitted(false);
                    setHashHB("");
                    setHashHARecovered("");
                    setIsValid(null);
                  }
                }}
                disabled={!signature}
                title="Bật để giả lập kẻ tấn công sửa nội dung file trước khi Bob nhận"
                className={`relative w-11 h-6 rounded-full transition-colors duration-300 disabled:opacity-30 focus:outline-none ${
                  tampered ? "bg-red-600" : "bg-gray-700"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                    tampered ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
              {tampered && (
                <div className="text-xs text-red-400 flex items-center gap-0.5">
                  <AlertTriangle className="w-3 h-3" />
                  Sửa
                </div>
              )}
            </div>
          </div>

          {/* ──── Bob ──── */}
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

            {/* Bob Step 1 */}
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
                    className={`bg-gray-800 rounded-lg p-3 flex items-center gap-2.5 border ${
                      tampered ? "border-red-800/60" : "border-gray-700"
                    }`}
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
                          <AlertTriangle className="w-3 h-3" /> File đã bị kẻ
                          tấn công sửa đổi!
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

            {/* Bob Step 2 */}
            <StepCard
              number="2"
              title="Băm file nhận được bằng SHA-256 → H_B"
              active={transmitted && !hashHB && isValid === null}
              done={!!hashHB}
              theme="green"
            >
              {hashHB ? (
                <div className="space-y-1.5">
                  <HashBox
                    label={`H_B = SHA-256(file_nhận${tampered ? "_bị_sửa" : ""})`}
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
                  H_B sẽ hiển thị sau khi xác minh
                </p>
              )}
            </StepCard>

            {/* Bob Step 3 */}
            <StepCard
              number="3"
              title="Giải mã Chữ ký bằng Khóa công khai → H_A gốc"
              active={transmitted && !hashHARecovered && isValid === null}
              done={!!hashHARecovered}
              theme="green"
            >
              {hashHARecovered ? (
                <div className="space-y-1.5">
                  <HashBox
                    label="H_A = RSA_Decrypt(Signature, PublicKey_Alice)"
                    value={hashHARecovered}
                    colorClass="text-blue-300"
                  />
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Unlock className="w-3 h-3 text-green-400 flex-shrink-0" />
                    Khôi phục H_A gốc mà Alice đã tạo ra khi ký
                  </p>
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">
                  H_A gốc sẽ hiển thị sau khi xác minh
                </p>
              )}
            </StepCard>

            {/* Bob Step 4 */}
            <StepCard
              number="4"
              title="So sánh H_A và H_B → Kết luận"
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
                  {/* So sánh song song */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-800 rounded-lg p-2.5 border border-blue-900/50">
                      <div className="text-gray-400 mb-1 font-medium">
                        H_A (từ chữ ký)
                      </div>
                      <div className="font-mono text-blue-300 break-all">
                        {truncate(hashHARecovered, 16, 0)}...
                      </div>
                    </div>
                    <div
                      className={`bg-gray-800 rounded-lg p-2.5 border ${
                        isValid ? "border-green-900/50" : "border-red-900/50"
                      }`}
                    >
                      <div className="text-gray-400 mb-1 font-medium">
                        H_B (từ file)
                      </div>
                      <div
                        className={`font-mono break-all ${
                          isValid ? "text-green-300" : "text-red-300"
                        }`}
                      >
                        {truncate(hashHB, 16, 0)}...
                      </div>
                    </div>
                  </div>

                  {/* Kết quả */}
                  <div
                    className={`rounded-xl p-5 text-center border-2 transition-all ${
                      isValid
                        ? "bg-green-950/40 border-green-600"
                        : "bg-red-950/40 border-red-600"
                    }`}
                  >
                    {isValid ? (
                      <>
                        <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
                        <p className="font-bold text-green-300 text-lg font-mono">
                          H_A = H_B
                        </p>
                        <p className="text-green-300 font-bold text-base mt-1">
                          ✅ Chữ ký HỢP LỆ
                        </p>
                        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                          Tài liệu còn nguyên vẹn, xác nhận chắc chắn do Alice
                          ký
                        </p>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
                        <p className="font-bold text-red-300 text-lg font-mono">
                          H_A ≠ H_B
                        </p>
                        <p className="text-red-300 font-bold text-base mt-1">
                          ❌ Chữ ký KHÔNG HỢP LỆ
                        </p>
                        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                          Tài liệu đã bị thay đổi hoặc chữ ký không khớp với
                          khóa công khai
                        </p>
                      </>
                    )}
                  </div>

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
        </div>

        {/* ── Ghi chú kỹ thuật ── */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="font-semibold text-gray-300 text-sm mb-2">
            📐 Ghi chú kỹ thuật
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-xs text-gray-500 font-mono">
            <span>• Thuật toán: RSA-2048, padding PKCS#1 v1.5</span>
            <span>• Hàm băm: SHA-256 → 256-bit (64 hex chars)</span>
            <span>
              • Ký:&nbsp;&nbsp;&nbsp;&nbsp; Signature = PrivateKey( SHA256(file)
              )
            </span>
            <span>
              • Xác minh: H_A = PublicKey(Signature); so sánh H_A vs
              SHA256(file)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
