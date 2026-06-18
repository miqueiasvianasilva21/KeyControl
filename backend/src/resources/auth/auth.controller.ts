import { Request, Response } from "express";
import * as authService from "./auth.service";

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    // Chama o serviço para validar e gerar o token
    const { token, user } = await authService.login(email, password);

    // INJETA O COOKIE HTTP-ONLY NA RESPOSTA
    res.cookie("token", token, {
      httpOnly: true, // Impede acesso via JavaScript (Evita ataque XSS)
      secure: process.env.NODE_ENV === "production", // Usa HTTPS na produção
      sameSite: "lax", // Protege contra CSRF
      maxAge: 8 * 60 * 60 * 1000, // 8 horas de duração
    });

    res.status(200).json({ message: "Login realizado com sucesso", user });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

export const logoutController = (req: Request, res: Response) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout realizado com sucesso" });
};