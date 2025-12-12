const path = require('path');
const fs = require('fs');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  console.warn('警告：找不到 .env 檔案，使用預設值');
}

const express = require('express');
const cors = require('cors');
const weatherRoutes = require('./routes/weather');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.GROQ_API_KEY || !process.env.CWA_API_KEY) {
  console.error('錯誤：環境變數未設定！');
  console.error('請在 server/.env 檔案中設定以下環境變數：');
  console.error('  - GROQ_API_KEY');
  console.error('  - CWA_API_KEY');
  process.exit(1);
}

console.log('API 金鑰狀態:', {
  GROQ: process.env.GROQ_API_KEY ? '已設定' : '未設定',
  CWA: process.env.CWA_API_KEY ? '已設定' : '未設定'
});

app.use(cors());
app.use(express.json());

app.use('/api/weather', weatherRoutes);
app.use('/api/ai', aiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`氣象AI助手後端服務運行於 http://localhost:${PORT}`);
  });
}

module.exports = app;

