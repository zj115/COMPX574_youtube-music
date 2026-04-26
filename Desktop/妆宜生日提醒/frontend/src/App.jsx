import React, { useState, useCallback } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import BirthdayList from './pages/BirthdayList.jsx';
import Upload from './pages/Upload.jsx';
import Settings from './pages/Settings.jsx';
import Toast from './components/Toast.jsx';

export const ToastContext = React.createContext(null);

export default function App() {
  const [toast, setToast] = useState(null);
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      <div className="app">
        <aside className="sidebar">
          <h1>🎂 妆宜生日提醒</h1>
          <nav>
            <NavLink to="/" end>📊 首页</NavLink>
            <NavLink to="/list">📋 生日列表</NavLink>
            <NavLink to="/upload">📥 上传 Excel</NavLink>
            <NavLink to="/settings">⚙️ 设置 / 推送</NavLink>
          </nav>
        </aside>
        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/list" element={<BirthdayList />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        {toast && <Toast type={toast.type} msg={toast.msg} />}
      </div>
    </ToastContext.Provider>
  );
}
