import { Request, Response } from 'express';
import * as keyService from './key.service';
import { prisma } from "../../database/prisma";

export const create = async (req: Request, res: Response) => {
  try {
    const { name, code, status } = req.body;
    const newKey = await keyService.createKey({ name, code, status });
    res.status(201).json(newKey);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar chave. O código já existe?' });
  }
};

export const list = async (req: Request, res: Response) => {
  try {
    const keys = await keyService.getAllKeys();
    res.json(keys);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno ao buscar as chaves.' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, code, status } = req.body;
    const updatedKey = await keyService.updateKey(id, { name, code, status });
    res.json(updatedKey);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar chave.' });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await keyService.deleteKey(id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Erro ao deletar chave.' });
  }
};

export const recuperarChaveController = async (req: Request, res: Response) => {
  try {
    const keyId = Number(req.params.id);

    // Atualiza o status diretamente para AVAILABLE
    const chaveRecuperada = await prisma.key.update({
      where: { id: keyId },
      data: { status: "AVAILABLE" }
    });

    return res.status(200).json(chaveRecuperada);
  } catch (error: any) {
    return res.status(500).json({ error: "Erro ao tentar recuperar a chave." });
  }
};
