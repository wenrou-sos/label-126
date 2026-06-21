import React from 'react';
import { Wind, Droplets, Shirt, Flame, AlertTriangle, Clock, Package } from 'lucide-react';
import type { Equipment } from '@/types';

interface EquipmentCardProps {
  data: Equipment;
}

const iconMap: Record<string, any> = {
  dryer: Wind,
  washer: Droplets,
  drying_rack: Flame,
  ironing: Shirt,
};

const statusConfig = {
  running: {
    label: '运行中',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500',
    border: 'border-cyan-500/30',
    bgColor: 'bg-cyan-950/30',
    pulse: true,
  },
  standby: {
    label: '待机',
    color: 'text-amber-400',
    bg: 'bg-amber-500',
    border: 'border-amber-500/30',
    bgColor: 'bg-amber-950/20',
    pulse: false,
  },
  fault: {
    label: '故障',
    color: 'text-red-400',
    bg: 'bg-red-500',
    border: 'border-red-500/40',
    bgColor: 'bg-red-950/30',
    pulse: true,
  },
};

export const EquipmentCard: React.FC<EquipmentCardProps> = ({ data }) => {
  const Icon = iconMap[data.type] || Wind;
  const status = statusConfig[data.status];

  return (
    <div
      className={`relative rounded-lg p-4 border ${status.border} ${status.bgColor} transition-all duration-300 hover:shadow-lg`}
    >
      {data.status === 'fault' && (
        <div className="absolute inset-0 bg-red-500/5 animate-alarm-flash rounded-lg pointer-events-none" />
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${status.bgColor} border ${status.border}`}>
            <Icon size={20} className={status.color} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">{data.name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${status.bg} ${status.pulse ? 'animate-pulse' : ''}`}
                style={{
                  boxShadow: `0 0 6px currentColor`,
                }}
              />
              <span className={`text-xs font-medium ${status.color}`}>
                {status.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {data.status === 'fault' && data.faultMessage && (
        <div className="flex items-start gap-2 p-2 rounded bg-red-950/50 border border-red-500/30 mb-3">
          <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-300">{data.faultMessage}</p>
        </div>
      )}

      {(data.status === 'running' || data.status === 'standby') && data.currentBatch && (
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2">
            <Package size={14} className="text-slate-500" />
            <span className="text-xs text-slate-300">
              当前批次：<span className="text-slate-200 font-medium">{data.currentBatch}</span>
              {data.itemCount && <span className="text-slate-500"> ({data.itemCount}件)</span>}
            </span>
          </div>
        </div>
      )}

      {data.status === 'running' && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-500">运行进度</span>
            <div className="flex items-center gap-1">
              <Clock size={12} className="text-slate-500" />
              <span className="text-xs text-slate-400 font-mono-num">
                剩余 {data.remainingMinutes ?? '--'} 分
              </span>
            </div>
          </div>
          <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-500 relative overflow-hidden"
              style={{ width: `${data.progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-progress-shine" />
            </div>
          </div>
          <p className="text-right text-xs text-slate-500 mt-1 font-mono-num">
            {data.progress}%
          </p>
        </div>
      )}

      {data.status === 'standby' && (
        <p className="text-xs text-amber-400/70 text-center py-2">设备就绪，等待启动</p>
      )}
    </div>
  );
};
