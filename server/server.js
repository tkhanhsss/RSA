import express from "express";
import cors from "cors";
import rsaRoutes from "./routes/rsaRoutes.js";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/rsa", rsaRoutes);

app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
