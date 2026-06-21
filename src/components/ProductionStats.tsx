import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Target, TrendingUp, CheckCircle } from 'lucide-react';
import type { ProductionData } from '@/types';
import { formatNumber, formatPercent } from '@/utils/formatters';

interface ProductionStatsProps {
  data: ProductionData;
}

export const ProductionStats: React.FC<ProductionStatsProps> = ({ data }) => {
  const progressPercent = Math.min(100, (data.completedCount / data.targetCount) * 100);

  const barChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: 'rgba(148, 163, 184, 0.2)',
      textStyle: { color: '#e2e8f0', fontSize: 12 },
      formatter: (params: any) => {
        const item = params[0];
        const cat = data.categories.find((c) => c.category === item.name);
        return `
          <div style="padding: 4px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${item.name}</div>
            <div>合格率：<span style="color: #22c55e; font-weight: 600;">${cat?.passRate}%</span></div>
            <div>总数：${cat?.total} 件</div>
            <div>合格：${cat?.passed} 件</div>
          </div>
        `;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.categories.map((c) => c.category),
      axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.2)' } },
      axisLabel: {
        color: '#94a3b8',
        fontSize: 11,
        interval: 0,
        rotate: 0,
      },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#64748b',
        fontSize: 11,
        formatter: '{value}%',
      },
      splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.08)' } },
    },
    series: [
      {
        type: 'bar',
        data: data.categories.map((c) => ({
          value: c.passRate,
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#22c55e' },
                { offset: 1, color: '#16a34a' },
              ],
            },
            borderRadius: [4, 4, 0, 0],
          },
        })),
        barWidth: 20,
        label: {
          show: true,
          position: 'top',
          color: '#22c55e',
          fontSize: 11,
          fontWeight: 600,
          formatter: '{c}%',
        },
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="card-dark rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target size={18} className="text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">今日产能对标</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold font-mono-num text-white">
                {formatNumber(data.completedCount)}
                <span className="text-lg text-slate-500 ml-1">件</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                目标 {formatNumber(data.targetCount)} 件
              </p>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold font-mono-num ${
                progressPercent >= 80 ? 'text-green-400 text-glow-green' :
                progressPercent >= 50 ? 'text-cyan-400' : 'text-amber-400'
              }`}>
                {progressPercent.toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500 mt-1">完成率</p>
            </div>
          </div>

          <div className="relative h-4 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${
                progressPercent >= 80
                  ? 'bg-gradient-to-r from-green-500 to-green-400'
                  : progressPercent >= 50
                  ? 'bg-gradient-to-r from-cyan-500 to-cyan-400'
                  : 'bg-gradient-to-r from-amber-500 to-amber-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-progress-shine" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>0</span>
            <span className="flex items-center gap-1">
              <TrendingUp size={12} className="text-green-400" />
              还需 {formatNumber(Math.max(0, data.targetCount - data.completedCount))} 件
            </span>
            <span>{formatNumber(data.targetCount)}</span>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-400" />
              <span className="text-sm text-slate-400">一次合格率</span>
            </div>
            <span className="text-xl font-bold font-mono-num text-green-400 text-glow-green">
              {formatPercent(data.passRate)}
            </span>
          </div>
        </div>
      </div>

      <div className="card-dark rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle size={18} className="text-green-400" />
          <h3 className="text-sm font-semibold text-slate-200">品类合格率统计</h3>
        </div>
        <div className="h-[220px]">
          <ReactECharts
            option={barChartOption}
            style={{ height: '100%', width: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
        </div>
      </div>
    </div>
  );
};
