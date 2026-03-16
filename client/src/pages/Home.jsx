import { useState, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import Header from "../components/Header";
import KeyPanel from "../components/KeyPanel";
import AlicePanel from "../components/AlicePanel";
import TransmitChannel from "../components/TransmitChannel";
import BobPanel from "../components/BobPanel";

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

  function handleToggleTamper() {
    setTampered(!tampered);
    if (transmitted) {
      setTransmitted(false);
      setHashHB("");
      setHashHARecovered("");
      setIsValid(null);
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
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        <KeyPanel
          keysGenerated={keysGenerated}
          keysLoading={keysLoading}
          publicKey={publicKey}
          privateKey={privateKey}
          onGenerateKeys={generateKeys}
        />
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-4">
          <AlicePanel
            keysGenerated={keysGenerated}
            aliceFile={aliceFile}
            hashHA={hashHA}
            signature={signature}
            signLoading={signLoading}
            fileInputRef={fileInputRef}
            onFileChange={handleFileChange}
            onSign={signDocument}
          />
          <TransmitChannel
            signature={signature}
            transmitted={transmitted}
            tampered={tampered}
            onSend={sendToBob}
            onToggleTamper={handleToggleTamper}
          />
          <BobPanel
            transmitted={transmitted}
            tampered={tampered}
            aliceFile={aliceFile}
            signature={signature}
            hashHB={hashHB}
            hashHARecovered={hashHARecovered}
            isValid={isValid}
            verifyLoading={verifyLoading}
            onVerify={verifySignature}
            onReset={resetDemo}
          />
        </div>
      </div>
    </div>
  );
}
