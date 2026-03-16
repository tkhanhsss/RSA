import { Router } from "express";
import multer from "multer";
import {
  generateKeys,
  signFile,
  verifyFile,
} from "../controllers/rsaController.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/generate-keys", generateKeys);
router.post("/sign", upload.single("file"), signFile);
router.post("/verify", upload.single("file"), verifyFile);

export default router;
