const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const { userJoin, getCurrentUser, userLeave, getRoomUser } = require("./utils/users");

const app = express();
const server = http.createServer(app);
const PORT = 3000 || process.en.PORT;
const io = socketio(server);

const botName = "Chatcord bot";

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", socket => {
    socket.on("joinRoom", ({ username, room }) => {
        let user = userJoin(socket.id, username, room);

        if (user) {
            socket.join(user.room);

            socket.emit("message", formatMessage(botName, "welcome to Chatcord"));
            socket.broadcast.to(user.room).emit("message", formatMessage(botName, `${user.username} has joined the chat`));
            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUser(user.room)
            });
        }
    });
    socket.on("chatMessage", message => {
        console.log(message);
        let user = getCurrentUser(socket.id);
        if (user) {
            io.to(user.room).emit("message", formatMessage(user.username, message));
        }
    });
    socket.on("disconnect", () => {
        let user = userLeave(socket.id);

        if (user) {
            io.emit("message", formatMessage(botName, `${user.username} just left the chat`));
            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUser(user.room)
            });
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
})