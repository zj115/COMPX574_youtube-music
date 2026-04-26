#!/bin/bash
# 双击启动脚本 — 一键启动妆宜生日提醒系统
# Mac 用户可双击运行；首次需在终端 chmod +x 启动.command

cd "$(dirname "$0")"

echo "🎂 妆宜生日提醒 - 启动中..."
echo "================================"

# 检查 node
if ! command -v node >/dev/null 2>&1; then
  echo "❌ 没有检测到 Node.js。"
  echo "请先安装 Node.js：https://nodejs.org/"
  read -p "按回车键退出..." x
  exit 1
fi

# 首次自动 install（用 .deps-ok 标记，确保依赖确实在本机装好）
if [ ! -f "backend/.deps-ok" ]; then
  echo "📦 第一次启动，正在安装后端依赖（大约 1-3 分钟）..."
  rm -rf backend/node_modules backend/package-lock.json 2>/dev/null
  (cd backend && npm install) && touch backend/.deps-ok
fi
if [ ! -f "frontend/.deps-ok" ]; then
  echo "📦 第一次启动，正在安装前端依赖（大约 1-3 分钟）..."
  rm -rf frontend/node_modules frontend/package-lock.json 2>/dev/null
  (cd frontend && npm install) && touch frontend/.deps-ok
fi

# .env
if [ ! -f "backend/.env" ]; then
  cp backend/.env.example backend/.env
  echo "📝 已创建 backend/.env，请稍后到设置页填写 PushPlus token"
fi

# 首次：自动导入种子数据（仅当数据库不存在）
if [ ! -f "backend/data/birthdays.db" ]; then
  echo "📥 首次启动，正在导入两个店铺的初始数据..."
  (cd backend && npm run import-seed)
fi

# 后台启动后端
echo ""
echo "🚀 启动后端 (端口 4000)..."
(cd backend && npm start) &
BACK_PID=$!

sleep 2

# 启动前端 dev server
echo "🚀 启动前端 (端口 5173)..."
(cd frontend && npm run dev) &
FRONT_PID=$!

sleep 3

# 自动打开浏览器
open http://localhost:5173

echo ""
echo "================================"
echo "✅ 系统已启动！"
echo "   后台地址: http://localhost:5173"
echo "   关闭此终端窗口即可停止服务。"
echo "================================"

# 等待 ctrl+c
trap "kill $BACK_PID $FRONT_PID 2>/dev/null; exit" INT TERM
wait
