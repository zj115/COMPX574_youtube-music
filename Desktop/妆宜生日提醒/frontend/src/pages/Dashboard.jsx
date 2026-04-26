import React, { useEffect, useState, useContext } from 'react';
import { api } from '../api.js';
import { ToastContext } from '../App.jsx';

function ShopBadge({ shop }) {
  return <span className={`badge shop-${shop}`}>{shop}</span>;
}

function BirthdayList({ items, emptyText }) {
  if (!items || items.length === 0) {
    return <div className="empty-hint">{emptyText}</div>;
  }
  return (
    <ul className="bday-list">
      {items.map((it) => (
        <li key={it.id}>
          <ShopBadge shop={it.shop} />
          <strong style={{ minWidth: 80 }}>{it.name}</strong>
          <span style={{ color: '#888' }}>{it.month}月{it.day}日</span>
          {it.note && <span style={{ color: '#aaa', fontSize: 12 }}>（{it.note}）</span>}
        </li>
      ))}
    </ul>
  );
}

export default function Dashboard() {
  const toast = useContext(ToastContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const d = await api.summary();
      setData(d);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (!data) {
    return <div>{loading ? '加载中...' : '暂无数据'}</div>;
  }

  return (
    <div>
      <h2 className="page-title">首页</h2>

      <div className="stat-grid">
        <div className="stat">
          <div className="label">总人数</div>
          <div className="value">{data.total}</div>
        </div>
        {Object.entries(data.perShop).map(([shop, n]) => (
          <div className="stat" key={shop}>
            <div className="label">{shop}</div>
            <div className="value">{n}</div>
          </div>
        ))}
        <div className="stat">
          <div className="label">今天生日</div>
          <div className="value" style={{ color: '#ec4899' }}>{data.today.items.length}</div>
        </div>
        <div className="stat">
          <div className="label">明天生日</div>
          <div className="value" style={{ color: '#f59e0b' }}>{data.tomorrow.items.length}</div>
        </div>
      </div>

      <div className="card">
        <h3>🎉 今天生日（{data.today.month}月{data.today.day}日）</h3>
        <BirthdayList items={data.today.items} emptyText="今天没有人过生日" />
      </div>

      <div className="card">
        <h3>⏰ 明天生日（{data.tomorrow.month}月{data.tomorrow.day}日）</h3>
        <BirthdayList items={data.tomorrow.items} emptyText="明天没有人过生日" />
      </div>

      <div className="card">
        <h3>📅 本周生日（未来 7 天）</h3>
        {data.week.length === 0 ? (
          <div className="empty-hint">未来 7 天没有人过生日</div>
        ) : (
          data.week.map((d) => (
            <div key={d.date} style={{ marginBottom: 12 }}>
              <div style={{ color: '#888', fontSize: 13, marginBottom: 4 }}>
                {d.date}（{d.offset === 0 ? '今天' : d.offset === 1 ? '明天' : `${d.offset}天后`}）· {d.month}月{d.day}日
              </div>
              <BirthdayList items={d.items} emptyText="" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
