import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ProcessData } from '@/types';
import { formatNumber } from '@/utils/formatters';

interface ProcessCardProps {
  data: ProcessData;
  index: number;
}

const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  receiving: { bg: 'from-blue-600/20 to-blue-900/10', border: 'border-blue-500/30', text: 'text-blue-400', glow: 'text-glow-blue' },
  pretreatment: { bg: 'from-purple-600/20 to-purple-900/10', border: 'border-purple-500/30', text: 'text-purple-400', glow: '' },
  washing: { bg: 'from-cyan-600/20 to-cyan-900/10', border: 'border-cyan-500/30', text: 'text-cyan-400', glow: 'text-glow-cyan' },
  finishing: { bg: 'from-amber-600/20 to-amber-900/10', border: 'border-amber-500/30', text: 'text-amber-400', glow: '' },
  inspection: { bg: 'from-orange-600/20 to-orange-900/10', border: 'border-orange-500/30', text: 'text-orange-400', glow: '' },
  completed: { bg: 'from-green-600/20 to-green-900/10', border: 'border-green-500/30', text: 'text-green-400', glow: 'text-glow-green' },
};

export const ProcessCard: React.FC<ProcessCardProps> = ({ data, index }) => {
  const colors = colorMap[data.id] || colorMap.receiving;

  const TrendIcon = data.trend === 'up' ? TrendingUp : data.trend === 'down' ? TrendingDown : Minus;
  const trendColor = data.trend === 'up' ? 'text-green-400' : data.trend === 'down' ? 'text-red-400' : 'text-gray-400';

  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-gradient-to-br ${colors.bg} ${colors.border} border backdrop-blur-sm p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity" />

      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {data.name}
        </span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className={`text-3xl font-bold font-mono-num ${colors.text} ${colors.glow}`}>
            {formatNumber(data.count)}
          </p>
          <p className="text-xs text-slate-500 mt-1">件</p>
        </div>

        <div className={`flex items-center gap-1 ${trendColor}`}>
          <TrendIcon size={16} />
          <span className="text-xs font-medium">
            {data.trend === 'stable' ? '持平' : `${data.trendValue}%`}
          </span>
        </div>
      </div>

      <div className="mt-3 h-1 bg-slate-700/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colors.text.replace('text-', 'bg-')} transition-all duration-500`}
          style={{ width: `${Math.min(100, (data.count / 500) * 100)}%` }}
        />
      </div>
    </div>
  );
};
