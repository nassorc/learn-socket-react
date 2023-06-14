const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const InMemoryStore = require("./InMemoryStore");
const crypto = require("crypto");
const createID = () => {
    return crypto.randomBytes(24).toString("hex");
}
const store = new InMemoryStore();
store
    .saveSession("9adc166807677be95cad9b22c40dbc20643aee00fab80d6b", {
        userID: "06581a47b691172a4c960e3d9c72205a4c6047686c0d6d09",
        username: "persitent"
    })
// store
//     .saveSession("c58e96d4580154e3711e15ef87e155315669838a0f1e0fee", {
//         userID: "17104909d8c395eb8322aa56fe53d4c6ac8e3f8436d7feb7",
//         username: "crab"
//     })

const app = express();
const server = http.createServer(http);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

io.use((socket, next) => {
    const sessionID = socket.handshake.auth.sessionID;
    if(sessionID) {
        const session = store.findSession(sessionID);
        if(!session) next(new Error("No session data"));
        socket.sessionID = sessionID;
        socket.userID = session?.userID;
        socket.username = session?.username;
        return next();
    }
    const username = socket.handshake.auth.username;
    if(!username) {
        return next(new Error("Missing username"));
    }
    socket.username = username;
    socket.sessionID = createID();
    socket.userID = createID();
    store.saveSession(socket.sessionID, {
        username,
        userID: socket.userID,
        online: true,
    })
    return next();
})

io.on("connection", (socket) => {
    // console.log(`user ${socket.username}:${socket.userID} connected`);
    console.log(`${socket.userID} joined the room`);
    const users = [];

    for(let [sessionID, session] of store.getSession()) {
        users.push({
            username: session.username,
            userID: session.userID,
            online: (sessionID === socket.sessionID) ? true : session.online,
        })
    }

    socket.join(socket.userID);

    socket.emit("session", {
        sessionID: socket.sessionID,
        userID: socket.userID
    })

    socket.emit("users", users);

    socket.broadcast.emit("healthcheck", "u okay")

    socket.broadcast.emit("user connected", {
        username: socket.username,
        userID: socket.userID,
        online: true,
    })

    socket.on("disconnect", () => {
        store.saveSession(socket.sessionID, {
            username: socket.username,
            userID: socket.userID,
            online: false,
        })
        socket.broadcast.emit("user disconnect", {
            username: socket.username,
            userID: socket.userID,
            online: false,
        });
    })

    socket.on("send message", (data) => {
        socket.broadcast.emit("message from user", {
            userID: socket.userID,
            message: data,
            online: false,
        })
    })

    socket.on("private message", ({ content, to }) => {
        console.log(`private message to room ${to}`);
        socket.to(to).emit("private message", {content, from: socket.userID});
    })
})

io.on("disconnect", (socket) => {
    console.log(`user ${socket.username} disconnected`);
})

server.listen(3000, () => {
    console.log("Listening on port 3000");
})