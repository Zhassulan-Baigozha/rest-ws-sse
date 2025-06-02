import http from "http";
import express from "express";
import WebSocket from "ws";
import url from "url";
import cors from "cors";
import jwt from "jsonwebtoken";

import { authenticateJWT } from "./middleware/authenticateJWT";

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = "my_jwt_secret";

const sseClients: express.Response[] = []; // <— здесь храним активные SSE-подключения

// ✅ REST API
app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello from REST API!" });
});

app.post("/api/sse/transfer", authenticateJWT, (req, res) => {
  const user = (req as any).user;
  const message = req.body;

  // Пример: включить имя пользователя в сообщение
  sseClients.forEach((client) => {
    client.write(`data: ${JSON.stringify({ from: user.name, message })}\n\n`);
  });

  res.json({ status: "sent", from: user.name });
});

app.post("/api/login", (req, res) => {
  const user = { id: 1, name: "Zhassulan" }; // В реальности: проверка логина/пароля
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

const server = http.createServer(app);
const webSocketServer = new WebSocket.Server({ noServer: true });

// ✅ Обработка upgrade-запроса вручную
server.on("upgrade", (req, socket, head) => {
  const proto = req.headers["sec-websocket-protocol"];
  const { pathname } = url.parse(req.url!);
  console.log("proto", proto);

  if (pathname === "/ws") {
    webSocketServer.handleUpgrade(req, socket, head, (ws) => {
      webSocketServer.emit("connection", ws, req);
    });
  } else {
    socket.destroy();
  }
});

// ✅ WebSocket логика
webSocketServer.on("connection", (ws) => {
  ws.on("message", (m) => {
    webSocketServer.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(m);
      }
    });
  });

  ws.send("👋 Connected to Zhassulan /ws WebSocket");
});

// ✅ SSE логика
app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Добавляем клиента в список
  sseClients.push(res);
  console.log("📡 New SSE client connected");

  // Периодическое обновление (по желанию)
  const interval = setInterval(() => {
    res.write(`data: ${JSON.stringify({ time: new Date() })}\n\n`);
  }, 10000);

  // Удаляем клиента при отключении
  req.on("close", () => {
    clearInterval(interval);
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
    console.log("❌ SSE client disconnected");
    res.end();
  });
});

server.listen(8999, () => {
  console.log("🚀 Server is running at http://localhost:8999");
  console.log("🔌 WebSocket endpoint at ws://localhost:8999/ws");
});
