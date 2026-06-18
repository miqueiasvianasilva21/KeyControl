import { Router } from "express";
import {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  getRoomMovements
} from "./room.controller";

const roomRouter = Router();

roomRouter.post("/", createRoom);
roomRouter.get("/", getAllRooms);
roomRouter.get("/:id", getRoomById);
roomRouter.put("/:id", updateRoom);
roomRouter.delete("/:id", deleteRoom);
roomRouter.get("/:id/movements", getRoomMovements);

export default roomRouter;