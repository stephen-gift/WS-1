const WS = require("WS");

const server = new WS.Server({ port: "5500" });

server.on("connection", (socket) => {
  socket.on("message", (message) => {
    const b = Buffer.from(message);
    console.log(b.toString());
    socket.send(`${message}`);
  });
});
