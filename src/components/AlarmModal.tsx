import React from 'react';
import { Modal } from 'antd';
import { AlertTriangle, Clock, MapPin, Lightbulb, Check, X } from 'lucide-react';
import type { Alarm } from '@/types';
import { formatDateTime } from '@/utils/formatters';

interface AlarmModalProps {
  open: boolean;
  alarm: Alarm | null;
  onClose: () => void;
  onAcknowledge: (id: string) => void;
}

const levelConfig = {
  danger: {
    icon: AlertTriangle,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
};

export const AlarmModal: React.FC<AlarmModalProps> = ({
  open,
  alarm,
  onClose,
  onAcknowledge,
}) => {
  if (!alarm) return null;

  const config = levelConfig[alarm.level];
  const Icon = config.icon;

  const handleAcknowledge = () => {
    onAcknowledge(alarm.id);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={480}
      styles={{
        mask: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
        header: { display: 'none' },
        body: { padding: 0 },
      }}
      className="modal-wrapper-dark"
    >
      <div className={`p-6 rounded-t-lg ${config.bgColor} border-b ${config.borderColor}`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${config.bgColor} border ${config.borderColor}`}>
            <Icon size={28} className={config.color} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bgColor} ${config.color} border ${config.borderColor}`}>
                {alarm.level === 'danger' ? '严重报警' : '警告'}
              </span>
              {alarm.acknowledged && (
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                  已确认
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-slate-100">{alarm.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <p className="text-sm text-slate-300 leading-relaxed">{alarm.message}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin size={16} className="text-slate-500" />
            <span className="text-slate-400">位置：</span>
            <span className="text-slate-200">{alarm.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock size={16} className="text-slate-500" />
            <span className="text-slate-400">时间：</span>
            <span className="text-slate-200 font-mono-num text-xs">
              {formatDateTime(alarm.timestamp)}
            </span>
          </div>
        </div>

        {alarm.suggestion && (
          <div className="p-4 rounded-lg bg-cyan-950/30 border border-cyan-500/20">
            <div className="flex items-start gap-2">
              <Lightbulb size={16} className="text-cyan-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-cyan-300 mb-1">处理建议</p>
                <p className="text-sm text-cyan-200/80">{alarm.suggestion}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 pb-6 flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2.5 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600/50 transition-colors text-sm font-medium"
        >
          关闭
        </button>
        {!alarm.acknowledged && (
          <button
            onClick={handleAcknowledge}
            className={`flex-1 px-4 py-2.5 rounded-lg ${config.bgColor} ${config.color} border ${config.borderColor} hover:opacity-90 transition-opacity text-sm font-medium flex items-center justify-center gap-2`}
          >
            <Check size={16} />
            确认报警
          </button>
        )}
      </div>
    </Modal>
  );
};
