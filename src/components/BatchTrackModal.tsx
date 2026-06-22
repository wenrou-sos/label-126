import React, { useState, useMemo } from 'react';
import { Modal, Input, Empty, Tag, List, Avatar } from 'antd';
import {
  X,
  Search,
  Package,
  Clock,
  User,
  MapPin,
  Settings,
  ChevronRight,
  AlertTriangle,
  Zap,
  CalendarClock,
  Shirt,
  Timer,
} from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import type { BatchTrackInfo, ProcessStepRecord, ProcessType } from '@/types';
import { formatDateTime, formatDuration, formatRelativeTime } from '@/utils/formatters';

const { Search: SearchInput } = Input;

interface BatchTrackModalProps {
  open: boolean;
  onClose: () => void;
}

const processIcons: Record<ProcessType, React.ReactNode> = {
  receiving: <Package size={16} />,
  pretreatment: <Settings size={16} />,
  washing: <Shirt size={16} />,
  finishing: <Zap size={16} />,
  inspection: <AlertTriangle size={16} />,
  completed: <Package size={16} />,
};

const processColorMap: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  completed: {
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    border: 'border-green-500/30',
    dot: 'bg-green-500',
  },
  in_progress: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
    dot: 'bg-cyan-500',
  },
  pending: {
    bg: 'bg-slate-700/30',
    text: 'text-slate-500',
    border: 'border-slate-600/30',
    dot: 'bg-slate-600',
  },
};

