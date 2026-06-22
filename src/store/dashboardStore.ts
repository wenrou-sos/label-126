import { create } from 'zustand';
import type { DashboardData, Alarm, Equipment, MaintenanceRecord, MaintenanceType } from '@/types';
import { generateDashboardData, updateDashboardData, getMaintenanceCycle } from '@/utils/mockData';

interface NewMaintenanceForm {
  equipmentId: string;
  maintenanceType: MaintenanceType;
  operator: string;
  durationMinutes: number;
  description: string;
  partsReplaced: string[];
  notes?: string;
}

interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  soundEnabled: boolean;
  refreshInterval: number;
  selectedAlarm: Alarm | null;
  showAlarmModal: boolean;
  lastNewAlarmId: string | null;
  selectedEquipment: Equipment | null;
  showEquipmentModal: boolean;
  showMaintenanceForm: boolean;
  maintenanceFormEquipment: Equipment | null;
  localMaintenanceRecords: MaintenanceRecord[];
  localEquipmentUpdates: Record<string, { lastMaintenanceDate: string; lastMaintenanceHours: number }>;
  fetchData: () => Promise<void>;
  updateData: () => void;
  acknowledgeAlarm: (id: string) => void;
  acknowledgeAllAlarms: () => void;
  toggleSound: () => void;
  setRefreshInterval: (interval: number) => void;
  openAlarmModal: (alarmId: string) => void;
  closeAlarmModal: () => void;
  clearNewAlarmFlag: () => void;
  openEquipmentModal: (equipmentId: string) => void;
  closeEquipmentModal: () => void;
  openMaintenanceForm: (equipmentId?: string) => void;
  closeMaintenanceForm: () => void;
  addMaintenanceRecord: (form: NewMaintenanceForm) => void;
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
  selectedEquipment: null,
  showEquipmentModal: false,
  showMaintenanceForm: false,
  maintenanceFormEquipment: null,
  localMaintenanceRecords: [],
  localEquipmentUpdates: {},

  fetchData: async () => {
    try {
      set({ loading: true, error: null });
      await new Promise((resolve) => setTimeout(resolve, 500));
      const freshData = generateDashboardData();
      const { localMaintenanceRecords, localEquipmentUpdates } = get();

      const mergedRecords = [
        ...localMaintenanceRecords,
        ...freshData.maintenanceRecords.filter(
          (r) => !localMaintenanceRecords.some((lr) => lr.id === r.id)
        ),
      ].sort(
        (a, b) => new Date(b.maintenanceDate).getTime() - new Date(a.maintenanceDate).getTime()
      );

      const mergedEquipments = freshData.equipments.map((eq) => {
        const localUpdate = localEquipmentUpdates[eq.id];
        if (localUpdate) {
          return {
            ...eq,
            lastMaintenanceDate: localUpdate.lastMaintenanceDate,
            lastMaintenanceHours: localUpdate.lastMaintenanceHours,
          };
        }
        return eq;
      });

      const updatedEquipmentNames = Object.keys(localEquipmentUpdates)
        .map((eqId) => {
          const eq = freshData.equipments.find((e) => e.id === eqId);
          return eq?.name;
        })
        .filter(Boolean) as string[];

      const mergedAlarms = freshData.alarms.map((alarm) => {
        if (alarm.type === 'maintenance') {
          const nameMatch = updatedEquipmentNames.some((name) =>
            alarm.location.includes(name) || alarm.message.includes(name)
          );
          if (nameMatch) {
            return { ...alarm, acknowledged: true };
          }
        }
        return alarm;
      });

      const data: DashboardData = {
        ...freshData,
        equipments: mergedEquipments,
        maintenanceRecords: mergedRecords,
        alarms: mergedAlarms,
      };

      set({ data, loading: false });
    } catch (err) {
      set({ error: '数据加载失败', loading: false });
    }
  },

  updateData: () => {
    const { data, selectedEquipment } = get();
    if (!data) return;

    const prevAlarmIds = new Set(data.alarms.filter((a) => !a.acknowledged).map((a) => a.id));
    const newData = updateDashboardData(data);
    const newUnacknowledged = newData.alarms.filter((a) => !a.acknowledged);
    const newAlarms = newUnacknowledged.filter((a) => !prevAlarmIds.has(a.id));

    if (newAlarms.length > 0) {
      set({ lastNewAlarmId: newAlarms[0].id });
    }

    const updatedSelectedEquipment = selectedEquipment
      ? newData.equipments.find((e) => e.id === selectedEquipment.id) || null
      : null;

    set({ data: newData, selectedEquipment: updatedSelectedEquipment });
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

  openEquipmentModal: (equipmentId: string) => {
    const { data } = get();
    if (!data) return;
    const equipment = data.equipments.find((e) => e.id === equipmentId);
    if (equipment) {
      set({ selectedEquipment: equipment, showEquipmentModal: true });
    }
  },

  closeEquipmentModal: () => {
    set({ showEquipmentModal: false, selectedEquipment: null });
  },

  openMaintenanceForm: (equipmentId?: string) => {
    const { data } = get();
    if (!data) return;
    let equipment: Equipment | null = null;
    if (equipmentId) {
      equipment = data.equipments.find((e) => e.id === equipmentId) || null;
    }
    set({ showMaintenanceForm: true, maintenanceFormEquipment: equipment });
  },

  closeMaintenanceForm: () => {
    set({ showMaintenanceForm: false, maintenanceFormEquipment: null });
  },

  addMaintenanceRecord: (form: NewMaintenanceForm) => {
    const { data, localMaintenanceRecords, localEquipmentUpdates } = get();
    if (!data) return;

    const equipment = data.equipments.find((e) => e.id === form.equipmentId);
    if (!equipment) return;

    const now = new Date();
    const newRecord: MaintenanceRecord = {
      id: `maint-new-${Date.now()}`,
      equipmentId: form.equipmentId,
      equipmentName: equipment.name,
      maintenanceType: form.maintenanceType,
      operator: form.operator,
      maintenanceDate: now.toISOString(),
      durationMinutes: form.durationMinutes,
      description: form.description,
      partsReplaced: form.partsReplaced.length > 0 ? form.partsReplaced : undefined,
      nextMaintenanceDate:
        form.maintenanceType === 'routine' || form.maintenanceType === 'inspection'
          ? new Date(now.getTime() + getMaintenanceCycle(equipment.type) * 60 * 60 * 1000).toISOString()
          : undefined,
      notes: form.notes,
    };

    const updatedEquipments = data.equipments.map((e) => {
      if (e.id !== form.equipmentId) return e;
      return {
        ...e,
        lastMaintenanceDate: now.toISOString(),
        lastMaintenanceHours: e.totalRunningHours,
      };
    });

    const updatedAlarms = data.alarms.map((a) => {
      if (a.type === 'maintenance' && !a.acknowledged) {
        if (a.location.includes(equipment.name) || a.message.includes(equipment.name)) {
          return { ...a, acknowledged: true };
        }
      }
      return a;
    });

    const newLocalEquipmentUpdates = {
      ...localEquipmentUpdates,
      [form.equipmentId]: {
        lastMaintenanceDate: now.toISOString(),
        lastMaintenanceHours: equipment.totalRunningHours,
      },
    };

    set({
      data: {
        ...data,
        equipments: updatedEquipments,
        alarms: updatedAlarms,
        maintenanceRecords: [newRecord, ...data.maintenanceRecords],
      },
      localMaintenanceRecords: [newRecord, ...localMaintenanceRecords],
      localEquipmentUpdates: newLocalEquipmentUpdates,
      showMaintenanceForm: false,
      maintenanceFormEquipment: null,
    });
  },
}));
