import React, { useState, useContext } from 'react';
import { api } from '../api.js';
import { ToastContext } from '../App.jsx';

const SHOPS = ['玉兰店', '广电路店'];

export default function Upload() {
  const toast = useContext(ToastContext);
  const [shop, setShop] = useState('玉兰店');
  const [mode, setMode] = useState('append');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const submit = async () => {
    if (!file) return toast('请先选择 Excel 文件', 'error');
    if (mode === 'replace' && !confirm(`确定要"全量覆盖"${shop}的所有数据吗？\n这会先删除该店铺已有数据再导入。`)) return;
    setBusy(true);
    setResult(null);
    try {
      const r = await api.upload(file, shop, mode);
      setResult(r);
      toast(`导入成功：新增 ${r.inserted} 条，跳过 ${r.skipped} 条`);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h2 className="page-title">上传 Excel</h2>

      <div className="card">
        <div className="field">
          <label>店铺</label>
          <select value={shop} onChange={(e) => setShop(e.target.value)}>
            {SHOPS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="field">
          <label>导入方式</label>
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="append">追加（按 姓名+月+日 去重，安全）</option>
            <option value="replace">覆盖（先清空该店铺所有数据再导入）</option>
          </select>
        </div>

        <div className="field">
          <label>选择 .xlsx 文件</label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        <button className="btn primary" disabled={busy} onClick={submit}>
          {busy ? '上传中...' : '开始导入'}
        </button>
      </div>

      <div className="card">
        <h3>📌 Excel 格式要求</h3>
        <p style={{ color: '#666', lineHeight: 1.7 }}>
          表格至少需要包含三列：<b>姓名 / 月份 / 日期</b>。<br />
          <b>月份</b>支持数字（如 1, 2, 12）或中文（如 一月、十二月）。<br />
          <b>日期</b>支持数字（如 1, 18, 30）或中文（如 十八、三十）。<br />
          <b>备注</b>列可选。<br />
          表头不一定要在第一行，系统会自动识别。<br />
          如果有"农历"生日，请先在 Excel 里换算成"当年阳历日期"再上传。
        </p>
      </div>

      {result && (
        <div className="card">
          <h3>📊 本次导入结果</h3>
          <ul style={{ lineHeight: 1.8 }}>
            <li>店铺：<b>{result.shop}</b></li>
            <li>方式：{result.mode === 'replace' ? '覆盖' : '追加'}</li>
            {result.replaced > 0 && <li>覆盖前删除：{result.replaced} 条</li>}
            <li>解析有效行：{result.total_parsed}</li>
            <li>新增：<span style={{ color: '#10b981' }}>{result.inserted}</span></li>
            <li>跳过（重复）：{result.skipped}</li>
            <li>异常行：{result.errors?.length || 0}</li>
          </ul>
          {result.errors?.length > 0 && (
            <details>
              <summary>查看异常行（{result.errors.length}）</summary>
              <pre style={{ background: '#f3f4f6', padding: 12, borderRadius: 8, fontSize: 12, overflow: 'auto' }}>
                {JSON.stringify(result.errors, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
