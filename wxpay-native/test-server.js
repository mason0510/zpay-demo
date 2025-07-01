import express from 'express';

const app = express();
const PORT = 3001;

app.get('/api/ping', (req, res) => {
  res.send('pong from test server');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running on http://localhost:${PORT}`);
});