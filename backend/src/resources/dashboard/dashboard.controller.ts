import { Request, Response } from "express";
import * as dashboardService from "./dashboard.service";

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const data = await dashboardService.getDashboardStats();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Erro no controlador do dashboard:", error);
    return res.status(500).json({ error: "Erro interno ao processar dados do dashboard." });
  }
};