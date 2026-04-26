import React, { useEffect, useState, useContext } from 'react';
import { api } from '../api.js';
import { ToastContext } from '../App.jsx';

const SHOPS = ['玉兰店', '广电路店'];
const EMPTY_FORM = { shop: '玉兰店', name: '', month: '', day: '', note: '' };

export default function BirthdayList() {
  const toast = useContext(ToastContext);
  const [shop, setShop] = useState('');
  const [keyword, setKeyword] = useState('');
  const [sort, setSort] = useState('date');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = async () => {
    setLoading(true);
    try {
      const d = await api.list({
        ...(shop ? { shop } : {}),
        ...(keyword ? { keyword } : {}),
        sort,
      });
      setData(d.data);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [shop, sort]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, shop: shop || '玉兰店' });
    setShowModal(true);
  };
  const openEdit = (row) => {
    setEditing(row);
    setForm({
      shop: row.shop,
      name: row.name,
      month: row.month,
      day: row.day,
      note: row.note || '',
    });
    setShowModal(true);
  };

  const submit = async () => {
    try {
      if (editing) {
        await api.update(editing.id, form);
        toast('已保存');
      } else {
        await api.create(form);
        toast('已新增');
      }
      setShowModal(false);
      load();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  const remove = async (row) => {
    if (!confirm(`确定删除 ${row.shop} 的 ${row.name}？`)) return;
    try {
      await api.remove(row.id);
      toast('已删除');
      load();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  return (
    <div>
      <h2 className="page-title">生日列表</h2>

      <div className="card">
        <div className="row">
          <div className="field" style={{ marginBottom: 0, minWidth: 140 }}>
            <label>店铺</label>
            <select value={shop} onChange={(e) => setShop(e.target.value)}>
              <option value="">全部</option>
              {SHOPS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="field" style={{ marginBottom: 0, flex: 1, minWidth: 200 }}>
            <label>搜索姓名</label>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
              placeholder="输入姓名按回车搜索"
            />
          </div>
          <div className="field" style={{ marginBottom: 0, minWidth: 120 }}>
            <label>排序</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="date">按月日</option>
              <option value="name">按姓名</option>
            </select>
          </div>
          <button className="btn" onClick={load}>🔍 搜索</button>
          <button className="btn primary" onClick={openCreate}>＋ 新增</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 80 }}>店铺</th>
              <th>姓名</th>
              <th style={{ width: 120 }}>生日</th>
              <th>备注</th>
              <th style={{ width: 130 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr><td colSpan={5} className="empty-hint">{loading ? '加载中...' : '暂无数据'}</td></tr>
            )}
            {data.map((row) => (
              <tr key={row.id}>
                <td><span className={`badge shop-${row.shop}`}>{row.shop}</span></td>
                <td><strong>{row.name}</strong></td>
                <td>{row.month}月{row.day}日</td>
                <td style={{ color: '#888' }}>{row.note}</td>
                <td className="actions">
                  <button className="btn ghost" onClick={() => openEdit(row)}>编辑</button>
                  <button className="btn ghost" style={{ color: '#ef4444' }} onClick={() => remove(row)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ color: '#888', fontSize: 12, marginTop: 8 }}>共 {data.length} 条</div>

      {showModal && (
        <div className="modal-mask" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? '编辑生日' : '新增生日'}</h3>
            <div className="field">
              <label>店铺</label>
              <select value={form.shop} onChange={(e) => setForm({ ...form, shop: e.target.value })}>
                {SHOPS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="field">
              <label>姓名</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="row">
              <div className="field" style={{ flex: 1 }}>
                <label>月份 (1-12)</label>
                <input type="number" min="1" max="12" value={form.month}
                  onChange={(e) => setForm({ ...form, month: e.target.value })} />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label>日期 (1-31)</label>
                <input type="number" min="1" max="31" value={form.day}
                  onChange={(e) => setForm({ ...form, day: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label>备注（选填）</label>
              <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setShowModal(false)}>取消</button>
              <button className="btn primary" onClick={submit}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
