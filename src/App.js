import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

// 렌더 서버 주소 (직결 설정)
const socket = io("https://cat-talkie-server.onrender.com");

function App() {
    const [status, setStatus] = useState("마이크 권한을<br>확인 중입니다... 🐾");
    const [isConnected, setIsConnected] = useState(socket.connected);
    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);

    useEffect(() => {
        // 1. 마이크 권한 요청 및 초기화
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorder.current = new MediaRecorder(stream);

                mediaRecorder.current.ondataavailable = (event) => {
                    audioChunks.current.push(event.data);
                };

                mediaRecorder.current.onstop = () => {
                    const audioBlob = new Blob(audioChunks.current, { type: 'audio/ogg; codecs=opus' });
                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);
                    reader.onloadend = () => {
                        socket.emit('voice-message', reader.result); // 서버로 음성 전송
                    };
                    audioChunks.current = [];
                };

                setStatus("채널 접속 완료!<br>준비됐어 오빠! 🐾");
            })
            .catch(err => {
                setStatus("마이크 권한을<br>허용해줘! 🙀");
                console.error("마이크 에러:", err);
            });

        // 2. 서버 연결 상태 감지
        socket.on('connect', () => setIsConnected(true));
        socket.on('disconnect', () => setIsConnected(false));

        // 3. 서버에서 음성 데이터를 받았을 때 재생
        socket.on('audio-stream', (audioData) => {
            const audio = new Audio(audioData);
            audio.play().catch(e => console.error("재생 실패:", e));
            setStatus("메시지 수신 중!<br>📢🐾");
            audio.onended = () => {
                setStatus("채널 접속 완료!<br>대기 중... 🐾");
            };
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('audio-stream');
        };
    }, []);

    // 송신 시작
    const startTalking = () => {
        if (mediaRecorder.current && mediaRecorder.current.state === "inactive") {
            mediaRecorder.current.start();
            setStatus("치익- 송신 중...<br>🎤🐈");
        }
    };

    // 송신 중단
    const stopTalking = () => {
        if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
            mediaRecorder.current.stop();
            setStatus("송신 완료!<br>대기 중... 🐾");
        }
    };

    return (
        <div style={styles.body}>
            <div style={styles.container}>
                <h1 style={styles.title}>PunguinTalkie 🐧</h1>
                
                {/* LCD 화면 상태 표시 */}
                <div style={styles.lcdScreen}>
                    <span dangerouslySetInnerHTML={{ __html: status }} />
                </div>

                <button 
                    style={{
                        ...styles.pttButton,
                        backgroundColor: isConnected ? '#e74c3c' : '#95a5a6',
                        cursor: isConnected ? 'pointer' : 'not-allowed'
                    }}
                    onMouseDown={startTalking} 
                    onMouseUp={stopTalking}
                    onTouchStart={(e) => { e.preventDefault(); startTalking(); }}
                    onTouchEnd={stopTalking}
                >
                    PUSH TO<br/>TALK
                </button>
                
                <p style={styles.guideText}>버튼을 꾹 누르고 말하세요!</p>
                <div style={{ color: isConnected ? '#2ecc71' : '#e74c3c', fontSize: '12px', marginTop: '10px' }}>
                    {isConnected ? "● Online" : "● Offline"}
                </div>
            </div>
        </div>
    );
}

// 오빠가 좋아한 그 디자인 스타일!
const styles = {
    body: {
        backgroundColor: '#2c3e50',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        margin: 0,
        fontFamily: "'Arial', sans-serif",
    },
    container: {
        background: '#34495e',
        padding: '40px 30px',
        borderRadius: '40px',
        boxShadow: '0 15px 50px rgba(0,0,0,0.6)',
        textAlign: 'center',
        width: '280px',
        border: '4px solid #2c3e50',
    },
    title: {
        color: '#ecf0f1',
        marginBottom: '25px',
        fontSize: '1.5rem',
    },
    lcdScreen: {
        background: '#95a5a6',
        color: '#2c3e50',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '30px',
        minHeight: '60px',
        fontWeight: 'bold',
        border: '4px inset #7f8c8d',
        lineHeight: '1.4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pttButton: {
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        border: 'none',
        color: 'white',
        fontSize: '18px',
        fontWeight: 'bold',
        boxShadow: '0 10px #c0392b',
        transition: 'all 0.1s',
        outline: 'none',
    },
    guideText: {
        marginTop: '25px',
        color: '#bdc3c7',
        fontSize: '0.9rem',
    }
};

export default App;