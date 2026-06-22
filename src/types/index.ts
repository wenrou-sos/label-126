export type ProcessType = 'receiving' | 'pretreatment' | 'washing' | 'finishing' | 'inspection' | 'completed';

export interface ProcessData {
  id: ProcessType;
  name: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}

export type WorkstationStatus = 'idle' | 'busy';

export interface Workstation {
  id: string;
  name: string;
  operator: string;
  status: WorkstationStatus;
  currentTask?: string;
  startTime?: string;
}

export type EquipmentStatus = 'running' | 'standby' | 'fault';
export type EquipmentType = 'dryer' | 'washer' | 'drying_rack' | 'ironing';

export interface MaintenanceCycle {
  equipmentType: EquipmentType;
  maintenanceIntervalHours: number;
  warningThresholdPercent: number;
}

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  status: EquipmentStatus;
  currentBatch?: string;
  itemCount?: number;
  progress: number;
  remainingMinutes?: number;
  faultMessage?: string;
  totalRunningHours: number;
  lastMaintenanceDate: string;
  lastMaintenanceHours: number;
  maintenanceCycleHours: number;
}

export type MaintenanceStatus = 'normal' | 'warning' | 'overdue';

export type MaintenanceType = 'routine' | 'repair' | 'inspection' | 'emergency';

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  maintenanceType: MaintenanceType;
  operator: string;
  maintenanceDate: string;
  durationMinutes: number;
  description: string;
  partsReplaced?: string[];
  nextMaintenanceDate?: string;
  notes?: string;
}

export type AlarmType = 'timeout' | 'equipment_fault' | 'maintenance';

export type AlarmLevel = 'warning' | 'danger';

export interface Alarm {
  id: string;
  type: AlarmType;
  level: AlarmLevel;
  title: string;
  message: string;
  location: string;
  timestamp: string;
  acknowledged: boolean;
  suggestion?: string;
}

export interface CategoryPassRate {
  category: string;
  passRate: number;
  total: number;
  passed: number;
}

export interface ProductionData {
  targetCount: number;
  completedCount: number;
  passRate: number;
  categories: CategoryPassRate[];
}

export interface DashboardData {
  processes: ProcessData[];
  workstations: Workstation[];
  equipments: Equipment[];
  alarms: Alarm[];
  production: ProductionData;
  maintenanceRecords: MaintenanceRecord[];
  lastUpdate: string;
}
