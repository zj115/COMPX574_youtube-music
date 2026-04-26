const cron = require('node-cron');
const db = require('../db');
const { DAILY_CRON, TZ, PUSH_WHEN_EMPTY, SHOPS } = require('../config');
const { sendPush, buildBirthdayContent, buildEmptyContent } = require('../services/pushplus');

function tomorrowMD() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return {
    month: d.getMonth() + 1,
    day: d.getDate(),
    label: `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`,
  };
}

async function runCheck({ manual = false } = {}) {
  const { month, day, label } = tomorrowMD();
  const rows = db.prepare(`
    SELECT * FROM birthdays WHERE month = ? AND day = ?
    ORDER BY shop, name COLLATE NOCASE
  `).all(month, day);

  const groups = {};
  for (const s of SHOPS) groups[s] = [];
  for (const r of rows) {
    if (!groups[r.shop]) groups[r.shop] = [];
    groups[r.shop].push(r);
  }

  let title, html, total;
  if (rows.length === 0) {
    if (!PUSH_WHEN_EMPTY && !manual) {
      console.log(`[定时任务] ${label} 无人生日，且未开启空推送，跳过。`);
      return { skipped: true, total: 0, label };
    }
    title = `明日生日提醒（${month}月${day}日）`;
    html = buildEmptyContent(label);
    total = 0;
  } else {
    const built = buildBirthdayContent(groups, label);
    html = built.html;
    total = built.total;
    title = `明日生日提醒：共${total}人（${month}月${day}日）`;
  }

  const result = await sendPush({ title, content: html });
  console.log(`[推送] ${title} -> ${result.success ? '成功' : '失败'}`);
  return { ...result, total, label, title };
}

function startDailyJob() {
  if (!cron.validate(DAILY_CRON)) {
    console.warn(`⚠️ 无效的 cron 表达式: ${DAILY_CRON}，跳过定时任务`);
    return;
  }
  cron.schedule(
    DAILY_CRON,
    () => {
      console.log(`[定时任务] 触发：${new Date().toLocaleString('zh-CN')}`);
      runCheck().catch((e) => console.error('[定时任务] 执行失败:', e));
    },
    { timezone: TZ }
  );
  console.log(`⏰ 定时任务已启动: cron="${DAILY_CRON}", 时区=${TZ}`);
}

module.exports = { startDailyJob, runCheck };
