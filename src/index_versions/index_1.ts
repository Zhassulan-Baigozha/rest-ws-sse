import http from "http";
import express from "express";
import WebSocket from "ws";

const app = express();
app.use(express.json()); // Чтобы читать JSON body

// ✅ Пример REST API
app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello from REST API!" });
});

app.post("/api/echo", (req, res) => {
  res.json({ youSent: req.body });
});

// Создание HTTP-сервера и WebSocket-сервера
const server = http.createServer(app);
const webSocketServer = new WebSocket.Server({ server });

// ✅ WebSocket
webSocketServer.on("connection", (ws) => {
  ws.on("message", (m) => {
    // Рассылаем сообщение всем клиентам
    webSocketServer.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(m);
      }
    });
  });

  ws.on("error", (e) => ws.send(JSON.stringify(e)));

  ws.send("Hi there, I am a WebSocket server");
});

// Запуск сервера
server.listen(8999, () => {
  console.log("🚀 Server is running on http://localhost:8999");
});