export const BatchTrackModal: React.FC<BatchTrackModalProps> = ({ open, onClose }) => {
  const { data, selectedBatch, closeBatchTrackModal, selectBatch } = useDashboardStore();
  const [searchText, setSearchText] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const searchResults = useMemo(() => {
    if (!searchText.trim() || !data) return [];
    const keyword = searchText.toLowerCase().trim();
    return data.batches
      .filter(
        (b) =>
          b.batchId.toLowerCase().includes(keyword) ||
          b.batchName.toLowerCase().includes(keyword) ||
          b.category.toLowerCase().includes(keyword)
      )
      .slice(0, 10);
  }, [searchText, data]);

  const handleClose = () => {
    closeBatchTrackModal();
    onClose();
  };

  const handleSelectBatch = (batch: BatchTrackInfo) => {
    selectBatch(batch.batchId);
    setSearchText('');
    setSearchFocused(false);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    if (value && data) {
      const batch = data.batches.find(
        (b) => b.batchId === value || b.batchName.toLowerCase() === value.toLowerCase()
      );
      if (batch) {
        selectBatch(batch.batchId);
        setSearchFocused(false);
      }
    }
  };

  const slowestStep = selectedBatch?.slowestStep;

  return (
    <Modal
      open={open}
      onCancel={handleClose}
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
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30">
            <Search size={20} className="text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">批次追踪</h3>
            <p className="text-xs text-slate-500 mt-0.5">输入批次号查看全流程进度</p>
          </div>
        </div>
      }
    >
      <div className="flex flex-col h-full">
        <div className="px-6 py-4 border-b border-slate-700/50">
          <div className="relative">
            <SearchInput
              placeholder="输入批次号，如 W2024056 或 羊毛大衣"
              allowClear
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              onFocus={() => setSearchFocused(true)}
              className="!bg-slate-800 !border-slate-600 !text-slate-200 placeholder:!text-slate-500"
            />
            {searchText.trim() && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-600 rounded-xl shadow-xl z-[1000] max-h-64 overflow-y-auto">
                {searchResults.map((batch) => (
                  <div
                    key={batch.batchId}
                    onClick={() => handleSelectBatch(batch)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-slate-700/50 cursor-pointer border-b border-slate-700/30 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/10">
                        <Package size={16} className="text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200">{batch.batchName}</p>
                        <p className="text-xs text-slate-500">
                          {batch.category} · {batch.totalItems}件
                        </p>
                      </div>
                    </div>
                    <Tag
                      color={
                        batch.currentProcess === 'completed'
                          ? 'green'
                          : batch.currentProcess === 'inspection'
                          ? 'blue'
                          : 'cyan'
                      }
                      className="!text-xs"
                    >
                      {
                        batch.processSteps.find((s) => s.processType === batch.currentProcess)
                          ?.processName
                      }
                    </Tag>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {!selectedBatch ? (
            <div className="py-16 px-6">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div className="text-center">
                    <p className="text-slate-400 mb-2">请搜索或选择一个批次</p>
                    <p className="text-xs text-slate-500">
                      支持按批次号、品类名称搜索，查看衣物全流程追踪
                    </p>
                    {data && data.batches.length > 0 && (
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {data.batches.slice(0, 5).map((b) => (
                          <Tag
                            key={b.batchId}
                            color="purple"
                            className="!cursor-pointer hover:!bg-purple-500/20"
                            onClick={() => handleSelectBatch(b)}
                          >
                            {b.batchName}
                          </Tag>
                        ))}
                      </div>
                    )}
                  </div>
                }
              />
            </div>
          ) : (
            <div className="p-6 space-y-6">
              <div className="card-dark rounded-xl p-5 border border-slate-700/30">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30">
                      <Package size={28} className="text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white mb-1">{selectedBatch.batchName}</h2>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Shirt size={12} />
                          {selectedBatch.category}
                        </span>
                        <span>·</span>
                        <span>共 {selectedBatch.totalItems} 件</span>
                        <span>·</span>
                        <span>
                          {selectedBatch.priority === 'urgent' ? (
                            <Tag color="red" className="!py-0 !px-1.5 !text-xs">
                              加急
                            </Tag>
                          ) : (
                            <Tag color="blue" className="!py-0 !px-1.5 !text-xs">
                              普通
                            </Tag>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Tag
                    color={
                      selectedBatch.currentProcess === 'completed'
                        ? 'green'
                        : selectedBatch.currentProcess === 'inspection'
                        ? 'gold'
                        : 'cyan'
                    }
                    className="!py-1 !px-3 !text-xs font-medium"
                  >
                    {
                      selectedBatch.processSteps.find(
                        (s) => s.processType === selectedBatch.currentProcess
                      )?.processName
                    }
                  </Tag>
                </div>

                {slowestStep && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="p-2 rounded-lg bg-amber-500/20">
                      <Timer size={18} className="text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-300">
                        耗时最久环节：{slowestStep.processName}
                      </p>
                      <p className="text-xs text-amber-400/70">
                        共耗时 {formatDuration(slowestStep.durationMinutes)}
                      </p>
                    </div>
                    <Tag color="amber" className="!text-xs">
                      瓶颈环节
                    </Tag>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-700/30">
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">已完成工序</p>
                    <p className="text-xl font-bold text-green-400 font-mono-num">
                      {
                        selectedBatch.processSteps.filter((s) => s.status === 'completed').length
                      }
                      <span className="text-sm text-slate-500"> / 6</span>
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">累计耗时</p>
                    <p className="text-xl font-bold text-cyan-400 font-mono-num">
                      {formatDuration(selectedBatch.totalDurationMinutes || 0)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">预计完成</p>
                    <p className="text-xl font-bold text-blue-400 font-mono-num">
                      {selectedBatch.expectedCompletionTime
                        ? formatRelativeTime(selectedBatch.expectedCompletionTime)
                        : '已完成'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <CalendarClock size={16} className="text-purple-400" />
                  流程时间线
                </h3>

                <div className="relative">
                  <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-slate-700/50" />

                  {selectedBatch.processSteps.map((step, index) => (
                    <ProcessStepItem
                      key={step.processType}
                      step={step}
                      isLast={index === selectedBatch.processSteps.length - 1}
                      isSlowest={slowestStep?.processType === step.processType}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

interface ProcessStepItemProps {
  step: ProcessStepRecord;
  isLast: boolean;
  isSlowest?: boolean;
}

const ProcessStepItem: React.FC<ProcessStepItemProps> = ({ step, isLast, isSlowest }) => {
  const colors = processColorMap[step.status];
  const isActive = step.status === 'in_progress';
  const isDone = step.status === 'completed';

  return (
    <div className={`relative flex gap-4 ${isLast ? '' : 'mb-2'}`}>
      <div
        className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 ${colors.border} ${colors.bg} ${colors.text} ${
          isActive ? 'animate-pulse ring-4 ring-cyan-500/20' : ''
        }`}
      >
        {isDone ? (
          <ChevronRight size={18} className="text-green-400" />
        ) : (
          processIcons[step.processType]
        )}
      </div>

      <div className={`flex-1 pb-4 ${isLast ? '' : ''}`}>
        <div
          className={`card-dark rounded-xl p-4 border ${colors.border} ${
            isActive ? 'ring-1 ring-cyan-500/30' : ''
          } ${isSlowest ? 'ring-2 ring-amber-500/50' : ''}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${colors.text}`}>{step.processName}</span>
              {isSlowest && (
                <Tag color="amber" className="!py-0 !px-1.5 !text-[10px]">
                  最久
                </Tag>
              )}
              {step.status === 'in_progress' && (
                <Tag color="cyan" className="!py-0 !px-1.5 !text-[10px] animate-pulse">
                  进行中
                </Tag>
              )}
            </div>
            {step.durationMinutes !== undefined && (
              <span className={`text-xs font-mono-num ${
                isSlowest ? 'text-amber-400 font-semibold' : colors.text
              }`}>
                {formatDuration(step.durationMinutes)}
              </span>
            )}
          </div>

          {step.status === 'pending' ? (
            <p className="text-xs text-slate-500">等待处理...</p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-4 text-xs">
                {step.operator && (
                  <span className="flex items-center gap-1 text-slate-400">
                    <User size={11} className="text-slate-500" />
                    <span className="text-slate-300">{step.operator}</span>
                  </span>
                )}
                {step.workstation && (
                  <span className="flex items-center gap-1 text-slate-400">
                    <MapPin size={11} className="text-slate-500" />
                    <span className="text-slate-300">{step.workstation}</span>
                  </span>
                )}
                {step.equipment && (
                  <span className="flex items-center gap-1 text-slate-400">
                    <Settings size={11} className="text-slate-500" />
                    <span className="text-slate-300">{step.equipment}</span>
                  </span>
                )}
              </div>

              {(step.startTime || step.endTime) && (
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  {step.startTime && (
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      开始: {formatDateTime(step.startTime)}
                    </span>
                  )}
                  {step.endTime && (
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      完成: {formatDateTime(step.endTime)}
                    </span>
                  )}
                </div>
              )}

              {step.notes && (
                <div className="pt-2 mt-2 border-t border-slate-700/30">
                  <p className="text-xs text-slate-400">
                    <span className="text-slate-500">备注：</span>
                    {step.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
