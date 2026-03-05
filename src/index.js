import React from 'react';
import ReactDOM from 'react-dom/client';

// App.js가 같은 src 폴더에 있다면 아래처럼 씁니다.
function App() {
  return <h1>CatTalkie 시작!</h1>;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);