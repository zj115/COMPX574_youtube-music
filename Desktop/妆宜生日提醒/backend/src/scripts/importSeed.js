// 把 backend/seed/ 下的两个 Excel 一次性导入数据库
// 用法：npm run import-seed
const fs = require('fs');
const path = require('path');
const db = require('../db');
const { parseBirthdayExcel } = require('../services/excelParser');
const { SHOPS } = require('../config');

const SEED_DIR = path.join(__dirname, '..', '..', 'seed');

function importOne(shop, filename) {
  const fp = path.join(SEED_DIR, filename);
  if (!fs.existsSync(fp)) {
    console.warn(`⚠️ 跳过：找不到 ${fp}`);
    return;
  }
  const buf = fs.readFileSync(fp);
  const { rows, errors } = parseBirthdayExcel(buf);
  console.log(`\n=== ${shop} (${filename}) ===`);
  console.log(`解析到 ${rows.length} 条，错误 ${errors.length} 条`);

  let inserted = 0, skipped = 0;
  const insert = db.prepare(`
    INSERT INTO birthdays (shop, name, month, day, note)
    VALUES (@shop, @name, @month, @day, @note)
    ON CONFLICT(shop, name, month, day) DO NOTHING
  `);
  const tx = db.transaction(() => {
    for (const row of rows) {
      const r = insert.run({ shop, ...row });
      if (r.changes > 0) inserted++; else skipped++;
    }
  });
  tx();
  console.log(`新增：${inserted}，跳过（重复）：${skipped}`);
  if (errors.length > 0) {
    console.log('错误样例（前 5 条）：');
    errors.slice(0, 5).forEach(e => console.log(' -', e));
  }
}

function main() {
  console.log('开始导入种子数据...');
  importOne('玉兰店', '玉兰店.xlsx');
  importOne('广电路店', '广电路店.xlsx');
  const total = db.prepare('SELECT COUNT(*) AS n FROM birthdays').get().n;
  console.log(`\n✅ 完成。当前数据库总记录数：${total}`);
  for (const s of SHOPS) {
    const n = db.prepare('SELECT COUNT(*) AS n FROM birthdays WHERE shop = ?').get(s).n;
    console.log(`   ${s}: ${n}`);
  }
}

main();
