import express from 'express';
import path from 'path';

const app = express();
const PORT = 3001;

// 静态文件服务
app.use(express.static(path.resolve('./public')));

app.get('/api/ping', (req, res) => {
  res.send('pong from test server');
});

// 主页
app.get('/', (req, res) => {
  res.sendFile(path.resolve('./public/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running on http://localhost:${PORT}`);
});