const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

let rooms = {};

io.on('connection', (socket) => {
    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        if (!rooms[roomId]) rooms[roomId] = { players: [] };
        
        const roomPlayers = rooms[roomId].players;
        if (roomPlayers.length === 0) {
            roomPlayers.push(socket.id);
            socket.emit('playerRole', 'p1');
        } else if (roomPlayers.length === 1) {
            roomPlayers.push(socket.id);
            socket.emit('playerRole', 'p2');
            io.to(roomId).emit('gameReady');
        } else {
            socket.emit('roomFull');
        }
    });

    socket.on('playerMoved', (data) => {
        socket.to(data.roomId).emit('updateOpponent', data);
    });

    socket.on('ballSync', (data) => {
        socket.to(data.roomId).emit('updateBall', data);
    });

    socket.on('disconnect', () => {
        // Очищення при виході
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Сервер працює на порту ${PORT}`);
});
