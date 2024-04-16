const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require("cors");
app.use(cors());
const server = require("http").Server(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "http://192.168.29.86:8081",
  },
});

let users = [];

io.on("connection", (socket) => {
  const user = socket.handshake.query;
  user.socketId = socket.id;
  socket.join(user.userId);
  socket.emit("first-message", "First message from server");

  users.push(user);

  io.emit("users_connected", users);

  socket.on("disconnect", () => {
    users = users.filter((u) => {
      if (u.socketId != socket.id) {
        return u;
      }
    });
    io.emit("users_disconnected", users);
  });

  socket.on("send_message", (data) => {
    io.to(data.sender.userId).emit("chat-message", {
      sender: data.sender,
      receiver: data.receiver,
      message: data.message,
    });
    io.to(data.receiver.userId).emit("chat-message", {
      sender: data.sender,
      receiver: data.receiver,
      message: data.message,
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server is listening to ${PORT}`);
});
