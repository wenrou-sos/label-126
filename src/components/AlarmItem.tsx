import React from 'react';
import { AlertTriangle, Clock, MapPin, Check, AlertCircle } from 'lucide-react';
import type { Alarm } from '@/types';
import { formatRelativeTime } from '@/utils/formatters';

interface AlarmItemProps {
  alarm: Alarm;
  isNew?: boolean;
  onAcknowledge: (id: string) => void;
  onClick: (alarm: Alarm) => void;
}

const levelConfig = {
  danger: {
    bg: 'bg-red-950/40',
    border: 'border-red-500/40',
    text: 'text-red-400',
    icon: AlertTriangle,
    label: '严重',
  },
  warning: {
    bg: 'bg-amber-950/30',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    icon: AlertCircle,
    label: '警告',
  },
};

export const AlarmItem: React.FC<AlarmItemProps> = ({
  alarm,
  isNew,
  onAcknowledge,
  onClick,
}) => {
  const config = levelConfig[alarm.level];
  const Icon = config.icon;

  const handleAcknowledge = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAcknowledge(alarm.id);
  };

  return (
    <div
      className={`relative p-3 rounded-lg border ${config.border} ${config.bg} cursor-pointer transition-all duration-300 hover:shadow-md ${
        !alarm.acknowledged ? 'animate-pulse-slow' : 'opacity-70'
      } ${isNew ? 'ring-2 ring-red-400/50 ring-offset-2 ring-offset-slate-900' : ''}`}
      onClick={() => onClick(alarm)}
    >
      {isNew && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
      )}

      <div className="flex items-start gap-3">
        <div className={`p-1.5 rounded ${config.bg} border ${config.border}`}>
          <Icon size={16} className={config.text} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${config.bg} ${config.text} border ${config.border}`}>
              {config.label}
            </span>
            <h4 className="text-sm font-medium text-slate-200 truncate">
              {alarm.title}
            </h4>
          </div>

          <p className="text-xs text-slate-400 mb-2 line-clamp-2">
            {alarm.message}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <MapPin size={12} />
                <span className="truncate max-w-[120px]">{alarm.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{formatRelativeTime(alarm.timestamp)}</span>
              </div>
            </div>

            {!alarm.acknowledged && (
              <button
                onClick={handleAcknowledge}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
              >
                <Check size={12} />
                <span>确认</span>
              </button>
            )}

            {alarm.acknowledged && (
              <span className="text-xs text-slate-600">已确认</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
