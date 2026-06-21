import type { DashboardData, ProcessData, Workstation, Equipment, Alarm, CategoryPassRate } from '@/types';

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
    const rand = Math.random();
    let status: Equipment['status'] = 'running';
    if (rand > 0.85) status = 'fault';
    else if (rand > 0.7) status = 'standby';

    const isRunning = status === 'running';
    const progress = isRunning ? randomInt(10, 95) : 0;
    const remaining = isRunning ? Math.ceil((100 - progress) * 0.3) : undefined;

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
    };
  });
}

export function generateAlarms(): Alarm[] {
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

export function generateDashboardData(): DashboardData {
  return {
    processes: generateProcesses(),
    workstations: generateWorkstations(),
    equipments: generateEquipments(),
    alarms: generateAlarms(),
    production: generateProductionData(),
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
    if (eq.status === 'running') {
      let newProgress = eq.progress + randomInt(1, 5);
      if (newProgress >= 100) {
        newProgress = 0;
        return {
          ...eq,
          progress: newProgress,
          currentBatch: randomChoice(batchTypes),
          itemCount: randomInt(8, 25),
          remainingMinutes: randomInt(20, 45),
        };
      }
      return {
        ...eq,
        progress: newProgress,
        remainingMinutes: Math.ceil((100 - newProgress) * 0.3),
      };
    }
    if (eq.status === 'fault' && Math.random() > 0.95) {
      return {
        ...eq,
        status: 'standby' as Equipment['status'],
        faultMessage: undefined,
        progress: 0,
      };
    }
    if (eq.status === 'standby' && Math.random() > 0.8) {
      return {
        ...eq,
        status: 'running' as Equipment['status'],
        progress: randomInt(5, 20),
        currentBatch: randomChoice(batchTypes),
        itemCount: randomInt(8, 25),
        remainingMinutes: randomInt(20, 40),
      };
    }
    return eq;
  });

  let newAlarms = prev.alarms.filter((a) => {
    const age = Date.now() - new Date(a.timestamp).getTime();
    return age < 3600000;
  });

  if (Math.random() > 0.92) {
    const isFault = Math.random() > 0.5;
    newAlarms.unshift({
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
    });
  }

  const newCompleted = prev.production.completedCount + (Math.random() > 0.7 ? randomInt(1, 5) : 0);

  return {
    processes: newProcesses,
    workstations: newWorkstations,
    equipments: newEquipments,
    alarms: newAlarms,
    production: {
      ...prev.production,
      completedCount: newCompleted,
    },
    lastUpdate: new Date().toISOString(),
  };
}
