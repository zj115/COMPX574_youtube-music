const express = require('express');
const { getToken, setToken } = require('../services/pushplus');
const { DAILY_CRON, PUSH_WHEN_EMPTY, SHOPS } = require('../config');

const router = express.Router();

// 获取当前设置（token 只回显是否已配置 + 后 4 位）
router.get('/', (req, res) => {
  const token = getToken();
  res.json({
    pushplus_token_set: !!token,
    pushplus_token_tail: token ? token.slice(-4) : '',
    daily_cron: DAILY_CRON,
    push_when_empty: PUSH_WHEN_EMPTY,
    shops: SHOPS,
  });
});

// 更新 PushPlus token
router.post('/pushplus-token', (req, res) => {
  const { token } = req.body || {};
  if (typeof token !== 'string') {
    return res.status(400).json({ error: 'token 必填（字符串，留空表示清除）' });
  }
  setToken(token.trim());
  res.json({ ok: true });
});

module.exports = router;
