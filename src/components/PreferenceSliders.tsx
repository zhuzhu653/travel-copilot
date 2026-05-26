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

  return (
    <div className="px-5 sm:px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">偏好权重</h3>
        <span className="text-2xs text-slate-400 font-mono">
          {total}%{total !== 100 && ' / 100%'}
        </span>
      </div>

      <div className="space-y-3">
        {sliderConfig.map((slider) => {
          const Icon = slider.icon;
          return (
            <div key={slider.key} className="flex items-center gap-3">
              <div className="flex items-center gap-2 w-16 shrink-0">
                <Icon className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
                <span className="text-xs text-slate-600">{slider.label}</span>
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
                className="flex-1 cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #0c8ce9 ${weights[slider.key]}%, #e2e8f0 ${weights[slider.key]}%)`,
                }}
              />
              <span className="text-2xs font-mono text-slate-500 w-7 text-right">
                {weights[slider.key]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Distribution bar */}
      <div className="mt-3 flex rounded-full overflow-hidden h-1 bg-slate-100">
        {sliderConfig.map((slider) =>
          weights[slider.key] > 0 ? (
            <div
              key={slider.key}
              className="bg-slate-900 transition-all duration-300"
              style={{ width: `${(weights[slider.key] / Math.max(total, 1)) * 100}%`, opacity: 0.2 + (weights[slider.key] / 100) * 0.8 }}
            />
          ) : null
        )}
      </div>
    </div>
  );
}
