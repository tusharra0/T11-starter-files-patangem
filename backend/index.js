import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const app = express();

app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}));

app.use(express.json());

import router from "./routes.js";
app.use("/", router);

export default app;
