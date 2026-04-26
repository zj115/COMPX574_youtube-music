const express = require('express');
const multer = require('multer');
const db = require('../db');
const { SHOPS } = require('../config');
const { parseBirthdayExcel } = require('../services/excelParser');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/**
 * POST /api/upload
 *  body (multipart): file=<excel>, shop=<店铺名>, mode=append|replace
 *    - append:  按 shop+name+month+day 去重，重复跳过；新姓名插入；备注合并
 *    - replace: 删除该店铺所有旧数据再插入
 */
router.post('/', upload.single('file'), (req, res, next) => {
  try {
    const { shop, mode = 'append' } = req.body;
    if (!shop || !SHOPS.includes(shop)) {
      return res.status(400).json({ error: `shop 必填，且必须是: ${SHOPS.join(' / ')}` });
    }
    if (!req.file) {
      return res.status(400).json({ error: '未收到上传文件' });
    }

    const { rows, errors } = parseBirthdayExcel(req.file.buffer);
    if (rows.length === 0) {
      return res.status(400).json({
        error: '没有解析到有效的生日数据，请检查 Excel 格式（需要至少包含 姓名/月份/日期 三列）',
        errors,
      });
    }

    const stats = { inserted: 0, skipped: 0, replaced: 0, errors };

    const tx = db.transaction(() => {
      if (mode === 'replace') {
        const del = db.prepare('DELETE FROM birthdays WHERE shop = ?');
        const r = del.run(shop);
        stats.replaced = r.changes;
      }

      const insert = db.prepare(`
        INSERT INTO birthdays (shop, name, month, day, note)
        VALUES (@shop, @name, @month, @day, @note)
        ON CONFLICT(shop, name, month, day) DO NOTHING
      `);

      for (const row of rows) {
        const r = insert.run({
          shop,
          name: row.name,
          month: row.month,
          day: row.day,
          note: row.note || '',
        });
        if (r.changes > 0) stats.inserted += 1;
        else stats.skipped += 1;
      }
    });
    tx();

    res.json({
      ok: true,
      shop,
      mode,
      total_parsed: rows.length,
      ...stats,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
