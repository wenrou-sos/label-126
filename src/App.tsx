import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, theme as antdTheme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Dashboard from '@/pages/Dashboard';

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: antdTheme.darkAlgorithm,
        token: {
          colorPrimary: '#06b6d4',
          colorInfo: '#06b6d4',
          colorSuccess: '#22c55e',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          borderRadius: 8,
          colorBgContainer: '#1e293b',
          colorBgElevated: '#0f172a',
          colorBorder: '#334155',
          colorText: '#e2e8f0',
          colorTextSecondary: '#94a3b8',
        },
        components: {
          Modal: {
            headerBg: 'transparent',
            contentBg: '#0f172a',
          },
          Button: {
            colorPrimary: '#06b6d4',
            algorithm: true,
          },
        },
      }}
    >
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}
