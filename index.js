const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 3000;
const MAX_PLAYERS = Number(process.env.MAX_PLAYERS || 50);

app.use(express.static("public"));
app.get("/health", (_req, res) => res.json({ ok: true, game: "Vamp RP" }));

const players = new Map();
wss.on("connection", (socket) => {
  if (players.size >= MAX_PLAYERS) {
    socket.close(1013, "Server full");
    return;
  }
  const id = Math.random().toString(36).slice(2, 10);
  players.set(id, { x: 0, z: 0 });
  socket.send(JSON.stringify({ type: "welcome", id, players: Object.fromEntries(players) }));

  socket.on("message", (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }
    if (msg.type !== "move") return;
    const x = Number(msg.x), z = Number(msg.z);
    if (!Number.isFinite(x) || !Number.isFinite(z)) return;
    const p = players.get(id);
    if (!p) return;
    p.x = Math.max(-100, Math.min(100, x));
    p.z = Math.max(-100, Math.min(100, z));
    const update = JSON.stringify({ type: "state", players: Object.fromEntries(players) });
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) client.send(update);
    }
  });

  socket.on("close", () => {
    players.delete(id);
    const update = JSON.stringify({ type: "state", players: Object.fromEntries(players) });
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) client.send(update);
    }
  });
});

server.listen(PORT, () => console.log(`Vamp RP starter listening on ${PORT}`));
