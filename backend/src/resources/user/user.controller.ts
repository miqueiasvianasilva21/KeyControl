import { Request, Response } from 'express';
import * as userService from './user.service';

export const create = async (req: Request, res: Response) => {
  try {
    const { fullName, phone, role, roomAuthorizations } = req.body;
    
    const newUser = await userService.createUser({
      fullName,
      phone,
      role,
      roomAuthorizations,
    });
    
    res.status(201).json(newUser);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: error.message || 'Erro ao criar usuário.' });
  }
};

export const list = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno ao buscar usuários.' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { fullName, phone, role, roomAuthorizations } = req.body;
    
    const updatedUser = await userService.updateUser(id, { 
      fullName, 
      phone, 
      role,
      roomAuthorizations 
    });
    
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao atualizar usuário.' });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await userService.deleteUser(id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Erro ao deletar usuário.' });
  }
};