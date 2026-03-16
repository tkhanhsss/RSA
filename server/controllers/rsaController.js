import {
  generateKeyPairSync,
  createHash,
  privateEncrypt,
  publicDecrypt,
  constants,
} from "crypto";

export const generateKeys = (_req, res) => {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  res.json({ publicKey, privateKey });
};

export const signFile = (req, res) => {
  try {
    const { privateKey } = req.body;
    const fileBuffer = req.file.buffer;

    // Bước 1: Băm file bằng SHA-256 → H_A
    const hashBuffer = createHash("sha256").update(fileBuffer).digest();
    const hashHA = hashBuffer.toString("hex");

    // Bước 2: Mã hóa H_A bằng Khóa bí mật → Chữ ký
    const signature = privateEncrypt(
      { key: privateKey, padding: constants.RSA_PKCS1_PADDING },
      hashBuffer,
    ).toString("hex");

    res.json({ signature, hashHA });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

export const verifyFile = (req, res) => {
  try {
    const { publicKey, signature } = req.body;
    const fileBuffer = req.file.buffer;

    // Bước 1: Băm file nhận được → H_B
    const hashBuffer = createHash("sha256").update(fileBuffer).digest();
    const hashHB = hashBuffer.toString("hex");

    let hashHARecovered = null;
    let isValid = false;

    try {
      // Bước 2: Giải mã chữ ký bằng Khóa công khai → khôi phục H_A
      const sigBuffer = Buffer.from(signature, "hex");
      const decrypted = publicDecrypt(
        { key: publicKey, padding: constants.RSA_PKCS1_PADDING },
        sigBuffer,
      );
      hashHARecovered = decrypted.toString("hex");

      // Bước 3: So sánh H_A và H_B
      isValid = hashHARecovered === hashHB;
    } catch {
      hashHARecovered = null;
      isValid = false;
    }

    res.json({ isValid, hashHB, hashHARecovered });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};
