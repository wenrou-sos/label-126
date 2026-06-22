import React, { useMemo } from 'react';
import { Modal, Empty, Tag, Divider } from 'antd';
import {
  X, Wind, Droplets, Shirt, Flame, Activity,
  Clock, Package, AlertTriangle,
  Wrench, History, Calendar, Timer, User, FileText, Package as PackageIcon,
} from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import type { Equipment, MaintenanceRecord } from '@/types';
import { calculateMaintenanceStatus, maintenanceTypeLabels } from '@/utils/mockData';
import { formatDateTime, formatDuration } from '@/utils/formatters';

const iconMap: Record<string, any> = {
  dryer: Wind,
  washer: Droplets,
  drying_rack: Flame,
  ironing: Shirt,
};

const statusConfig = {
  running: { label: '运行中', color: 'cyan' },
  standby: { label: '待机', color: 'orange' },
  fault: { label: '故障', color: 'red' },
};

const maintenanceStatusConfig = {
  normal: { label: '正常', color: 'green' },
  warning: { label: '快到期', color: 'orange' },
  overdue: { label: '超期', color: 'red' },
};

const maintenanceTypeColor: Record<string, string> = {
  routine: 'cyan',
  repair: 'red',
  inspection: 'blue',
  emergency: 'orange',
};

interface EquipmentDetailModalProps {
  open: boolean;
  onClose: () => void;
  onRegisterMaintenance: (equipmentId: string) => void;
}

