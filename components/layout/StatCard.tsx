import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  badge?: string;
  accentColor?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  badge,
  accentColor = 'text-blue-400',
}: StatCardProps) {
  return (
    <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-4 shadow-lg flex flex-col justify-between hover:border-gray-700 transition">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider font-mono">
            {title}
          </span>
          <h3 className="text-2xl font-bold text-white mt-1 font-mono tracking-tight">{value}</h3>
        </div>
        <div className={`p-2.5 bg-gray-950 border border-gray-800 rounded-xl ${accentColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend || badge) && (
        <div className="mt-3 pt-2 border-t border-gray-800/60 flex items-center justify-between text-xs font-mono">
          {subtitle && <span className="text-gray-400 text-[11px]">{subtitle}</span>}
          {trend && (
            <span className={`text-[11px] font-semibold ${trendPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend}
            </span>
          )}
          {badge && (
            <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
