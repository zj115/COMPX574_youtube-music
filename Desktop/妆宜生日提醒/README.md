# 🎂 妆宜生日提醒系统

一个简单的生日提醒后台 —— 管理"玉兰店"和"广电路店"两家店的生日数据，每天晚上 8:00 通过 PushPlus 微信推送提醒"明天谁过生日"。

## ✨ 功能

- 🏪 两个店铺独立管理
- 📥 上传 Excel 一次性导入（自动识别"中文月份/数字月份"）
- 🔍 列表 + 搜索 + 新增 / 编辑 / 删除
- 📊 首页查看：今天 / 明天 / 本周生日
- 🔔 每天 20:00 自动检查"明天的生日"
- 📱 通过 PushPlus 推送到你的微信
- 🧪 一键测试推送、立即触发推送
- 💾 数据存在本地 SQLite，备份就是复制一个文件

## 🚀 一键启动（最简单方式）

**第一次使用：**

1. 安装 Node.js（如果还没装）
   - 下载地址：https://nodejs.org/zh-cn/
   - 选择 LTS（长期支持）版本，全程下一步即可

2. 双击文件夹里的 `启动.command`
   - 第一次启动会自动安装依赖、导入数据，可能需要等 2-3 分钟
   - 之后会自动打开浏览器到 http://localhost:5173

3. 在浏览器里进入"⚙️ 设置 / 推送"页，填写 PushPlus token

> ⚠️ Mac 第一次双击 `启动.command` 可能提示"无法打开"。
> 解决：右键 -> 打开 -> 仍然打开。
> 或者打开终端执行：`chmod +x ~/Desktop/妆宜生日提醒/启动.command`

**关闭：** 直接关闭终端窗口即可。

## 🔑 PushPlus 配置（5 分钟搞定）

1. 微信扫码登录 → https://www.pushplus.plus/
2. 在"一对一推送"页找到你的 token（长得像 `abc123...`）
3. 在系统的"⚙️ 设置 / 推送"页粘贴并保存
4. 点"测试推送"，看微信能不能收到 ✅

## 🗂️ 文件夹结构

```
妆宜生日提醒/
├── 启动.command            ← 双击启动
├── backend/                ← 后端（Node + Express + SQLite）
│   ├── data/birthdays.db   ← 你的所有数据都在这一个文件里！备份就是复制它
│   ├── seed/               ← 初始 Excel 数据（已预导入）
│   └── src/
└── frontend/               ← 前端（React + Vite）
```

## 📝 Excel 上传格式

最简单的格式（任意一种都行）：

| 姓名 | 月份 | 日期 | 备注（选填） |
|------|------|------|------|
| 张三 | 1 | 18 | |
| 李四 | 一月 | 二十 | 农历转阳历 |

- **月份**：支持数字（1-12）或中文（一月、十二月）
- **日期**：支持数字（1-31）或中文（十八、三十）
- **表头**：可以不在第一行，系统会自动识别
- **农历生日**：第一版只支持阳历，请先在 Excel 里把农历换算成"当年的阳历日期"再上传

**两种导入模式：**
- **追加（推荐）**：按"姓名+店铺+月+日"去重，重复的会自动跳过
- **覆盖**：先清空该店铺所有数据再导入（小心使用！）

## 🛠 高级 / 开发者

```bash
# 安装所有依赖
npm run install:all

# 导入 backend/seed/ 下的两个 Excel
npm run import-seed

# 开发模式（前后端分别启动）
npm run dev:backend     # http://localhost:4000
npm run dev:frontend    # http://localhost:5173

# 生产模式：构建前端 + 启动后端
npm run build:frontend
npm start               # http://localhost:4000 (会同时托管前端)
```

### 环境变量（backend/.env）

```env
PORT=4000
PUSHPLUS_TOKEN=          # 也可以在网页设置页填，会存到数据库
DAILY_CRON=0 20 * * *    # 每天 20:00（Cron 格式）
TZ=Asia/Shanghai
PUSH_WHEN_EMPTY=false    # 明天没人生日时是否仍推送一条"暂无"
```

### 数据库 / 备份

- 所有数据 = `backend/data/birthdays.db`（一个文件）
- 备份 = 复制这个文件到 U 盘 / 网盘
- 想直接看数据：用你已经装好的 **MongoDB Compass** 不行（那是 Mongo 的），用免费的 [DB Browser for SQLite](https://sqlitebrowser.org/) 或 VS Code 插件都可以打开

## ❓ 常见问题

**Q：电脑关机后还能收到推送吗？**
A：不能。这个系统跑在你的电脑上，电脑关机或休眠后定时任务就停了。
建议把电脑睡眠设置改成"永不睡眠"，或者把项目部署到一台 24 小时开机的机器（比如树莓派、云服务器）。

**Q：换了一台电脑怎么办？**
A：把整个文件夹复制过去，再双击 `启动.command` 即可。数据全在 `backend/data/birthdays.db`。

**Q：可以加更多店铺吗？**
A：可以。改 `backend/src/config.js` 里 `SHOPS` 数组，前端 `BirthdayList.jsx`、`Upload.jsx` 顶部的 `SHOPS` 也同步改一下。

**Q：能不能改成 19:00 推送？**
A：改 `backend/.env` 里的 `DAILY_CRON=0 19 * * *` 然后重启。
