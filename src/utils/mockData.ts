import type { DashboardData, ProcessData, Workstation, Equipment, Alarm, CategoryPassRate, MaintenanceRecord, EquipmentType, BatchTrackInfo, ProcessStepRecord, ProcessType } from '@/types';

const processNames: { id: string; name: string }[] = [
  { id: 'receiving', name: '收衣待分拣' },
  { id: 'pretreatment', name: '预处理中' },
  { id: 'washing', name: '主洗中' },
  { id: 'finishing', name: '后整中' },
  { id: 'inspection', name: '质检待检' },
  { id: 'completed', name: '已完成' },
];

const workstationNames = [
  '分拣工位1', '分拣工位2', '去渍工位1', '去渍工位2',
  '熨烫工位1', '熨烫工位2', '质检工位1', '质检工位2',
];

const operatorNames = [
  '张师傅', '李师傅', '王师傅', '赵师傅',
  '刘师傅', '陈师傅', '杨师傅', '周师傅',
  '吴师傅', '郑师傅', '孙师傅',
];

const maintenanceStaffNames = [
  '陈工', '李工', '王工', '赵工',
];

const equipmentData = [
  { id: 'dryer-1', name: '干洗机1号', type: 'dryer' as const },
  { id: 'dryer-2', name: '干洗机2号', type: 'dryer' as const },
  { id: 'dryer-3', name: '干洗机3号', type: 'dryer' as const },
  { id: 'washer-1', name: '水洗机1号', type: 'washer' as const },
  { id: 'washer-2', name: '水洗机2号', type: 'washer' as const },
  { id: 'drying-1', name: '烘干机1号', type: 'drying_rack' as const },
  { id: 'drying-2', name: '烘干机2号', type: 'drying_rack' as const },
  { id: 'ironing-1', name: '烫台1号', type: 'ironing' as const },
  { id: 'ironing-2', name: '烫台2号', type: 'ironing' as const },
];

const batchTypes = [
  '羊毛大衣', '真丝衬衫', '西装套装', '羽绒服',
  '羊绒衫', '风衣', '牛仔裤', '连衣裙',
];

const garmentCategories = ['羊毛大衣', '真丝衬衫', '西装套装', '羽绒服', '羊绒衫', '日常服饰'];

const maintenanceTypeLabels = {
  routine: '例行保养',
  repair: '故障维修',
  inspection: '定期检查',
  emergency: '紧急抢修',
};

export const MAINTENANCE_CYCLES: Record<EquipmentType, number> = {
  dryer: 500,
  washer: 400,
  drying_rack: 600,
  ironing: 300,
};

export const getMaintenanceCycle = (type: EquipmentType): number => MAINTENANCE_CYCLES[type];

