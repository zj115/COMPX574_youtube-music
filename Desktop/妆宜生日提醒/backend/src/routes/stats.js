const express = require('express');
const db = require('../db');
const { SHOPS } = require('../config');

const router = express.Router();

function todayMD(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return { month: d.getMonth() + 1, day: d.getDate(), date: d };
}

function getByMD(month, day) {
  return db.prepare(`
    SELECT * FROM birthdays WHERE month = ? AND day = ?
    ORDER BY shop, name COLLATE NOCASE
  `).all(month, day);
}

function getInRange(days) {
  // 取从今天起未来 N 天（含今天）的所有生日，跨年时拼一拼
  const out = [];
  for (let i = 0; i < days; i++) {
    const { month, day, date } = todayMD(i);
    const rows = getByMD(month, day);
    if (rows.length) {
      out.push({
        date: date.toISOString().slice(0, 10),
        month,
        day,
        offset: i,
        items: rows,
      });
    }
  }
  return out;
}

// GET /api/stats/summary
//   today / tomorrow / week (未来 7 天，含今天)
router.get('/summary', (req, res) => {
  const today = todayMD(0);
  const tomorrow = todayMD(1);

  const todayList = getByMD(today.month, today.day);
  const tomorrowList = getByMD(tomorrow.month, tomorrow.day);

  const week = getInRange(7);

  // 总数 & 按店铺数
  const totalRow = db.prepare('SELECT COUNT(*) AS n FROM birthdays').get();
  const perShop = {};
  for (const s of SHOPS) {
    const r = db.prepare('SELECT COUNT(*) AS n FROM birthdays WHERE shop = ?').get(s);
    perShop[s] = r.n;
  }

  res.json({
    today: { month: today.month, day: today.day, items: todayList },
    tomorrow: { month: tomorrow.month, day: tomorrow.day, items: tomorrowList },
    week,
    total: totalRow.n,
    perShop,
  });
});

// GET /api/stats/by-month?month=1
router.get('/by-month', (req, res) => {
  const month = parseInt(req.query.month, 10);
  if (!month || month < 1 || month > 12) return res.status(400).json({ error: 'month 必须是 1-12' });
  const rows = db.prepare(`
    SELECT * FROM birthdays WHERE month = ?
    ORDER BY day, shop, name COLLATE NOCASE
  `).all(month);
  res.json({ data: rows });
});

module.exports = router;
