const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 1. 웹 페이지 파일들이 들어있는 폴더 연결 (나중에 만들 public 폴더)
app.use(express.static(path.join(__dirname, 'public')));

// 2. 누군가 무전기에 접속했을 때
io.on('connection', (socket) => {
    console.log('🐾 새로운 고양이가 접속했습니다! (ID: ' + socket.id + ')');

    // 3. 음성 데이터나 메시지를 받았을 때 다른 사람들에게 전달
    socket.on('voice-data', (data) => {
        socket.broadcast.emit('voice-data', data);
    });

    // 4. 접속을 끊었을 때
    socket.on('disconnect', () => {
        console.log('🐾 고양이가 나갔습니다.');
    });
});

// 5. 서버 실행 (포트 3000번)
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`--- CatTalkie 서버 시작! ---`);
    console.log(`주소: http://localhost:${PORT}`);
    console.log(`----------------------------`);
});