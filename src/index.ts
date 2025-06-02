import http from "http";
import express from "express";
import WebSocket from "ws";
import url from "url";

const app = express();
app.use(express.json());

// ✅ REST API
app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello from REST API!" });
});

app.post("/api/echo", (req, res) => {
  res.json({ youSent: req.body });
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

app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendEvent = () => {
    res.write(`data: ${JSON.stringify({ time: new Date() })}\n\n`);
  };

  const interval = setInterval(sendEvent, 1000);

  req.on("close", () => {
    clearInterval(interval);
    res.end();
  });
});

server.listen(8999, () => {
  console.log("🚀 Server is running at http://localhost:8999");
  console.log("🔌 WebSocket endpoint at ws://localhost:8999/ws");
});
