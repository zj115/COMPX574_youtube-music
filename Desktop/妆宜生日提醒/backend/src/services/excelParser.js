const XLSX = require('xlsx');
const { chineseToNumber } = require('../utils/chineseNum');

const NAME_KEYS = ['姓名', '名字', '客户姓名', '员工姓名', '名称'];
const MONTH_KEYS = ['月份', '月', '出生月份'];
const DAY_KEYS = ['日期', '日', '号', '出生日'];
const NOTE_KEYS = ['备注', 'remark', '说明'];

function normalize(s) {
  return String(s ?? '').replace(/\s+/g, '').trim();
}

function findHeaderRow(rows) {
  // 在前 20 行里找一行同时含有 "姓名" 和（"月份"|"月"）的行
  const limit = Math.min(rows.length, 20);
  for (let i = 0; i < limit; i++) {
    const cells = rows[i].map(normalize);
    const hasName = cells.some((c) => NAME_KEYS.includes(c));
    const hasMonth = cells.some((c) => MONTH_KEYS.includes(c));
    if (hasName && hasMonth) return i;
  }
  return -1;
}

function detectColumns(headerRow) {
  const map = { name: -1, month: -1, day: -1, note: -1 };
  headerRow.forEach((cell, idx) => {
    const c = normalize(cell);
    if (map.name === -1 && NAME_KEYS.includes(c)) map.name = idx;
    if (map.month === -1 && MONTH_KEYS.includes(c)) map.month = idx;
    if (map.day === -1 && DAY_KEYS.includes(c)) map.day = idx;
    if (map.note === -1 && NOTE_KEYS.includes(c)) map.note = idx;
  });
  return map;
}

/**
 * 解析单个 Excel 文件 buffer，返回 { rows, errors }
 *  rows: [{ name, month, day, note }]
 *  errors: [{ row, reason, raw }]
 */
function parseBirthdayExcel(buffer) {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const rows = [];
  const errors = [];

  for (const sheetName of wb.SheetNames) {
    // 跳过明显的辅助 sheet
    if (/统计|备份|说明|月份统计/i.test(sheetName)) continue;

    const ws = wb.Sheets[sheetName];
    const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
    if (aoa.length === 0) continue;

    const headerIdx = findHeaderRow(aoa);
    if (headerIdx === -1) continue;

    const cols = detectColumns(aoa[headerIdx]);
    if (cols.name === -1 || cols.month === -1 || cols.day === -1) continue;

    for (let r = headerIdx + 1; r < aoa.length; r++) {
      const row = aoa[r];
      if (!row || row.every((c) => c === null || c === '' || c === undefined)) continue;

      const name = normalize(row[cols.name]);
      const month = chineseToNumber(row[cols.month]);
      const day = chineseToNumber(row[cols.day]);
      const note = cols.note >= 0 ? normalize(row[cols.note]) : '';

      if (!name) {
        // 跳过空姓名行（不计入错误）
        continue;
      }
      if (month == null || day == null || month < 1 || month > 12 || day < 1 || day > 31) {
        errors.push({
          row: r + 1,
          reason: `月份或日期无效（月=${row[cols.month]}, 日=${row[cols.day]}）`,
          raw: { name, month: row[cols.month], day: row[cols.day] },
        });
        continue;
      }

      rows.push({ name, month, day, note });
    }
    // 找到第一个有效 sheet 即返回，避免重复读取备份 sheet
    break;
  }

  return { rows, errors };
}

module.exports = { parseBirthdayExcel };
