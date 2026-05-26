'use client';

import { Users, Camera, UtensilsCrossed, Battery, Wallet } from 'lucide-react';

interface PreferenceSlidersProps {
  weights: {
    crowd: number;
    photo: number;
    food: number;
    relax: number;
    budget: number;
  };
  onChange: (weights: PreferenceSlidersProps['weights']) => void;
}

const sliderConfig = [
  { key: 'crowd' as const, label: '人少', icon: Users },
  { key: 'photo' as const, label: '出片', icon: Camera },
  { key: 'food' as const, label: '美食', icon: UtensilsCrossed },
  { key: 'relax' as const, label: '轻松', icon: Battery },
  { key: 'budget' as const, label: '省钱', icon: Wallet },
];

export function PreferenceSliders({ weights, onChange }: PreferenceSlidersProps) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);

  // 计算归一化百分比（自动将总和映射到100%）
  const getNormalized = (key: keyof typeof weights) => {
    if (total === 0) return 0;
    return Math.round((weights[key] / total) * 100);
  };

  return (
    <div className="px-5 sm:px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">偏好权重</h3>
        <span className="text-2xs text-slate-400">
          拖动滑块调整比重，自动归一化到 100%
        </span>
      </div>

      <div className="space-y-3">
        {sliderConfig.map((slider) => {
          const Icon = slider.icon;
          const normalized = getNormalized(slider.key);
          return (
            <div key={slider.key} className="flex items-center gap-3">
              <div className="flex items-center gap-2 w-20 shrink-0">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-blue-600" strokeWidth={1.5} />
                </div>
                <span className="text-xs text-slate-700 font-medium">{slider.label}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={weights[slider.key]}
                onChange={(e) =>
                  onChange({ ...weights, [slider.key]: parseInt(e.target.value) })
                }
                className="flex-1 cursor-pointer appearance-none h-1.5 rounded-full"
                style={{
                  background: `linear-gradient(to right, #3B82F6 ${weights[slider.key]}%, #dbeafe ${weights[slider.key]}%)`,
                }}
              />
              <div className="w-10 text-right">
                <span className="text-xs font-mono font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  {normalized}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Distribution bar */}
      <div className="mt-3 flex rounded-full overflow-hidden h-1.5 bg-slate-100">
        {sliderConfig.map((slider) =>
          weights[slider.key] > 0 ? (
            <div
              key={slider.key}
              className="bg-blue-500 transition-all duration-300"
              style={{ width: `${getNormalized(slider.key)}%`, opacity: 0.4 + (getNormalized(slider.key) / 100) * 0.6 }}
            />
          ) : null
        )}
      </div>
    </div>
  );
}
