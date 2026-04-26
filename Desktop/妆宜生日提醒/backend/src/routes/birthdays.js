const express = require('express');
const db = require('../db');
const { SHOPS } = require('../config');

const router = express.Router();

function validate(body) {
  const errors = [];
  if (!body.shop || !SHOPS.includes(body.shop)) errors.push(`shop 必须是: ${SHOPS.join(' / ')}`);
  if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') errors.push('姓名必填');
  const m = parseInt(body.month, 10);
  const d = parseInt(body.day, 10);
  if (!Number.isInteger(m) || m < 1 || m > 12) errors.push('月份必须是 1-12');
  if (!Number.isInteger(d) || d < 1 || d > 31) errors.push('日期必须是 1-31');
  return { errors, m, d };
}

// 列表 + 搜索 + 按店铺过滤
// GET /api/birthdays?shop=玉兰店&keyword=张&sort=date|name
router.get('/', (req, res, next) => {
  try {
    const { shop, keyword, sort = 'date' } = req.query;
    const where = [];
    const params = {};
    if (shop) {
      where.push('shop = @shop');
      params.shop = shop;
    }
    if (keyword) {
      where.push('name LIKE @kw');
      params.kw = `%${keyword}%`;
    }
    const orderBy = sort === 'name' ? 'name COLLATE NOCASE' : 'month, day, name COLLATE NOCASE';
    const sql = `
      SELECT * FROM birthdays
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY ${orderBy}
    `;
    const rows = db.prepare(sql).all(params);
    res.json({ data: rows, total: rows.length });
  } catch (e) {
    next(e);
  }
});

// 新增
router.post('/', (req, res, next) => {
  try {
    const { errors, m, d } = validate(req.body);
    if (errors.length) return res.status(400).json({ error: errors.join('；') });
    const stmt = db.prepare(`
      INSERT INTO birthdays (shop, name, month, day, note)
      VALUES (@shop, @name, @month, @day, @note)
    `);
    try {
      const r = stmt.run({
        shop: req.body.shop,
        name: req.body.name.trim(),
        month: m,
        day: d,
        note: req.body.note || '',
      });
      const row = db.prepare('SELECT * FROM birthdays WHERE id = ?').get(r.lastInsertRowid);
      res.json({ ok: true, data: row });
    } catch (err) {
      if (String(err.message).includes('UNIQUE')) {
        return res.status(409).json({ error: '已存在相同的生日记录（店铺+姓名+月份+日期）' });
      }
      throw err;
    }
  } catch (e) {
    next(e);
  }
});

// 编辑
router.put('/:id', (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const exists = db.prepare('SELECT * FROM birthdays WHERE id = ?').get(id);
    if (!exists) return res.status(404).json({ error: '记录不存在' });

    const merged = { ...exists, ...req.body };
    const { errors, m, d } = validate(merged);
    if (errors.length) return res.status(400).json({ error: errors.join('；') });

    try {
      db.prepare(`
        UPDATE birthdays
        SET shop=@shop, name=@name, month=@month, day=@day, note=@note,
            updated_at=datetime('now', 'localtime')
        WHERE id=@id
      `).run({
        id,
        shop: merged.shop,
        name: String(merged.name).trim(),
        month: m,
        day: d,
        note: merged.note || '',
      });
      const row = db.prepare('SELECT * FROM birthdays WHERE id = ?').get(id);
      res.json({ ok: true, data: row });
    } catch (err) {
      if (String(err.message).includes('UNIQUE')) {
        return res.status(409).json({ error: '修改后会与已有记录重复（店铺+姓名+月份+日期）' });
      }
      throw err;
    }
  } catch (e) {
    next(e);
  }
});

// 删除
router.delete('/:id', (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const r = db.prepare('DELETE FROM birthdays WHERE id = ?').run(id);
    if (r.changes === 0) return res.status(404).json({ error: '记录不存在' });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// 批量删除（按店铺）
router.delete('/', (req, res, next) => {
  try {
    const { shop } = req.query;
    if (!shop || !SHOPS.includes(shop)) {
      return res.status(400).json({ error: `shop 必填，且必须是: ${SHOPS.join(' / ')}` });
    }
    const r = db.prepare('DELETE FROM birthdays WHERE shop = ?').run(shop);
    res.json({ ok: true, deleted: r.changes });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
