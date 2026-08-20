import { Router } from "express";
import {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  getRoomMovements,
  addKitToRoom,
  getRoomsHistory
} from "./room.controller";

const roomRouter = Router();

roomRouter.post("/", createRoom);
roomRouter.get("/", getAllRooms);
roomRouter.get("/history", getRoomsHistory);
roomRouter.get("/:id", getRoomById);
roomRouter.put("/:id", updateRoom);
roomRouter.delete("/:id", deleteRoom);
roomRouter.get("/:id/movements", getRoomMovements);
roomRouter.post("/:id/kit", addKitToRoom);

export default roomRouter;