export const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({ open, onClose, onRegisterMaintenance }) => {
  const { data, selectedEquipment, closeEquipmentModal } = useDashboardStore();

  const maintenanceRecords = useMemo<MaintenanceRecord[]>(() => {
    if (!data || !selectedEquipment) return [];
    return data.maintenanceRecords.filter(
      (r) => r.equipmentId === selectedEquipment.id
    );
  }, [data, selectedEquipment]);

  if (!selectedEquipment) return null;

  const eq: Equipment = selectedEquipment;
  const Icon = iconMap[eq.type] || Wind;
  const status = statusConfig[eq.status];
  const mStatus = calculateMaintenanceStatus(eq);
  const maintStatus = maintenanceStatusConfig[mStatus.status];

  const hoursSinceLastMaintenance = eq.totalRunningHours - eq.lastMaintenanceHours;

  return (
    <Modal
      open={open}
      onCancel={() => {
        closeEquipmentModal();
        onClose();
      }}
      footer={null}
      destroyOnClose
      centered
      width={720}
      styles={{
        mask: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
        body: { padding: 0, maxHeight: '85vh', overflow: 'hidden' },
      }}
      classNames={{ wrapper: 'modal-wrapper-dark' }}
      closeIcon={<X size={18} className="text-slate-400 hover:text-slate-200" />}
    >
      <div className="flex flex-col h-full">
        <div className="px-6 py-5 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-transparent">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-slate-700/50 border border-slate-600/50">
                <Icon size={28} className="text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-white">{eq.name}</h2>
                  <Tag color={status.color} className="!py-0.5 !px-2 text-xs font-medium">
                    {status.label}
                  </Tag>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>累计运行 {eq.totalRunningHours.toFixed(0)} 小时</span>
                  <span>·</span>
                  <span>保养周期 {eq.maintenanceCycleHours}h</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onRegisterMaintenance(eq.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors shadow-lg shadow-cyan-600/20"
            >
              <Wrench size={16} />
              登记维保
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card-dark rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity size={16} className={maintStatus.color === 'green' ? 'text-green-400' : maintStatus.color === 'orange' ? 'text-amber-400' : 'text-red-400'} />
                <span className="text-sm font-semibold text-slate-300">保养寿命状态</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-bold font-mono-num ${
                    maintStatus.color === 'green' ? 'text-green-400' :
                    maintStatus.color === 'orange' ? 'text-amber-400' :
                    'text-red-400'
                  }`}>
                    {mStatus.status === 'overdue' ? `-${Math.abs(mStatus.remainingHours)}` : mStatus.remainingHours.toFixed(0)}
                    <span className="text-base ml-1">h</span>
                  </span>
                  <Tag color={maintStatus.color} className="!ml-0">
                    {maintStatus.label}
                  </Tag>
                </div>
                <div className="h-2.5 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      maintStatus.color === 'green' ? 'bg-gradient-to-r from-green-500 to-green-400' :
                      maintStatus.color === 'orange' ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                      'bg-gradient-to-r from-red-500 to-red-400'
                    } ${mStatus.status === 'overdue' ? 'animate-pulse' : ''}`}
                    style={{ width: `${Math.max(3, Math.min(100, mStatus.remainingPercent))}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>已运行 {hoursSinceLastMaintenance.toFixed(0)}h</span>
                  <span>{eq.maintenanceCycleHours}h</span>
                </div>
              </div>
            </div>

            <div className="card-dark rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={16} className="text-blue-400" />
                <span className="text-sm font-semibold text-slate-300">维保记录</span>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold font-mono-num text-white">
                  {maintenanceRecords.length}
                  <span className="text-base text-slate-500 ml-1">次</span>
                </p>
                {maintenanceRecords.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-slate-500">上次: {formatDateTime(eq.lastMaintenanceDate)}</p>
                    {maintenanceRecords[0]?.nextMaintenanceDate && (
                      <p className="text-xs text-slate-500">下次: {formatDateTime(maintenanceRecords[0].nextMaintenanceDate)}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="card-dark rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Package size={16} className="text-cyan-400" />
                <span className="text-sm font-semibold text-slate-300">
                  {eq.status === 'fault' ? '故障信息' : '当前批次'}
                </span>
              </div>
              {eq.status === 'fault' ? (
                <div className="space-y-1">
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-red-950/50 border border-red-500/30">
                    <AlertTriangle size={14} className="text-red-400 mt-0.5" />
                    <span className="text-xs text-red-300">{eq.faultMessage || '设备异常'}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-white">{eq.currentBatch || '无'}</p>
                  {eq.status === 'running' && (
                    <>
                      <p className="text-xs text-slate-500">{eq.itemCount || 0} 件衣物</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-cyan-400 rounded-full"
                            style={{ width: `${eq.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-cyan-400 font-mono-num">{eq.progress}%</span>
                      </div>
                      {eq.remainingMinutes && (
                        <p className="text-xs text-slate-500">剩余约 {eq.remainingMinutes} 分钟</p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <Divider className="!my-0 !border-slate-700/50" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History size={18} className="text-purple-400" />
                <h3 className="text-base font-semibold text-slate-200">维保历史记录</h3>
                <Tag color="purple" className="!py-0.5 !px-2">
                  共 {maintenanceRecords.length} 条
                </Tag>
              </div>
            </div>

            {maintenanceRecords.length === 0 ? (
              <div className="py-12">
                <Empty
                  description={<span className="text-slate-500">暂无维保记录</span>}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            ) : (
              <div className="space-y-3">
                {maintenanceRecords.slice(0, 8).map((record) => (
                <div
                  key={record.id}
                  className="card-dark card-dark-hover rounded-xl p-4 border border-slate-700/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Tag
                        color={maintenanceTypeColor[record.maintenanceType]}
                        className="!py-0.5 !px-2 !rounded-lg font-medium"
                      >
                        {maintenanceTypeLabels[record.maintenanceType]}
                      </Tag>
                      <span className="text-sm font-semibold text-slate-200">
                        {record.description}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar size={12} />
                      <span>{formatDateTime(record.maintenanceDate)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <User size={12} className="text-slate-500" />
                      <span>维保人员：<span className="text-slate-300">{record.operator}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Timer size={12} className="text-slate-500" />
                      <span>耗时：<span className="text-slate-300">{formatDuration(record.durationMinutes)}</span></span>
                    </div>
                  </div>

                  {record.partsReplaced && record.partsReplaced.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-700/30 flex items-start gap-2">
                      <PackageIcon size={12} className="text-slate-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-slate-400">
                        更换配件：
                        <span className="text-slate-300">{record.partsReplaced.join('、')}</span>
                      </span>
                    </div>
                  )}

                  {record.notes && (
                    <div className="mt-2 flex items-start gap-2">
                      <FileText size={12} className="text-slate-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-slate-500">备注：{record.notes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
