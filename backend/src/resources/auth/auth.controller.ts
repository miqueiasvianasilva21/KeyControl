import { Request, Response } from "express";
import * as authService from "./auth.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import {
  clearFailedLoginAttempts,
  registerFailedLoginAttempt,
} from "../middlewares/rate-limit.middleware";

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "E-mail e senha são obrigatórios." });
    }
    
    const { token, user } = await authService.login(email, password);
    clearFailedLoginAttempts(res.locals.loginRateLimitKey);

    res.cookie("token", token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: "lax", 
      maxAge: 8 * 60 * 60 * 1000, 
      path: "/",
    });

    res.status(200).json({ message: "Login realizado com sucesso", user });
  } catch (error: any) {
    registerFailedLoginAttempt(res.locals.loginRateLimitKey);
    res.status(401).json({ error: error.message });
  }
};

export const logoutController = (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  res.status(200).json({ message: "Logout realizado com sucesso" });
};

export const meController = (req: AuthenticatedRequest, res: Response) => {
  if (!req.usuario) {
    return res.status(401).json({ error: "Sessão inválida." });
  }

  return res.status(200).json({
    user: {
      id: req.usuario.id,
      name: req.usuario.name,
      email: req.usuario.email,
      role: "ADMIN",
    },
  });
};
