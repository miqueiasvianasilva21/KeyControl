import { Request, Response } from "express";
import * as movementService from "./movement.service";

import { AuthenticatedRequest } from "../middlewares/auth.middleware";

const getAuthenticatedAdminId = (req: AuthenticatedRequest) => {
  if (!req.usuario) {
    throw new Error("Acesso negado. Faça login para realizar esta operação.");
  }

  return req.usuario.id;
};

export const create = async (req: AuthenticatedRequest, res: Response) => {
  try {
    
    const { type, userId, itemId } = req.body;
    const adminLogadoId = getAuthenticatedAdminId(req);
    
    const newMovement = await movementService.createMovement({
      type,
      userId,
      adminId: adminLogadoId,
      itemId,
    });
    
    return res.status(201).json(newMovement);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || "Erro ao registrar movimentação." });
  }
};

export const list = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const movements = await movementService.getAllMovements();
    return res.status(200).json(movements);
  } catch (error) {
    return res.status(500).json({ error: "Erro interno ao buscar movimentações." });
  }
};

export const reportarPerdaController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { itemId } = req.body; 
    
  
    const adminLogadoId = getAuthenticatedAdminId(req);

    if (!itemId) {
      return res.status(400).json({ error: "O ID da chave (itemId) é obrigatório." });
    }

    const resultado = await movementService.reportarPerda(Number(itemId), Number(adminLogadoId));
    return res.status(200).json(resultado);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Erro interno ao reportar perda." });
  }
};

export const recuperarItemController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { itemId } = req.body; 
    const adminLogadoId = getAuthenticatedAdminId(req);
    if (!itemId) {
      return res.status(400).json({ error: "O ID do item é obrigatório." });
    }

    const resultado = await movementService.recuperarItem(Number(itemId), Number(adminLogadoId));
    return res.status(200).json(resultado);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Erro interno ao recuperar item." });
  }
};
