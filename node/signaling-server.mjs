// signaling-server.mjs
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: '*' }
});

io.on("connection", (socket) => {
    socket.on("join", (roomId) => {
        socket.join(roomId)
        socket.to(roomId).emit("joined")
        console.log(socket.id);
    })

    socket.on("offer", ({ roomId, offer }) => {
        socket.to(roomId).emit("offer", { offer })
    })

    socket.on("answer", ({ roomId, answer }) => {
        socket.to(roomId).emit("answer", { answer })
    })

    socket.on("candidate", ({ roomId, candidate }) => {
        console.log("Received Room ID ==> "+ roomId + "and Candidate ID ==> "+ candidate);
        socket.to(roomId).emit("candidate", { candidate })
    })

    // 💬 Chat message
    socket.on('chat-message', ({ roomId, message }) => {
        socket.to(roomId).emit('chat-message', { message });
    });
})

httpServer.listen(6001, () => {
    console.log('Signaling server running at http://localhost:6001');
});
