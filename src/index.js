const http = require("http");
const path = require("path");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");
const {
  addUser,
  getUser,
  getUsersInRoom,
  removeUser,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = new socketio.Server(server);

const pubDirectory = path.join(__dirname, "../public");
const port = process.env.PORT || 3000;

// Setting the static public directory
app.use(express.static(pubDirectory));

// Runs once a user is connected
io.on("connection", (socket) => {
  console.log("New webSocket connection");

  // Receiving the room and username
  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error); // Returns error to the client
    }

    socket.join(user.room); // We can specifically emit messages on that room

    // Sending the client a welcome message in the room
    socket.emit("message", generateMessage("Hi there, Welcome!"));

    // Sending the message to everyone except the current client in the room
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage(`${user.username} has joined!`));

    // To populate the side bar of the app
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  // Receiving the message from the client
  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    // Filtering out bad words
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed!");
    }
    // Sending the message back to all the clients in the room
    io.to(user.room).emit("message", generateMessage(message, user.username));
    callback(); // The acknowledgement
  });

  // Receiving the location of the user
  socket.on("sendLocation", (location, callback) => {
    // Getting the user
    const user = getUser(socket.id);
    // Sending the google map location to all the clients
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(user.username, location)
    );

    callback(); // The acknowledgement
  });

  // Runs when the client/socket gets disconnected
  socket.on("disconnect", () => {
    const user = removeUser(socket.id); // Removing user from the users list

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage(`${user.username} has left!`)
      );

      // To Update the sidebar
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, (err) => {
  if (err) throw err;
  console.log(`Server started at port: ${port}`);
});
