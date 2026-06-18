import { Request, Response } from 'express';
import * as kitService from './kit.service';

export const create = async (req: Request, res: Response) => {
  try {
    const { name, code, status } = req.body;
    const newKit = await kitService.createKit({ name, code, status });
    res.status(201).json(newKit);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao criar kit. O código já existe?' });
  }
};

export const list = async (req: Request, res: Response) => {
  try {
    const kits = await kitService.getAllKits();
    res.json(kits);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno ao buscar kits.' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, code, status } = req.body;
    const updatedKit = await kitService.updateKit(id, { name, code, status });
    res.json(updatedKit);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar kit.' });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await kitService.deleteKit(id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Erro ao deletar kit.' });
  }
};