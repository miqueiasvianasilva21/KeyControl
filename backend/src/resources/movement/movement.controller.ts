import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import * as movementService from "./movement.service";

export const reportarPerdaController = async (req: Request, res: Response) => {
  try {
    const itemId = Number(req.params.id);
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Não autorizado. Token não encontrado." });
    }

    const JWT_SECRET = process.env.JWT_SECRET || "chave_secreta_super_segura_do_tcc";
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const adminId = decoded.id; 

    if (!itemId || !adminId) {
      return res.status(400).json({ error: "Dados incompletos para reportar perda." });
    }

    const resultado = await movementService.reportarPerda(itemId, adminId);
    return res.status(200).json(resultado);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Erro interno ao reportar perda." });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { type, userId, adminId, itemId } = req.body;
    
    const newMovement = await movementService.createMovement({
      type,
      userId,
      adminId,
      itemId,
    });
    
    res.status(201).json(newMovement);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Erro ao registrar movimentação." });
  }
};

export const list = async (req: Request, res: Response) => {
  try {
    const movements = await movementService.getAllMovements();
    res.json(movements);
  } catch (error) {
    res.status(500).json({ error: "Erro interno ao buscar movimentações." });
  }
};