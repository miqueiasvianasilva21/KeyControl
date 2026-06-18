import 'dotenv/config';
import express from 'express';
import authRoutes from "./resources/auth/auth.router";
import keyRouter from './resources/key/key.router';
import kitRouter from './resources/kit/kit.router';
import userRouter from './resources/user/user.router';
import movementRouter from './resources/movement/movement.router';
import roomRouter from './resources/room/room.router';
import itemRouter from './resources/item/item.router';
import cors from 'cors';
import cookieParser from "cookie-parser";



const app = express();
app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true, 
}));
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoutes);
app.use('/keys', keyRouter);
app.use('/kits', kitRouter);
app.use('/users', userRouter);
app.use('/movements', movementRouter);
app.use('/rooms',roomRouter);
app.use('item',itemRouter);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});