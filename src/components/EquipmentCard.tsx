import React from 'react';
import { Wind, Droplets, Shirt, Flame, AlertTriangle, Clock, Package, Wrench, Activity } from 'lucide-react';
import type { Equipment } from '@/types';
import { calculateMaintenanceStatus } from '@/utils/mockData';
import { formatDateTime } from '@/utils/formatters';

interface EquipmentCardProps {
  data: Equipment;
  onClick?: () => void;
  onMaintenanceClick?: () => void;
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

const maintenanceConfig = {
  normal: {
    label: '正常',
    color: 'text-green-400',
    bg: 'bg-green-500',
    border: 'border-green-500/20',
    trackBg: 'bg-slate-700/50',
  },
  warning: {
    label: '快到期',
    color: 'text-amber-400',
    bg: 'bg-amber-500',
    border: 'border-amber-500/30',
    trackBg: 'bg-slate-700/50',
  },
  overdue: {
    label: '已超期',
    color: 'text-red-400',
    bg: 'bg-red-500',
    border: 'border-red-500/40',
    trackBg: 'bg-red-950/30',
  },
};

export const EquipmentCard: React.FC<EquipmentCardProps> = ({ data, onClick, onMaintenanceClick }) => {
  const Icon = iconMap[data.type] || Wind;
  const status = statusConfig[data.status];
  const mStatus = calculateMaintenanceStatus(data);
  const maint = maintenanceConfig[mStatus.status];

  const handleMaintenanceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMaintenanceClick?.();
  };

  return (
    <div
      className={`relative rounded-xl p-4 border ${status.border} ${status.bgColor} transition-all duration-300 hover:shadow-xl cursor-pointer group ${
        mStatus.status === 'overdue' ? 'ring-1 ring-red-500/20' : ''
      }`}
      onClick={onClick}
    >
      {data.status === 'fault' && (
        <div className="absolute inset-0 bg-red-500/5 animate-alarm-flash rounded-xl pointer-events-none" />
      )}
      {mStatus.status === 'overdue' && data.status !== 'fault' && (
        <div className="absolute inset-0 bg-red-500/3 animate-pulse-slow rounded-xl pointer-events-none" />
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${status.bgColor} border ${status.border}`}>
            <Icon size={20} className={status.color} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">{data.name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${status.bg} ${status.pulse ? 'animate-pulse' : ''}`}
                style={{ boxShadow: `0 0 6px currentColor` }}
              />
              <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleMaintenanceClick}
          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 bg-slate-700/50 hover:bg-cyan-600/30 text-slate-400 hover:text-cyan-300 border border-slate-600/50 hover:border-cyan-500/30 transition-all"
          title="登记维保"
        >
          <Wrench size={14} />
        </button>
      </div>

      {data.status === 'fault' && data.faultMessage && (
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-red-950/50 border border-red-500/30 mb-3">
          <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-300 leading-relaxed">{data.faultMessage}</p>
        </div>
      )}

      {(data.status === 'running' || data.status === 'standby') && data.currentBatch && (
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2">
            <Package size={14} className="text-slate-500" />
            <span className="text-xs text-slate-300">
              当前批次：<span className="text-slate-100 font-medium">{data.currentBatch}</span>
              {data.itemCount && <span className="text-slate-500"> ({data.itemCount}件)</span>}
            </span>
          </div>
        </div>
      )}

      {data.status === 'running' && (
        <div className="mb-4">
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
          <p className="text-right text-xs text-slate-500 mt-1 font-mono-num">{data.progress}%</p>
        </div>
      )}

      {data.status === 'standby' && (
        <p className="text-xs text-amber-400/80 text-center py-3 mb-2">设备就绪，等待启动</p>
      )}

      <div className={`pt-3 border-t ${maint.border}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Activity size={13} className={maint.color} />
            <span className="text-xs text-slate-400">保养寿命</span>
          </div>
          <span className={`text-xs font-semibold ${maint.color}`}>
            {mStatus.status === 'overdue'
              ? `超期 ${Math.abs(mStatus.remainingHours)}h`
              : `剩余 ${Math.max(0, Math.round(mStatus.remainingHours))}h`}
          </span>
        </div>

        <div className={`h-1.5 rounded-full ${maint.trackBg} overflow-hidden mb-2`}>
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              mStatus.status === 'normal'
                ? 'bg-gradient-to-r from-green-500 to-green-400'
                : mStatus.status === 'warning'
                ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                : 'bg-gradient-to-r from-red-500 to-red-400'
            } ${mStatus.status === 'overdue' ? 'animate-pulse' : ''}`}
            style={{
              width: `${Math.max(2, mStatus.remainingPercent)}%`,
            }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {data.totalRunningHours.toFixed(0)}h / {data.maintenanceCycleHours}h
          </span>
          <span>上次：{formatDateTime(data.lastMaintenanceDate).split(' ')[0]}</span>
        </div>
      </div>
    </div>
  );
};
