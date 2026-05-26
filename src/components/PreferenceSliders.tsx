'use client';

import { motion } from 'framer-motion';

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
  { key: 'crowd' as const, label: '人少不挤', emoji: '🧘', color: 'bg-sky-400', gradient: '#38bdf8' },
  { key: 'photo' as const, label: '出片好看', emoji: '📸', color: 'bg-violet-400', gradient: '#8b5cf6' },
  { key: 'food' as const, label: '本地美食', emoji: '🍜', color: 'bg-amber-400', gradient: '#f59e0b' },
  { key: 'relax' as const, label: '行程轻松', emoji: '🌿', color: 'bg-emerald-400', gradient: '#10b981' },
  { key: 'budget' as const, label: '预算友好', emoji: '💰', color: 'bg-yellow-400', gradient: '#eab308' },
];

export function PreferenceSliders({ weights, onChange }: PreferenceSlidersProps) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);

  return (
    <div className="px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-navy-900">🎚️ 偏好权重</h3>
        <span className="text-xs text-gray-400">
          总计: {total}% {total !== 100 && '(建议调到100%)'}
        </span>
      </div>

      <div className="space-y-3">
        {sliderConfig.map((slider, i) => (
          <motion.div
            key={slider.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-2 sm:gap-3"
          >
            <span className="text-base sm:text-lg w-6 sm:w-7">{slider.emoji}</span>
            <span className="text-[11px] sm:text-xs text-gray-600 w-14 sm:w-16 shrink-0">{slider.label}</span>
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
                background: `linear-gradient(to right, ${slider.gradient} ${weights[slider.key]}%, rgba(186, 230, 253, 0.3) ${weights[slider.key]}%)`,
              }}
            />
            <span className="text-xs font-mono text-primary-700 w-8 text-right font-medium">
              {weights[slider.key]}%
            </span>
          </motion.div>
        ))}
      </div>

      {/* Visual weight distribution */}
      <div className="mt-4 flex rounded-full overflow-hidden h-2.5 bg-primary-50">
        {sliderConfig.map((slider) =>
          weights[slider.key] > 0 ? (
            <motion.div
              key={slider.key}
              className={slider.color}
              animate={{ width: `${(weights[slider.key] / Math.max(total, 1)) * 100}%` }}
              transition={{ duration: 0.3 }}
              title={`${slider.label}: ${weights[slider.key]}%`}
            />
          ) : null
        )}
      </div>
    </div>
  );
}
