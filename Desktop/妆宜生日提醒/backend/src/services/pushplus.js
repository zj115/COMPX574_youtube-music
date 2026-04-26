const axios = require('axios');
const db = require('../db');

const PUSHPLUS_URL = 'http://www.pushplus.plus/send';

function getToken() {
  // 优先从数据库读取（支持运行时修改），否则用环境变量
  const row = db.prepare("SELECT value FROM settings WHERE key = 'pushplus_token'").get();
  if (row && row.value) return row.value;
  return process.env.PUSHPLUS_TOKEN || '';
}

function setToken(token) {
  db.prepare(`
    INSERT INTO settings (key, value) VALUES ('pushplus_token', @v)
    ON CONFLICT(key) DO UPDATE SET value = @v
  `).run({ v: token || '' });
}

async function sendPush({ title, content, template = 'html' }) {
  const token = getToken();
  if (!token) {
    return { success: false, error: '尚未配置 PUSHPLUS_TOKEN，请到设置页填写' };
  }

  try {
    const resp = await axios.post(
      PUSHPLUS_URL,
      { token, title, content, template },
      { timeout: 10000 }
    );
    const ok = resp.data && resp.data.code === 200;
    db.prepare(`
      INSERT INTO push_logs (title, content, success, response)
      VALUES (?, ?, ?, ?)
    `).run(title, content, ok ? 1 : 0, JSON.stringify(resp.data));
    return { success: ok, response: resp.data };
  } catch (err) {
    db.prepare(`
      INSERT INTO push_logs (title, content, success, response)
      VALUES (?, ?, ?, ?)
    `).run(title, content, 0, String(err.message));
    return { success: false, error: err.message };
  }
}

/**
 * 把按店铺分组的生日列表渲染为 PushPlus 内容
 * groups: { 店铺A: [{name, month, day}, ...], 店铺B: [...] }
 */
function buildBirthdayContent(groups, dateLabel) {
  const lines = [];
  lines.push(`<h3>明日生日提醒 🎂</h3>`);
  lines.push(`<p style="color:#888">${dateLabel}</p>`);

  let total = 0;
  for (const [shop, items] of Object.entries(groups)) {
    if (!items || items.length === 0) continue;
    total += items.length;
    lines.push(`<h4>【${shop}】</h4>`);
    lines.push('<ul style="line-height:1.8;font-size:15px">');
    for (const it of items) {
      const note = it.note ? ` <span style="color:#888">（${it.note}）</span>` : '';
      lines.push(`<li><b>${it.name}</b>：${it.month}月${it.day}日${note}</li>`);
    }
    lines.push('</ul>');
  }
  lines.push('<p style="color:#666;font-size:13px">请记得明天在群里发送生日祝福。</p>');
  return { html: lines.join(''), total };
}

function buildEmptyContent(dateLabel) {
  return `<h3>明日生日提醒 🎂</h3><p>${dateLabel}</p><p>明天暂无人过生日 ✨</p>`;
}

module.exports = {
  sendPush,
  buildBirthdayContent,
  buildEmptyContent,
  getToken,
  setToken,
};
