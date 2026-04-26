import React, { useEffect, useState, useContext } from 'react';
import { api } from '../api.js';
import { ToastContext } from '../App.jsx';

export default function Settings() {
  const toast = useContext(ToastContext);
  const [settings, setSettings] = useState(null);
  const [token, setToken] = useState('');
  const [logs, setLogs] = useState([]);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const s = await api.getSettings();
      setSettings(s);
      const l = await api.pushLogs();
      setLogs(l.data);
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  useEffect(() => { load(); }, []);

  const saveToken = async () => {
    if (!token.trim()) return toast('请输入 token', 'error');
    try {
      await api.setToken(token.trim());
      setToken('');
      toast('已保存');
      load();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const testPush = async () => {
    setBusy(true);
    try {
      const r = await api.testPush();
      if (r.success) toast('✅ 测试推送成功，请检查微信');
      else toast('❌ 推送失败：' + (r.error || JSON.stringify(r.response)), 'error');
      load();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const runNow = async () => {
    setBusy(true);
    try {
      const r = await api.runNow();
      if (r.skipped) toast(`明日（${r.label}）暂无生日，已跳过推送`);
      else if (r.success) toast(`✅ 已推送：${r.title}`);
      else toast('❌ 推送失败：' + (r.error || ''), 'error');
      load();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  if (!settings) return <div>加载中...</div>;

  return (
    <div>
      <h2 className="page-title">设置 / 推送</h2>

      <div className="card">
        <h3>🔑 PushPlus 推送配置</h3>
        <p style={{ color: '#666' }}>
          1. 打开 <a href="https://www.pushplus.plus/" target="_blank" rel="noreferrer">https://www.pushplus.plus/</a> 用微信登录。<br />
          2. 复制"一对一推送"页面的 token。<br />
          3. 粘贴到下面保存，再点"测试推送"看看微信能不能收到。
        </p>
        <div style={{ marginTop: 12 }}>
          <span style={{ color: '#888' }}>当前状态：</span>
          {settings.pushplus_token_set ? (
            <span style={{ color: '#10b981' }}>✅ 已配置（结尾 …{settings.pushplus_token_tail}）</span>
          ) : (
            <span style={{ color: '#ef4444' }}>❌ 尚未配置</span>
          )}
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <input
            style={{ flex: 1, minWidth: 280, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }}
            type="password"
            placeholder="粘贴新的 PushPlus token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <button className="btn primary" onClick={saveToken}>保存 Token</button>
        </div>
      </div>

      <div className="card">
        <h3>🧪 测试与手动推送</h3>
        <div className="row">
          <button className="btn" disabled={busy} onClick={testPush}>测试推送（发送一条测试消息）</button>
          <button className="btn primary" disabled={busy} onClick={runNow}>立即推送"明日生日"</button>
        </div>
        <p style={{ color: '#888', fontSize: 13, marginTop: 12 }}>
          系统会按 cron <code>{settings.daily_cron}</code>（时区 Asia/Shanghai）每天自动检查明天的生日并推送。
        </p>
      </div>

      <div className="card">
        <h3>📜 推送日志（最近 50 条）</h3>
        {logs.length === 0 ? (
          <div className="empty-hint">暂无推送记录</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 160 }}>时间</th>
                <th>标题</th>
                <th style={{ width: 80 }}>结果</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td>{l.pushed_at}</td>
                  <td>{l.title}</td>
                  <td>{l.success ? '✅' : '❌'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
