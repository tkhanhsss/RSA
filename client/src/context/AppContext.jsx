/**
 * AppContext.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Quản lý toàn bộ state và business-logic của ứng dụng Demo Chữ Ký Số RSA.
 *
 * Cách dùng trong component con:
 *   import { useAppContext } from "../context/AppContext";
 *   const { publicKey, generateKeys, ... } = useAppContext();
 */

import { createContext, useContext, useRef, useState } from "react";
import toast from "react-hot-toast";

// ─── 1. Tạo Context ───────────────────────────────────────────────────────────
// createContext() tạo ra một "kênh" để truyền dữ liệu xuống toàn bộ cây UI
// mà không cần truyền props qua từng tầng component trung gian.
const AppContext = createContext(null);

// Địa chỉ gốc của API backend
const API = "/api/rsa";

// ─── 2. AppProvider ───────────────────────────────────────────────────────────
// Component "wrapper" — bọc toàn bộ ứng dụng trong main.jsx.
// Mọi component con bên trong đều có thể đọc dữ liệu từ context này.
export function AppProvider({ children }) {
  // ── State: Quản lý khóa ───────────────────────────────────────────────────
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [keysGenerated, setKeysGenerated] = useState(false);
  const [keysLoading, setKeysLoading] = useState(false);

  // ── State: Phía Alice (người ký) ──────────────────────────────────────────
  const [aliceFile, setAliceFile] = useState(null);    // File object đã chọn
  const [hashHA, setHashHA] = useState("");             // SHA-256 của file gốc
  const [signature, setSignature] = useState("");       // Chữ ký số dạng hex
  const [signLoading, setSignLoading] = useState(false);

  // ref để reset <input type="file"> về rỗng sau khi gọi resetDemo()
  const fileInputRef = useRef();

  // ── State: Kênh truyền ────────────────────────────────────────────────────
  const [transmitted, setTransmitted] = useState(false); // Alice đã nhấn "Gửi" chưa?
  const [tampered, setTampered] = useState(false);       // Toggle giả lập tấn công MITM

  // ── State: Phía Bob (người xác minh) ─────────────────────────────────────
  const [hashHB, setHashHB] = useState("");             // SHA-256 file Bob nhận được
  const [hashHARecovered, setHashHARecovered] = useState(""); // H_A giải mã từ chữ ký
  const [isValid, setIsValid] = useState(null);         // true | false | null
  const [verifyLoading, setVerifyLoading] = useState(false);

  // ─── Action: Reset về trạng thái ban đầu ──────────────────────────────────
  // Giữ nguyên khóa đã tạo, chỉ xóa dữ liệu file/ký/xác minh.
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

  // ─── Action: Tạo cặp khóa RSA-2048 ───────────────────────────────────────
  async function generateKeys() {
    setKeysLoading(true);
    resetDemo(); // Xóa demo cũ khi tạo khóa mới
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

  // ─── Action: Alice chọn file ──────────────────────────────────────────────
  // Khi chọn file mới, reset tất cả bước phía sau để tránh dữ liệu cũ.
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

  // ─── Action: Alice ký tài liệu ────────────────────────────────────────────
  // Gửi file + privateKey lên server → nhận về hashHA + signature (hex).
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

  // ─── Action: Gửi dữ liệu qua kênh truyền đến Bob ─────────────────────────
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

  // ─── Action: Bật/tắt giả lập tấn công man-in-the-middle ──────────────────
  // Khi toggle sau khi đã gửi, cần gửi lại để Bob nhận đúng trạng thái.
  function handleToggleTamper() {
    setTampered((prev) => !prev);
    if (transmitted) {
      setTransmitted(false);
      setHashHB("");
      setHashHARecovered("");
      setIsValid(null);
    }
  }

  // ─── Action: Bob xác minh chữ ký ─────────────────────────────────────────
  // Nếu tampered=true → thêm nội dung giả vào file → server trả isValid=false.
  async function verifySignature() {
    if (!transmitted || !signature || !publicKey || !aliceFile) return;
    setVerifyLoading(true);
    try {
      // Giả lập kẻ tấn công chèn nội dung vào file trước khi Bob nhận
      let fileToSend = aliceFile;
      if (tampered) {
        const buf = await aliceFile.arrayBuffer();
        const blob = new Blob(
          [buf, new TextEncoder().encode("\n[NỘI DUNG ĐÃ BỊ KẺ TẤN CÔNG SỬA ĐỔI!]")],
          { type: aliceFile.type }
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

  // ─── Giá trị cung cấp cho toàn bộ cây component ──────────────────────────
  const value = {
    // --- State: Khóa ---
    publicKey,
    privateKey,
    keysGenerated,
    keysLoading,
    // --- State: Alice ---
    aliceFile,
    hashHA,
    signature,
    signLoading,
    fileInputRef,
    // --- State: Kênh truyền ---
    transmitted,
    tampered,
    // --- State: Bob ---
    hashHB,
    hashHARecovered,
    isValid,
    verifyLoading,
    // --- Actions ---
    generateKeys,
    handleFileChange,
    signDocument,
    sendToBob,
    handleToggleTamper,
    verifySignature,
    resetDemo,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ─── 3. Custom Hook: useAppContext() ──────────────────────────────────────────
// Dùng hook này trong bất kỳ component con nào để lấy state và action.
// Bắt lỗi ngay nếu component được dùng ngoài <AppProvider>.
export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext phải được dùng bên trong <AppProvider>");
  }
  return ctx;
}
