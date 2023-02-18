const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const path = require('path');
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
    res.sendFile('public/index.html', { root: path.dirname(__dirname) });
})

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

io.on('connection', (socket) => {
    socket.on('message', (msg) => {
        console.log('message: ' + msg);
        io.emit('message', msg);

    });
});


server.listen(3000, () => {
    console.log('listening on *:3000');
});