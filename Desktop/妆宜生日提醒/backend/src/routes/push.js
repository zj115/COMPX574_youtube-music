const express = require('express');
const db = require('../db');
const { sendPush } = require('../services/pushplus');
const { runCheck } = require('../jobs/dailyCheck');

const router = express.Router();

// 测试推送：发送一条测试消息
router.post('/test', async (req, res) => {
  const result = await sendPush({
    title: '✅ 妆宜生日提醒：测试推送',
    content: `<h3>测试成功</h3><p>这是一条来自妆宜生日提醒系统的测试消息。</p><p>时间：${new Date().toLocaleString('zh-CN')}</p>`,
  });
  res.json(result);
});

// 立即触发一次"明日生日"检查并推送
router.post('/run-now', async (req, res) => {
  const result = await runCheck({ manual: true });
  res.json(result);
});

// 推送历史日志
router.get('/logs', (req, res) => {
  const rows = db.prepare(`
    SELECT id, pushed_at, title, success, response
    FROM push_logs ORDER BY id DESC LIMIT 50
  `).all();
  res.json({ data: rows });
});

module.exports = router;
