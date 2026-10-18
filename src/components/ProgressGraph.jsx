import React from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { shortLabel, weekdayLabel } from '@/lib/dateUtils';

export default function ProgressGraph({ data }) {
  const chartData = data.map((d) => ({
    date: d.date,
    label: shortLabel(d.date),
    count: d.count
  }));

  return (
    <div className="bg-surface rounded-2xl border border-surface card-shadow p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-heading font-bold text-pri text-lg">Tasks Completed</h2>
          <p className="text-sec text-xs">Last 14 days</p>
        </div>
      </div>
      <div className="h-56 sm:h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="taskGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--app-accent)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--app-accent)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-border)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--surface-border)' }}
              interval={1}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={28}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--surface-border)',
                borderRadius: 12,
                color: 'var(--text-primary)',
                fontSize: 12
              }}
              labelStyle={{ color: 'var(--text-secondary)', marginBottom: 4 }}
              formatter={(value) => [`${value} done`, 'Tasks']}
              labelFormatter={(label, payload) => {
                const p = payload && payload[0];
                return p ? `${weekdayLabel(p.payload.date)} · ${label}` : label;
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--app-accent)"
              strokeWidth={3}
              fill="url(#taskGrad)"
              dot={{ r: 3, fill: 'var(--app-accent)', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: 'var(--app-accent)', strokeWidth: 2, stroke: 'var(--surface)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}