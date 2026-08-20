import { Request, Response } from "express";
import * as adminService from "./admin.service";

export const handleCreateAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios." });
    }
    const newAdmin = await adminService.createAdmin({ name, email, password, role });
    return res.status(201).json(newAdmin);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const handleGetAdmins = async (req: Request, res: Response) => {
  try {
    const admins = await adminService.getAdmins();
    return res.status(200).json(admins);
  } catch (error: any) {
    return res.status(500).json({ error: "Erro interno ao buscar administradores." });
  }
};

export const handleUpdateAdmin = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID inválido." });

    const { name, email, password, role } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Nome e e-mail são obrigatórios." });
    }

    const updatedAdmin = await adminService.updateAdmin(id, { name, email, password, role });
    return res.status(200).json(updatedAdmin);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};

export const handleDeleteAdmin = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID inválido." });

    const response = await adminService.deleteAdmin(id);
    return res.status(200).json(response);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
};
