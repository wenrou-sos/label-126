import React from 'react';
import { User, Clock } from 'lucide-react';
import type { Workstation } from '@/types';
import { formatRelativeTime } from '@/utils/formatters';

interface WorkstationCardProps {
  data: Workstation;
}

export const WorkstationCard: React.FC<WorkstationCardProps> = ({ data }) => {
  const isBusy = data.status === 'busy';

  return (
    <div
      className={`relative rounded-lg p-3 border transition-all duration-300 ${
        isBusy
          ? 'bg-blue-950/30 border-blue-500/30 hover:border-blue-400/50'
          : 'bg-green-950/20 border-green-500/20 hover:border-green-400/40'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-medium text-slate-200">{data.name}</span>
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              isBusy ? 'bg-blue-400 animate-pulse' : 'bg-green-400'
            }`}
            style={{
              boxShadow: isBusy
                ? '0 0 8px rgba(96, 165, 250, 0.6)'
                : '0 0 6px rgba(74, 222, 128, 0.5)',
            }}
          />
          <span className={`text-xs font-medium ${isBusy ? 'text-blue-400' : 'text-green-400'}`}>
            {isBusy ? '忙碌' : '空闲'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-slate-400 mb-2">
        <User size={14} />
        <span className="text-xs">{data.operator}</span>
      </div>

      {isBusy && data.currentTask && (
        <div className="mt-2 pt-2 border-t border-slate-700/50">
          <p className="text-xs text-slate-300">
            <span className="text-slate-500">当前任务：</span>
            {data.currentTask}
          </p>
          {data.startTime && (
            <div className="flex items-center gap-1 mt-1 text-slate-500">
              <Clock size={12} />
              <span className="text-xs">已工作 {formatRelativeTime(data.startTime)}</span>
            </div>
          )}
        </div>
      )}

      {!isBusy && (
        <div className="mt-2 pt-2 border-t border-slate-700/50">
          <p className="text-xs text-green-400/70">等待分配任务...</p>
        </div>
      )}
    </div>
  );
};
