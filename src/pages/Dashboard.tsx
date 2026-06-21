import React, { useEffect, useState } from 'react';
import { Spin, Alert } from 'antd';
import { Users, Cpu, Layers } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useInterval } from '@/hooks/useInterval';
import { useAlarmSound } from '@/hooks/useAlarmSound';
import { DashboardHeader } from '@/components/DashboardHeader';
import { ProcessCard } from '@/components/ProcessCard';
import { WorkstationCard } from '@/components/WorkstationCard';
import { EquipmentCard } from '@/components/EquipmentCard';
import { AlarmPanel } from '@/components/AlarmPanel';
import { AlarmModal } from '@/components/AlarmModal';
import { ProductionStats } from '@/components/ProductionStats';

const Dashboard: React.FC = () => {
  const {
    data,
    loading,
    error,
    soundEnabled,
    refreshInterval,
    showAlarmModal,
    selectedAlarm,
    lastNewAlarmId,
    fetchData,
    updateData,
    acknowledgeAlarm,
    acknowledgeAllAlarms,
    toggleSound,
    setRefreshInterval,
    openAlarmModal,
    closeAlarmModal,
    clearNewAlarmFlag,
  } = useDashboardStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const { playAlarm } = useAlarmSound(soundEnabled);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useInterval(
    () => {
      updateData();
    },
    data ? refreshInterval : null
  );

  useEffect(() => {
    if (lastNewAlarmId && soundEnabled) {
      playAlarm();
      const timer = setTimeout(() => {
        clearNewAlarmFlag();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [lastNewAlarmId, soundEnabled, playAlarm, clearNewAlarmFlag]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleClickAlarm = (alarm: any) => {
    if (!alarm.acknowledged) {
      acknowledgeAlarm(alarm.id);
    }
    openAlarmModal(alarm.id);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-center">
          <Spin size="large" className="text-cyan-400" />
          <p className="mt-4 text-slate-400 text-sm">正在加载监控数据...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 p-8">
        <Alert
          type="error"
          message="数据加载失败"
          description={error}
          showIcon
          action={
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-cyan-500 text-white rounded-lg text-sm hover:bg-cyan-600 transition-colors"
            >
              重试
            </button>
          }
        />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <DashboardHeader
        lastUpdate={data.lastUpdate}
        refreshInterval={refreshInterval}
        soundEnabled={soundEnabled}
        onRefreshIntervalChange={setRefreshInterval}
        onToggleSound={toggleSound}
        onManualRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
      />

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-[1600px] mx-auto space-y-6">
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Layers size={18} className="text-cyan-400" />
              <h2 className="text-base font-semibold text-slate-200">工序处理量</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {data.processes.map((process, index) => (
                <ProcessCard key={process.id} data={process} index={index} />
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Users size={18} className="text-blue-400" />
                  <h2 className="text-base font-semibold text-slate-200">人工作业线</h2>
                  <span className="text-xs text-slate-500 ml-2">
                    {data.workstations.filter((w) => w.status === 'busy').length}/
                    {data.workstations.length} 忙碌中
                  </span>
                </div>
                <div className="card-dark rounded-xl p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {data.workstations.map((ws) => (
                      <WorkstationCard key={ws.id} data={ws} />
                    ))}
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Cpu size={18} className="text-cyan-400" />
                  <h2 className="text-base font-semibold text-slate-200">设备运行线</h2>
                  <div className="flex items-center gap-3 ml-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      运行 {data.equipments.filter((e) => e.status === 'running').length}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      待机 {data.equipments.filter((e) => e.status === 'standby').length}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      故障 {data.equipments.filter((e) => e.status === 'fault').length}
                    </span>
                  </div>
                </div>
                <div className="card-dark rounded-xl p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data.equipments.map((eq) => (
                      <EquipmentCard key={eq.id} data={eq} />
                    ))}
                  </div>
                </div>
              </section>
            </div>

            <div className="xl:col-span-1 min-h-[500px]">
              <AlarmPanel
                alarms={data.alarms}
                newAlarmId={lastNewAlarmId}
                onAcknowledge={acknowledgeAlarm}
                onAcknowledgeAll={acknowledgeAllAlarms}
                onClickAlarm={handleClickAlarm}
              />
            </div>
          </div>

          <section>
            <ProductionStats data={data.production} />
          </section>
        </div>
      </main>

      <AlarmModal
        open={showAlarmModal}
        alarm={selectedAlarm}
        onClose={closeAlarmModal}
        onAcknowledge={acknowledgeAlarm}
      />

      {isRefreshing && (
        <div className="fixed bottom-6 right-6 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 flex items-center gap-2 shadow-lg">
          <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          数据更新中...
        </div>
      )}
    </div>
  );
};

export default Dashboard;
