import jwt from "jsonwebtoken";
import express from "express";

const JWT_SECRET = "your_jwt_secret"; // Заменить на переменную окружения в проде

export const authenticateJWT = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: "Invalid token" });
      }

      // Можно передать данные пользователя в req.user
      (req as any).user = decoded;
      next();
    });
  } else {
    res.status(401).json({ error: "Authorization header missing" });
  }
};
