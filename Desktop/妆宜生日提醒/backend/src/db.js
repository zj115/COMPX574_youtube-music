const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const { DB_PATH } = require('./config');

// 确保 data 目录存在
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// 建表：生日记录
db.exec(`
  CREATE TABLE IF NOT EXISTS birthdays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shop TEXT NOT NULL,
    name TEXT NOT NULL,
    month INTEGER NOT NULL,
    day INTEGER NOT NULL,
    note TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime')),
    UNIQUE (shop, name, month, day)
  );

  CREATE INDEX IF NOT EXISTS idx_birthdays_shop ON birthdays(shop);
  CREATE INDEX IF NOT EXISTS idx_birthdays_md ON birthdays(month, day);
`);

// 建表：通用设置（key-value）
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// 建表：推送日志
db.exec(`
  CREATE TABLE IF NOT EXISTS push_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pushed_at TEXT DEFAULT (datetime('now', 'localtime')),
    title TEXT,
    content TEXT,
    success INTEGER,
    response TEXT
  );
`);

module.exports = db;
