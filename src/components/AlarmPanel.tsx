import React from 'react';
import { Bell, AlertTriangle, Check, AlertCircle } from 'lucide-react';
import { Button } from 'antd';
import type { Alarm } from '@/types';
import { AlarmItem } from './AlarmItem';

interface AlarmPanelProps {
  alarms: Alarm[];
  newAlarmId: string | null;
  onAcknowledge: (id: string) => void;
  onAcknowledgeAll: () => void;
  onClickAlarm: (alarm: Alarm) => void;
}

export const AlarmPanel: React.FC<AlarmPanelProps> = ({
  alarms,
  newAlarmId,
  onAcknowledge,
  onAcknowledgeAll,
  onClickAlarm,
}) => {
  const unacknowledged = alarms.filter((a) => !a.acknowledged);
  const dangerCount = unacknowledged.filter((a) => a.level === 'danger').length;
  const warningCount = unacknowledged.filter((a) => a.level === 'warning').length;

  return (
    <div className="card-dark rounded-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell size={18} className="text-red-400" />
            {unacknowledged.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                {unacknowledged.length}
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-slate-200">异常报警</h3>
        </div>

        {unacknowledged.length > 0 && (
          <Button
            type="text"
            size="small"
            icon={<Check size={14} />}
            onClick={onAcknowledgeAll}
            className="text-xs text-slate-400 hover:text-cyan-400 h-auto py-1"
          >
            全部确认
          </Button>
        )}
      </div>

      <div className="px-4 py-3 bg-slate-800/30 border-b border-slate-700/50">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-red-950/30 border border-red-500/20">
            <AlertTriangle size={16} className="text-red-400" />
            <div>
              <p className="text-xl font-bold font-mono-num text-red-400">{dangerCount}</p>
              <p className="text-xs text-red-400/70">严重报警</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-950/30 border border-amber-500/20">
            <AlertCircle size={16} className="text-amber-400" />
            <div>
              <p className="text-xl font-bold font-mono-num text-amber-400">{warningCount}</p>
              <p className="text-xs text-amber-400/70">警告</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
        {alarms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Bell size={32} className="mb-2 opacity-30" />
            <p className="text-sm">暂无报警信息</p>
            <p className="text-xs mt-1">系统运行正常</p>
          </div>
        ) : (
          alarms.map((alarm) => (
            <AlarmItem
              key={alarm.id}
              alarm={alarm}
              isNew={alarm.id === newAlarmId}
              onAcknowledge={onAcknowledge}
              onClick={onClickAlarm}
            />
          ))
        )}
      </div>
    </div>
  );
};
