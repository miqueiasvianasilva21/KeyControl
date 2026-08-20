import { Request, Response } from "express";
import {
  createRoomService,
  getAllRoomsService,
  getRoomByIdService,
  updateRoomService,
  deleteRoomService,
  getRoomMovementsService,
  addKitToRoomService,
  getRoomsHistoryService
} from "./room.service";

export const createRoom = async (req: Request, res: Response) => {
  try {
    const { name, number, block, itemsOption } = req.body;

    if (!name) {
      return res.status(400).json({ error: "O nome da sala é obrigatório." });
    }

    const room = await createRoomService(name, number, block, itemsOption);
    return res.status(201).json(room);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getAllRooms = async (req: Request, res: Response) => {
  try {
    const rooms = await getAllRoomsService();
    return res.status(200).json(rooms);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getRoomById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const room = await getRoomByIdService(id);

    if (!room) {
      return res.status(404).json({ error: "Sala não encontrada." });
    }

    return res.status(200).json(room);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateRoom = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, number, block } = req.body; 

    const room = await updateRoomService(id, name, number, block);
    return res.status(200).json(room);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await deleteRoomService(id);
    return res.status(204).send();
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getRoomMovements = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const movements = await getRoomMovementsService(id);
    
    return res.status(200).json(movements);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const addKitToRoom = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const newKit = await addKitToRoomService(id);
    
    return res.status(201).json(newKit);
  } catch (error: any) {
    return res.status(400).json({ error: error.message }); 
  }
};

export const getRoomsHistory = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 15;
    const search = (req.query.search as string) || "";

    const historyData = await getRoomsHistoryService(page, limit, search);
    return res.status(200).json(historyData);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};