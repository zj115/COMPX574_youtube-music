require('dotenv').config();
const path = require('path');

const SHOPS = ['玉兰店', '广电路店'];

module.exports = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  DB_PATH: path.join(__dirname, '..', 'data', 'birthdays.db'),
  UPLOAD_DIR: path.join(__dirname, '..', 'uploads'),
  PUSHPLUS_TOKEN: process.env.PUSHPLUS_TOKEN || '',
  DAILY_CRON: process.env.DAILY_CRON || '0 20 * * *',
  TZ: process.env.TZ || 'Asia/Shanghai',
  PUSH_WHEN_EMPTY: (process.env.PUSH_WHEN_EMPTY || 'false').toLowerCase() === 'true',
  SHOPS,
};
