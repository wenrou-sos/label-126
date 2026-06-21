import React, { useState, useEffect } from 'react';
import { Factory, RefreshCw, Volume2, VolumeX, Settings, Clock, Wifi } from 'lucide-react';
import { Select, Dropdown, Button, Switch } from 'antd';
import { formatTime } from '@/utils/formatters';

interface DashboardHeaderProps {
  lastUpdate: string;
  refreshInterval: number;
  soundEnabled: boolean;
  onRefreshIntervalChange: (interval: number) => void;
  onToggleSound: () => void;
  onManualRefresh: () => void;
  isRefreshing: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  lastUpdate,
  refreshInterval,
  soundEnabled,
  onRefreshIntervalChange,
  onToggleSound,
  onManualRefresh,
  isRefreshing,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const intervalOptions = [
    { value: 10000, label: '10 秒' },
    { value: 30000, label: '30 秒' },
    { value: 60000, label: '1 分钟' },
    { value: 120000, label: '2 分钟' },
  ];

  const settingsMenu = {
    items: [
      {
        key: 'sound',
        label: (
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-300">报警声音</span>
            <Switch
              size="small"
              checked={soundEnabled}
              onChange={onToggleSound}
              onClick={(e: any) => e.stopPropagation()}
            />
          </div>
        ),
      },
      {
        key: 'interval',
        label: (
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-300">刷新间隔</span>
            <Select
              size="small"
              value={refreshInterval}
              onChange={onRefreshIntervalChange}
              options={intervalOptions}
              style={{ width: 100 }}
              onClick={(e) => e.stopPropagation()}
              popupMatchSelectWidth={false}
            />
          </div>
        ),
      },
    ],
  };

  return (
    <header className="relative z-10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 backdrop-blur-sm">
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      
      <div className="relative px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              <Factory size={24} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">干洗中央工厂</h1>
              <p className="text-xs text-slate-400">洗护流水线实时监控看板</p>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-700 mx-2" />

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <Wifi size={14} className="text-green-400" />
            <span className="text-xs text-slate-400">系统运行中</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-right">
            <div>
              <p className="text-2xl font-bold font-mono-num text-white">
                {formatTime(currentTime)}
              </p>
              <div className="flex items-center gap-1.5 justify-end">
                <Clock size={12} className="text-slate-500" />
                <span className="text-xs text-slate-500">
                  更新于 {formatTime(lastUpdate)}
                </span>
              </div>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-700" />

          <div className="flex items-center gap-2">
            <button
              onClick={onManualRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all disabled:opacity-50"
              title="手动刷新"
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={onToggleSound}
              className={`p-2 rounded-lg border transition-all ${
                soundEnabled
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-500 hover:text-slate-300'
              }`}
              title={soundEnabled ? '声音已开启' : '声音已关闭'}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>

            <Dropdown menu={settingsMenu} placement="bottomRight" trigger={['click']}>
              <button
                className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600 transition-all"
                title="设置"
              >
                <Settings size={18} />
              </button>
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  );
};
