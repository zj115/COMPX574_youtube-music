# 妆宜生日提醒系统

自动提醒员工生日的系统，支持多店铺管理，微信推送提醒。

## 功能特性

- 📅 生日管理：按店铺分类管理员工生日信息
- 🔔 自动推送：每天定时检查明日生日并推送微信提醒
- 📊 数据统计：查看各店铺生日分布
- 📤 Excel 导入：批量导入员工生日数据
- ⚙️ 灵活配置：自定义推送时间和时区

## 技术栈

- **后端**: Node.js + Express + SQLite + node-cron
- **前端**: React 18 + Vite + React Router
- **推送**: PushPlus 微信推送服务
- **部署**: Vercel

## 本地开发

### 1. 安装依赖

```bash
# 后端
cd backend && npm install

# 前端
cd frontend && npm install
```

### 2. 配置环境变量

复制 `backend/.env.example` 到 `backend/.env`，配置：

```env
PORT=4000
PUSHPLUS_TOKEN=你的token
DAILY_CRON=0 22 * * *
TZ=Pacific/Auckland
```

### 3. 导入初始数据（可选）

```bash
cd backend && npm run import-seed
```

### 4. 启动服务

```bash
# 后端
cd backend && npm start

# 前端（新终端）
cd frontend && npm run dev
```

访问 http://localhost:5173

## Vercel 部署

### 1. 推送到 GitHub

```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

### 2. 在 Vercel 导入项目

1. 访问 https://vercel.com
2. 点击 "Import Project"
3. 选择你的 GitHub 仓库
4. 配置环境变量：
   - `PUSHPLUS_TOKEN`: 你的 PushPlus token
   - `DAILY_CRON`: `0 22 * * *`
   - `TZ`: `Pacific/Auckland`

### 3. 部署完成

Vercel 会自动构建并部署，完成后会提供访问链接。

## 使用说明

1. 访问部署后的网址
2. 进入"设置/推送"页面
3. 去 https://www.pushplus.plus/ 获取 token
4. 完成实名认证：https://verify.pushplus.plus
5. 保存 token 并测试推送

## 注意事项

- PushPlus 需要实名认证才能推送
- Vercel 免费版有使用限制
- 定时任务在 Vercel 上可能需要额外配置（建议使用 Vercel Cron）
- 本地运行需要电脑保持开机

## License

MIT
