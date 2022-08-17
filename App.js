require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 3000;
const routes = require("./routes");
const errorHandler = require("./middlewares/ErrorHandler");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
// server.use(cors());
const io = new Server(server, {
  cors: {},
});
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use((req, res, next) => {
  res.io = io;
  next();
});
app.use(routes);
app.use(errorHandler);
io.on("connection", (socket) => {
  socket.on("chat", ({ receiver, sender, message }) => {
    io.emit(receiver, { sender, message });
  });
});

<<<<<<< HEAD
if(process.env.NODE_ENV !== 'test'){
app.listen(PORT, () => console.log(`Successfully connected to port ${PORT}`));
}

module.exports = app
=======
server.listen(PORT, () =>
  console.log(`Successfully connected to port ${PORT}`)
);
>>>>>>> 814d54dcde385435293e61e7f484670e9cfefbd9
