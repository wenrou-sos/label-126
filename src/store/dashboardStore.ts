import { create } from 'zustand';
import type { DashboardData, Alarm } from '@/types';
import { generateDashboardData, updateDashboardData } from '@/utils/mockData';

interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  soundEnabled: boolean;
  refreshInterval: number;
  selectedAlarm: Alarm | null;
  showAlarmModal: boolean;
  lastNewAlarmId: string | null;
  fetchData: () => Promise<void>;
  updateData: () => void;
  acknowledgeAlarm: (id: string) => void;
  acknowledgeAllAlarms: () => void;
  toggleSound: () => void;
  setRefreshInterval: (interval: number) => void;
  openAlarmModal: (alarmId: string) => void;
  closeAlarmModal: () => void;
  clearNewAlarmFlag: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  data: null,
  loading: true,
  error: null,
  soundEnabled: true,
  refreshInterval: 30000,
  selectedAlarm: null,
  showAlarmModal: false,
  lastNewAlarmId: null,

  fetchData: async () => {
    try {
      set({ loading: true, error: null });
      await new Promise((resolve) => setTimeout(resolve, 500));
      const data = generateDashboardData();
      set({ data, loading: false });
    } catch (err) {
      set({ error: '数据加载失败', loading: false });
    }
  },

  updateData: () => {
    const { data } = get();
    if (!data) return;

    const prevAlarmIds = new Set(data.alarms.filter((a) => !a.acknowledged).map((a) => a.id));
    const newData = updateDashboardData(data);
    const newUnacknowledged = newData.alarms.filter((a) => !a.acknowledged);
    const newAlarms = newUnacknowledged.filter((a) => !prevAlarmIds.has(a.id));

    if (newAlarms.length > 0) {
      set({ lastNewAlarmId: newAlarms[0].id });
    }

    set({ data: newData });
  },

  acknowledgeAlarm: (id: string) => {
    const { data, selectedAlarm } = get();
    if (!data) return;
    const updatedAlarms = data.alarms.map((a) =>
      a.id === id ? { ...a, acknowledged: true } : a
    );
    const updatedSelectedAlarm =
      selectedAlarm && selectedAlarm.id === id
        ? { ...selectedAlarm, acknowledged: true }
        : selectedAlarm;
    set({
      data: { ...data, alarms: updatedAlarms },
      selectedAlarm: updatedSelectedAlarm,
    });
  },

  acknowledgeAllAlarms: () => {
    const { data } = get();
    if (!data) return;
    const updatedAlarms = data.alarms.map((a) => ({ ...a, acknowledged: true }));
    set({ data: { ...data, alarms: updatedAlarms } });
  },

  toggleSound: () => {
    set((state) => ({ soundEnabled: !state.soundEnabled }));
  },

  setRefreshInterval: (interval: number) => {
    set({ refreshInterval: interval });
  },

  openAlarmModal: (alarmId: string) => {
    const { data } = get();
    if (!data) return;
    const alarm = data.alarms.find((a) => a.id === alarmId);
    if (alarm) {
      set({ selectedAlarm: alarm, showAlarmModal: true });
    }
  },

  closeAlarmModal: () => {
    set({ showAlarmModal: false, selectedAlarm: null });
  },

  clearNewAlarmFlag: () => {
    set({ lastNewAlarmId: null });
  },
}));
