import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AdminRole } from "@prisma/client";


export interface AuthenticatedRequest extends Request {
  usuario?: {
    id: number;
    name: string;
    email: string;
    role: AdminRole;
    iat?: number;
    exp?: number;
  };
}

const isAuthenticatedUser = (
  value: string | jwt.JwtPayload,
): value is NonNullable<AuthenticatedRequest["usuario"]> => {
  if (typeof value === "string") {
    return false;
  }

  return (
    typeof value.id === "number" &&
    typeof value.name === "string" &&
    typeof value.email === "string" &&
    typeof value.role === "string"
  );
};

export const verificarToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {

  const authHeader = req.headers.authorization;
  const token = req.cookies?.token || (authHeader && authHeader.split(" ")[1]);

  if (!token) {
    return res.status(401).json({ error: "Acesso negado. Faça login para realizar esta operação." });
  }

  
  const JWT_SECRET = process.env.JWT_SECRET;
  
  if (!JWT_SECRET) {
    console.error("ERRO CRÍTICO DE SEGURANÇA: JWT_SECRET não está definido no arquivo .env");
    return res.status(500).json({ error: "Erro interno de configuração do servidor." });
  }

 
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!isAuthenticatedUser(decoded)) {
      return res.status(401).json({ error: "Sessão inválida. Faça login novamente." });
    }

    req.usuario = decoded;
    
    next(); 
  } catch (err) {
    return res.status(401).json({ error: "Sessão expirada ou token inválido. Faça login novamente." });
  }
};