export const calculateMaintenanceStatus = (eq: Equipment): {
  remainingPercent: number;
  remainingHours: number;
  status: 'normal' | 'warning' | 'overdue';
} => {
  const hoursSinceLastMaintenance = eq.totalRunningHours - eq.lastMaintenanceHours;
  const remainingHours = eq.maintenanceCycleHours - hoursSinceLastMaintenance;
  const remainingPercent = Math.max(-50, Math.min(100, (remainingHours / eq.maintenanceCycleHours) * 100));

  let status: 'normal' | 'warning' | 'overdue' = 'normal';
  if (remainingPercent <= 0) {
    status = 'overdue';
  } else if (remainingPercent <= 20) {
    status = 'warning';
  }

  return { remainingPercent, remainingHours, status };
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateProcesses(): ProcessData[] {
  const baseCounts = [320, 180, 150, 200, 120, 850];
  return processNames.map((p, i) => {
    const trend = randomChoice(['up', 'down', 'stable']);
    return {
      id: p.id as ProcessData['id'],
      name: p.name,
      count: baseCounts[i] + randomInt(-20, 30),
      trend: trend as 'up' | 'down' | 'stable',
      trendValue: randomInt(1, 15),
    };
  });
}

export function generateWorkstations(): Workstation[] {
  return workstationNames.map((name, i) => {
    const isBusy = Math.random() > 0.3;
    return {
      id: `ws-${i + 1}`,
      name,
      operator: operatorNames[i],
      status: isBusy ? 'busy' : 'idle',
      currentTask: isBusy ? randomChoice(batchTypes) : undefined,
      startTime: isBusy ? new Date(Date.now() - randomInt(5, 60) * 60000).toISOString() : undefined,
    };
  });
}

export function generateEquipments(): Equipment[] {
  return equipmentData.map((eq) => {
    const cycleHours = getMaintenanceCycle(eq.type);
    const rand = Math.random();
    let status: Equipment['status'] = 'running';
    if (rand > 0.85) status = 'fault';
    else if (rand > 0.7) status = 'standby';

    const isRunning = status === 'running';
    const progress = isRunning ? randomInt(10, 95) : 0;
    const remaining = isRunning ? Math.ceil((100 - progress) * 0.3) : undefined;

    const totalHours = randomInt(200, cycleHours * 3);
    const maintenanceCount = Math.floor(totalHours / cycleHours);
    const lastMaintenanceHours = maintenanceCount * cycleHours;

    return {
      id: eq.id,
      name: eq.name,
      type: eq.type,
      status,
      currentBatch: isRunning || status === 'standby' ? randomChoice(batchTypes) : undefined,
      itemCount: isRunning || status === 'standby' ? randomInt(8, 25) : undefined,
      progress,
      remainingMinutes: remaining,
      faultMessage: status === 'fault' ? randomChoice([
        '溶剂不足，请及时补充',
        '温度异常，已自动停机',
        '电机过载，请检查负载',
        '排水故障，请检查管路',
      ]) : undefined,
      totalRunningHours: totalHours,
      lastMaintenanceHours,
      lastMaintenanceDate: new Date(Date.now() - randomInt(1, 30) * 24 * 60 * 60 * 1000).toISOString(),
      maintenanceCycleHours: cycleHours,
    };
  });
}

export function generateAlarms(equipments: Equipment[]): Alarm[] {
  const now = Date.now();
  const alarms: Alarm[] = [];

  if (Math.random() > 0.3) {
    alarms.push({
      id: `alarm-timeout-${randomInt(100, 999)}`,
      type: 'timeout',
      level: 'warning',
      title: '衣物停留超时',
      message: '真丝衬衫 #S2024001 已在预处理工位停留 2小时15分',
      location: '预处理 - 去渍工位1',
      timestamp: new Date(now - randomInt(30, 120) * 60000).toISOString(),
      acknowledged: false,
      suggestion: '请检查是否有异常情况，及时安排处理',
    });
  }

  if (Math.random() > 0.5) {
    const faultEq = equipments.find((e) => e.status === 'fault');
    if (faultEq) {
      alarms.push({
        id: `alarm-fault-${randomInt(100, 999)}`,
        type: 'equipment_fault',
        level: 'danger',
        title: '设备故障报警',
        message: `${faultEq.name}${faultEq.faultMessage ? `：${faultEq.faultMessage}` : ''}`,
        location: `主洗车间 - ${faultEq.name}`,
        timestamp: new Date(now - randomInt(5, 30) * 60000).toISOString(),
        acknowledged: false,
        suggestion: '请立即联系维护人员处理',
      });
    } else {
      alarms.push({
        id: `alarm-fault-${randomInt(100, 999)}`,
        type: 'equipment_fault',
        level: 'danger',
        title: '设备故障报警',
        message: '干洗机3号溶剂不足，已暂停当前批次',
        location: '主洗车间 - 干洗机3号',
        timestamp: new Date(now - randomInt(5, 30) * 60000).toISOString(),
        acknowledged: false,
        suggestion: '请立即联系维护人员添加干洗溶剂',
      });
    }
  }

  if (Math.random() > 0.7) {
    alarms.push({
      id: `alarm-timeout-2-${randomInt(100, 999)}`,
      type: 'timeout',
      level: 'warning',
      title: '衣物停留超时',
      message: '羊毛大衣 #W2024056 已在质检工位停留 1小时40分',
      location: '质检区 - 质检工位2',
      timestamp: new Date(now - randomInt(60, 180) * 60000).toISOString(),
      acknowledged: true,
      suggestion: '已通知质检员优先处理',
    });
  }

  equipments.forEach((eq) => {
    const mStatus = calculateMaintenanceStatus(eq);
    if (mStatus.status === 'overdue' && Math.random() > 0.4) {
      alarms.push({
        id: `alarm-maint-${eq.id}`,
        type: 'maintenance',
        level: 'warning',
        title: '设备保养超期',
        message: `${eq.name} 已超期 ${Math.abs(mStatus.remainingHours)} 小时未保养`,
        location: `设备维保 - ${eq.name}`,
        timestamp: new Date(now - randomInt(60, 300) * 60000).toISOString(),
        acknowledged: false,
        suggestion: '请尽快安排维保人员进行保养作业',
      });
    } else if (mStatus.status === 'warning' && Math.random() > 0.7) {
      alarms.push({
        id: `alarm-maint-warn-${eq.id}`,
        type: 'maintenance',
        level: 'warning',
        title: '设备即将到期保养',
        message: `${eq.name} 剩余保养寿命 ${mStatus.remainingHours} 小时`,
        location: `设备维保 - ${eq.name}`,
        timestamp: new Date(now - randomInt(10, 60) * 60000).toISOString(),
        acknowledged: false,
        suggestion: '请提前安排维保计划',
      });
    }
  });

  return alarms.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function generateCategories(): CategoryPassRate[] {
  return garmentCategories.map((cat) => {
    const total = randomInt(50, 200);
    const passRate = randomInt(85, 98);
    return {
      category: cat,
      total,
      passed: Math.floor(total * passRate / 100),
      passRate,
    };
  });
}

export function generateProductionData() {
  const categories = generateCategories();
  const totalPassed = categories.reduce((sum, c) => sum + c.passed, 0);
  const total = categories.reduce((sum, c) => sum + c.total, 0);
  return {
    targetCount: 1200,
    completedCount: totalPassed + randomInt(100, 300),
    passRate: Math.round((totalPassed / total) * 100),
    categories,
  };
}

export function generateMaintenanceRecords(equipments: Equipment[]): MaintenanceRecord[] {
  const records: MaintenanceRecord[] = [];
  const descriptions: Record<string, string[]> = {
    routine: [
      '设备全面清洁保养',
      '润滑系统检查与加油',
      '皮带张紧度调整',
      '过滤器清洗更换',
      '电气线路检查紧固',
    ],
    repair: [
      '更换电机轴承',
      '维修加热管组件',
      '更换排水电磁阀',
      '修复控制面板',
      '更换温度传感器',
    ],
    inspection: [
      '季度安全性能检测',
      '压力容器年检',
      '电气绝缘测试',
      '振动噪音检测',
    ],
    emergency: [
      '紧急停机故障排除',
      '突发泄漏抢修',
      '过载跳闸故障处理',
    ],
  };

  equipments.forEach((eq) => {
    const recordCount = randomInt(1, 4);
    const maintenanceTypeKeys: MaintenanceRecord['maintenanceType'][] = ['routine', 'repair', 'inspection', 'emergency'];
    for (let i = 0; i < recordCount; i++) {
      const mType = randomChoice(maintenanceTypeKeys);
      const date = new Date(Date.now() - randomInt(1, 60) * 24 * 60 * 60 * 1000);
      records.push({
        id: `maint-${eq.id}-${Date.now()}-${i}`,
        equipmentId: eq.id,
        equipmentName: eq.name,
        maintenanceType: mType,
        operator: randomChoice(maintenanceStaffNames),
        maintenanceDate: date.toISOString(),
        durationMinutes: randomInt(30, 240),
        description: randomChoice(descriptions[mType]),
        partsReplaced: mType === 'repair' || mType === 'emergency'
          ? [
              randomChoice(['轴承', '密封圈', '加热管', '电磁阀', '传感器', '皮带', '过滤器']),
              ...(Math.random() > 0.5 ? [randomChoice(['润滑油', '螺丝套件', '垫片组件'])] : []),
            ]
          : undefined,
        nextMaintenanceDate: mType === 'routine' || mType === 'inspection'
          ? new Date(date.getTime() + getMaintenanceCycle(eq.type) * 60 * 60 * 1000).toISOString()
          : undefined,
        notes: Math.random() > 0.5 ? '设备运行状态良好' : undefined,
      });
    }
  });

  return records.sort(
    (a, b) => new Date(b.maintenanceDate).getTime() - new Date(a.maintenanceDate).getTime()
  );
}

const batchCategoryPrefixes: Record<string, string> = {
  '羊毛大衣': 'W',
  '真丝衬衫': 'S',
  '西装套装': 'SU',
  '羽绒服': 'D',
  '羊绒衫': 'CA',
  '风衣': 'T',
  '牛仔裤': 'J',
  '连衣裙': 'DR',
};

export function generateBatchTrackInfo(
  batchId: string,
  category: string,
  currentProcess: ProcessType
): BatchTrackInfo {
  const processOrder: ProcessType[] = [
    'receiving',
    'pretreatment',
    'washing',
    'finishing',
    'inspection',
    'completed',
  ];
  const currentIndex = processOrder.indexOf(currentProcess);
  const now = Date.now();
  const totalItems = randomInt(8, 30);

  const processStepDurations: Record<ProcessType, { min: number; max: number }> = {
    receiving: { min: 10, max: 30 },
    pretreatment: { min: 20, max: 90 },
    washing: { min: 40, max: 80 },
    finishing: { min: 30, max: 100 },
    inspection: { min: 15, max: 50 },
    completed: { min: 5, max: 20 },
  };

  const processSteps: ProcessStepRecord[] = processOrder.map((pType, idx) => {
    const pInfo = processNames.find((pn) => pn.id === pType)!;
    const durationRange = processStepDurations[pType];
    const duration = randomInt(durationRange.min, durationRange.max);

    let status: ProcessStepRecord['status'] = 'pending';
    let startTime: string | undefined;
    let endTime: string | undefined;
    let durationMinutes: number | undefined;

    if (idx < currentIndex) {
      status = 'completed';
      durationMinutes = duration;
      const stepEndTime = now - (currentIndex - idx) * randomInt(30, 90) * 60 * 1000;
      endTime = new Date(stepEndTime).toISOString();
      startTime = new Date(stepEndTime - duration * 60 * 1000).toISOString();
    } else if (idx === currentIndex) {
      status = 'in_progress';
      const startOffset = randomInt(10, durationRange.max - 5);
      startTime = new Date(now - startOffset * 60 * 1000).toISOString();
      durationMinutes = startOffset;
    }

    let operator: string | undefined;
    let workstation: string | undefined;
    let equipment: string | undefined;

    if (status !== 'pending') {
      operator = randomChoice(operatorNames);
      if (pType === 'receiving') {
        workstation = randomChoice(['分拣工位1', '分拣工位2']);
      } else if (pType === 'pretreatment') {
        workstation = randomChoice(['去渍工位1', '去渍工位2']);
      } else if (pType === 'washing') {
        equipment = randomChoice([
          '干洗机1号',
          '干洗机2号',
          '干洗机3号',
          '水洗机1号',
          '水洗机2号',
        ]);
      } else if (pType === 'finishing') {
        workstation = randomChoice(['熨烫工位1', '熨烫工位2']);
        equipment = randomChoice(['烘干机1号', '烘干机2号']);
      } else if (pType === 'inspection') {
        workstation = randomChoice(['质检工位1', '质检工位2']);
      }
    }

    return {
      processType: pType,
      processName: pInfo.name,
      status,
      operator,
      workstation,
      equipment,
      startTime,
      endTime,
      durationMinutes,
      itemCount: status === 'completed' ? totalItems : undefined,
      notes:
        status === 'completed' && Math.random() > 0.7
          ? randomChoice(['处理顺利', '发现轻微污渍已处理', '需特别注意面料', '加急处理'])
          : undefined,
    };
  });

  const completedSteps = processSteps.filter(
    (s) => s.status === 'completed' && s.durationMinutes
  );
  const totalDuration = completedSteps.reduce(
    (sum, s) => sum + (s.durationMinutes || 0),
    0
  );

  const currentStep = processSteps.find((s) => s.status === 'in_progress');
  if (currentStep?.durationMinutes) {
    totalDuration + currentStep.durationMinutes;
  }

  let slowestStep: BatchTrackInfo['slowestStep'] | undefined;
  if (completedSteps.length > 0) {
    const slowest = completedSteps.reduce((prev, curr) =>
      (curr.durationMinutes || 0) > (prev.durationMinutes || 0) ? curr : prev
    );
    slowestStep = {
      processType: slowest.processType,
      processName: slowest.processName,
      durationMinutes: slowest.durationMinutes || 0,
    };
  }

  const prefix = batchCategoryPrefixes[category] || 'B';
  const batchName = `${category} #${prefix}${batchId}`;

  return {
    batchId,
    batchName,
    category,
    totalItems,
    priority: Math.random() > 0.85 ? 'urgent' : 'normal',
    currentProcess,
    processSteps,
    totalDurationMinutes: totalDuration || undefined,
    expectedCompletionTime:
      currentIndex < processOrder.length - 1
        ? new Date(now + randomInt(30, 180) * 60 * 1000).toISOString()
        : undefined,
    slowestStep,
  };
}

export function generateBatches(count: number = 30): BatchTrackInfo[] {
  const batches: BatchTrackInfo[] = [];
  const processOrder: ProcessType[] = [
    'receiving',
    'pretreatment',
    'washing',
    'finishing',
    'inspection',
    'completed',
  ];

  for (let i = 0; i < count; i++) {
    const category = randomChoice(batchTypes);
    const currentProcess = randomChoice(processOrder);
    const batchNum = String(2024001 + i).padStart(7, '0');
    batches.push(generateBatchTrackInfo(batchNum, category, currentProcess));
  }

  return batches;
}

export function generateDashboardData(): DashboardData {
  const equipments = generateEquipments();
  return {
    processes: generateProcesses(),
    workstations: generateWorkstations(),
    equipments,
    alarms: generateAlarms(equipments),
    production: generateProductionData(),
    maintenanceRecords: generateMaintenanceRecords(equipments),
    batches: generateBatches(30),
    lastUpdate: new Date().toISOString(),
  };
}

export function updateDashboardData(prev: DashboardData): DashboardData {
  const newProcesses = prev.processes.map((p) => {
    const trend = randomChoice(['up', 'down', 'stable']);
    return {
      ...p,
      count: Math.max(0, p.count + randomInt(-5, 8)),
      trend: trend as 'up' | 'down' | 'stable',
      trendValue: randomInt(1, 10),
    };
  });

  const newWorkstations = prev.workstations.map((ws) => {
    if (Math.random() > 0.9) {
      const newStatus = ws.status === 'busy' ? 'idle' : 'busy';
      return {
        ...ws,
        status: newStatus as Workstation['status'],
        currentTask: newStatus === 'busy' ? randomChoice(batchTypes) : undefined,
        startTime: newStatus === 'busy' ? new Date().toISOString() : undefined,
      };
    }
    return ws;
  });

  const newEquipments = prev.equipments.map((eq) => {
    let updatedEq = { ...eq };

    if (eq.status === 'running') {
      let newProgress = eq.progress + randomInt(1, 5);
      updatedEq.totalRunningHours = eq.totalRunningHours + (randomInt(1, 3) / 60);
      if (newProgress >= 100) {
        newProgress = 0;
        updatedEq = {
          ...updatedEq,
          progress: newProgress,
          currentBatch: randomChoice(batchTypes),
          itemCount: randomInt(8, 25),
          remainingMinutes: randomInt(20, 45),
        };
      } else {
        updatedEq = {
          ...updatedEq,
          progress: newProgress,
          remainingMinutes: Math.ceil((100 - newProgress) * 0.3),
        };
      }
    }

    if (eq.status === 'fault' && Math.random() > 0.95) {
      updatedEq = {
        ...updatedEq,
        status: 'standby' as Equipment['status'],
        faultMessage: undefined,
        progress: 0,
      };
    }

    if (eq.status === 'standby' && Math.random() > 0.8) {
      updatedEq = {
        ...updatedEq,
        status: 'running' as Equipment['status'],
        progress: randomInt(5, 20),
        currentBatch: randomChoice(batchTypes),
        itemCount: randomInt(8, 25),
        remainingMinutes: randomInt(20, 40),
      };
    }

    return updatedEq;
  });

  let newAlarms = prev.alarms.filter((a) => {
    const age = Date.now() - new Date(a.timestamp).getTime();
    return age < 3600000 * 6;
  });

  const prevAlarmIds = new Set(newAlarms.map((a) => a.id));

  if (Math.random() > 0.92) {
    const isFault = Math.random() > 0.5;
    const alarm: Alarm = {
      id: `alarm-new-${Date.now()}`,
      type: isFault ? 'equipment_fault' : 'timeout',
      level: isFault ? 'danger' : 'warning',
      title: isFault ? '设备故障报警' : '衣物停留超时',
      message: isFault
        ? `${randomChoice(equipmentData).name} 检测到异常`
        : `${randomChoice(batchTypes)} #${randomInt(100, 999)} 处理超时`,
      location: isFault ? '主洗车间' : randomChoice(workstationNames),
      timestamp: new Date().toISOString(),
      acknowledged: false,
      suggestion: isFault ? '请立即联系维护人员处理' : '请优先处理该批次衣物',
    };
    if (!prevAlarmIds.has(alarm.id)) {
      newAlarms.unshift(alarm);
    }
  }

  newEquipments.forEach((eq) => {
    const mStatus = calculateMaintenanceStatus(eq);
    if (mStatus.status === 'overdue' && Math.random() > 0.985) {
      const alarmId = `alarm-maint-overdue-${eq.id}-${Date.now()}`;
      if (!prevAlarmIds.has(alarmId)) {
        newAlarms.unshift({
          id: alarmId,
          type: 'maintenance',
          level: 'warning',
          title: '设备保养超期',
          message: `${eq.name} 已超期 ${Math.abs(mStatus.remainingHours)} 小时未保养`,
          location: `设备维保 - ${eq.name}`,
          timestamp: new Date().toISOString(),
          acknowledged: false,
          suggestion: '请尽快安排维保人员进行保养作业',
        });
      }
    }
  });

  newAlarms = newAlarms.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const newCompleted = prev.production.completedCount + (Math.random() > 0.7 ? randomInt(1, 5) : 0);

  const newBatches = prev.batches.map((batch) => {
    if (Math.random() > 0.9) {
      const processOrder: ProcessType[] = [
        'receiving',
        'pretreatment',
        'washing',
        'finishing',
        'inspection',
        'completed',
      ];
      const currentIdx = processOrder.indexOf(batch.currentProcess);
      if (currentIdx < processOrder.length - 1) {
        const nextProcess = processOrder[currentIdx + 1];
        return generateBatchTrackInfo(batch.batchId, batch.category, nextProcess);
      }
    }
    return batch;
  });

  return {
    processes: newProcesses,
    workstations: newWorkstations,
    equipments: newEquipments,
    alarms: newAlarms,
    production: {
      ...prev.production,
      completedCount: newCompleted,
    },
    maintenanceRecords: prev.maintenanceRecords,
    batches: newBatches,
    lastUpdate: new Date().toISOString(),
  };
}

export { maintenanceTypeLabels };
