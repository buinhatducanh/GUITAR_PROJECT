import React from 'react';
import { LucideIcon } from 'lucide-react';

const colorMap: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
  blue:   { bg: 'from-blue-500/10 to-blue-600/10',     border: 'border-blue-500/20',   text: 'text-blue-400',   iconBg: 'bg-blue-500/20' },
  green:  { bg: 'from-green-500/10 to-green-600/10',   border: 'border-green-500/20',  text: 'text-green-400',  iconBg: 'bg-green-500/20' },
  purple: { bg: 'from-purple-500/10 to-purple-600/10', border: 'border-purple-500/20', text: 'text-purple-400', iconBg: 'bg-purple-500/20' },
  orange: { bg: 'from-orange-500/10 to-orange-600/10', border: 'border-orange-500/20', text: 'text-orange-400', iconBg: 'bg-orange-500/20' },
  yellow: { bg: 'from-yellow-500/10 to-yellow-600/10', border: 'border-yellow-500/20', text: 'text-yellow-400', iconBg: 'bg-yellow-500/20' },
  red:    { bg: 'from-red-500/10 to-red-600/10',       border: 'border-red-500/20',    text: 'text-red-400',    iconBg: 'bg-red-500/20' },
};

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: keyof typeof colorMap;
}

export const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color }) => {
  const c = colorMap[color] || colorMap.blue;
  return (
    <div className={`bg-gradient-to-br ${c.bg} rounded-xl p-4 border ${c.border}`}>
      <div className="flex items-center gap-3">
        <div className={`p-3 ${c.iconBg} rounded-lg`}>
          <Icon className={`w-6 h-6 ${c.text}`} />
        </div>
        <div>
          <p className="text-white/60 text-sm">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
};
