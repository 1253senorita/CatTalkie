const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// [수정] Railway 배포 시 생성되는 'build' 폴더를 우선 순위로 설정합니다.
// 만약 빌드 전이라면 'public' 폴더를 참조하도록 안전하게 설정했습니다.
const publicPath = path.join(__dirname, 'build');
app.use(express.static(publicPath));

// 루트 접속 시 index.html을 강제로 서빙 (SPA 대응)
app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// 소켓 통신 로직
io.on('connection', (socket) => {
    console.log('🐾 새로운 고양이가 접속했습니다! (ID: ' + socket.id + ')');

    // 음성 데이터 중계: 보낸 사람을 제외한 모든 접속자에게 전송
    socket.on('voice-data', (data) => {
        socket.broadcast.emit('voice-data', data);
    });

    socket.on('disconnect', () => {
        console.log('🐾 고양이가 나갔습니다.');
    });
});

// [수정] Railway 환경에서 할당하는 포트를 사용하도록 변경 (중요!)
const PORT = process.env.PORT || 3000;

// [수정] '0.0.0.0'을 추가하여 외부 접속을 허용합니다.
server.listen(PORT, '0.0.0.0', () => {
    console.log(`--- CatTalkie 서버 시작! ---`);
    console.log(`포트 번호: ${PORT}`);
    console.log(`접속 경로: ${publicPath}`);
    console.log(`----------------------------`);
});