const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { PORT, UPLOAD_DIR } = require('./config');
require('./db'); // 初始化数据库

const birthdaysRouter = require('./routes/birthdays');
const uploadRouter = require('./routes/upload');
const pushRouter = require('./routes/push');
const statsRouter = require('./routes/stats');
const settingsRouter = require('./routes/settings');

const { startDailyJob } = require('./jobs/dailyCheck');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/birthdays', birthdaysRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/push', pushRouter);
app.use('/api/stats', statsRouter);
app.use('/api/settings', settingsRouter);

// 提供前端构建产物（生产环境）
const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({
    error: err.message || '服务器内部错误',
  });
});

// 仅在直接运行时启动服务器（非 Vercel）
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ 后端已启动: http://localhost:${PORT}`);
    startDailyJob();
  });
}

module.exports = app;
