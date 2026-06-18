import { Request, Response } from "express";
import {
  createItemService,
  getAllItemsService,
  getItemByIdService,
  updateItemService,
  deleteItemService
} from "./item.service";

export const createItem = async (req: Request, res: Response) => {
  try {
    const { name, code, type, roomId } = req.body;

    if (!name || !code || !type || !roomId) {
      return res.status(400).json({ error: "Nome, código, tipo e sala são obrigatórios." });
    }

    const item = await createItemService(name, code, type, Number(roomId));
    return res.status(201).json(item);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Já existe um item cadastrado com este código." });
    }
    return res.status(500).json({ error: error.message });
  }
};

export const getAllItems = async (req: Request, res: Response) => {
  try {
    const items = await getAllItemsService();
    return res.status(200).json(items);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const getItemById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const item = await getItemByIdService(id);

    if (!item) {
      return res.status(404).json({ error: "Item não encontrado." });
    }

    return res.status(200).json(item);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateItem = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, code, type, status, roomId } = req.body;

    const item = await updateItemService(id, name, code, type, status, roomId ? Number(roomId) : undefined);
    return res.status(200).json(item);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Já existe um item cadastrado com este código." });
    }
    return res.status(500).json({ error: error.message });
  }
};

export const deleteItem = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await deleteItemService(id);
    return res.status(204).send();
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};