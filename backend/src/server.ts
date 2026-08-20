import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";

import authRoutes from "./resources/auth/auth.router";
import userRouter from './resources/user/user.router';
import movementRouter from './resources/movement/movement.router';
import roomRouter from './resources/room/room.router';
import itemRouter from './resources/item/item.router';
import dashboardRouter from './resources/dashboard/dashboard.router';
import adminRouter from './resources/admin/admin.router';


import { verificarToken } from './resources/middlewares/auth.middleware';

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";
const insecureJwtSecrets = new Set([
  "change-me-in-production",
  "generate-a-long-random-secret",
  "troque-este-segredo-em-producao",
]);
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET não definido.");
}

if (isProduction && insecureJwtSecrets.has(jwtSecret)) {
  throw new Error("JWT_SECRET inseguro para produção.");
}

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origem não permitida pelo CORS."));
  },
  credentials: true, 
}));
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());


app.use("/auth", authRoutes);

app.use(verificarToken);

app.use('/users', userRouter);
app.use('/movements', movementRouter);
app.use('/rooms', roomRouter);
app.use('/items', itemRouter);
app.use('/dashboard',dashboardRouter)
app.use("/admins", adminRouter);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
