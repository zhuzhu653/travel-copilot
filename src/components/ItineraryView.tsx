'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Star,
  Users,
  Footprints,
  Shuffle,
  Eye,
  Gift,
  Camera,
  Coffee,
  Palette,
  UtensilsCrossed,
  X,
  Zap,
  LayoutGrid,
  AlignJustify,
  Activity,
  Bot,
  ChevronRight,
  Lightbulb,
  Loader,
} from 'lucide-react';
import type { Itinerary, SpotCard, UserPreferences } from '@/app/page';
import { MapView } from './MapView';

interface ItineraryViewProps {
  itinerary: Itinerary;
  preferences: UserPreferences;
  onBack: () => void;
  onVersionSwitch: (version: string) => Promise<Itinerary | null>;
  cachedVersions?: Record<string, Itinerary>;
}

const versions = [
  { id: 'classic', label: '保留原计划', desc: '', icon: MapPin },
  { id: 'relax', label: '轻松版', desc: '减少步行', icon: Coffee },
  { id: 'rainy', label: '雨天版', desc: '室内优先', icon: Eye },
  { id: 'photo', label: '拍照优先版', desc: '出片为主', icon: Camera },
];

export function ItineraryView({ itinerary, preferences, onBack, onVersionSwitch, cachedVersions = {} }: ItineraryViewProps) {
  const [activeDay, setActiveDay] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [activeVersion, setActiveVersion] = useState('classic');
  const [showAlert, setShowAlert] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'river'>('cards');
  const [revealedLucky, setRevealedLucky] = useState<Set<string>>(new Set());
  const [currentItinerary, setCurrentItinerary] = useState<Itinerary>(itinerary);
  const [versionCache, setVersionCache] = useState<Record<string, Itinerary>>({ classic: itinerary, ...cachedVersions });
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [highlightedSpot, setHighlightedSpot] = useState<number | null>(null);
  const spotRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleVersionSwitch = async (versionId: string, label: string) => {
    setActiveVersion(versionId);
    if (label === '保留原计划') {
      setCurrentItinerary(versionCache['classic'] || itinerary);
      return;
    }
    // Check cache first
    if (versionCache[versionId]) {
      setCurrentItinerary(versionCache[versionId]);
      return;
    }
    // Generate new version
    setIsRegenerating(true);
    const result = await onVersionSwitch(label);
    if (result) {
      setVersionCache(prev => ({ ...prev, [versionId]: result }));
      setCurrentItinerary(result);
    }
    setIsRegenerating(false);
  };

  const handleMapSpotClick = (index: number) => {
    setHighlightedSpot(index);
    spotRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => setHighlightedSpot(null), 2000);
  };

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pb-24 bg-slate-50/50"
    >
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={onBack}
              className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1.5 font-medium transition-colors"
            >
              <ArrowLeft size={16} />
              返回对话
            </button>
            <span className="text-xs bg-slate-50 text-slate-600 px-3 py-1 rounded-lg border border-slate-100 font-medium">
              {itinerary.version}
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">{itinerary.title}</h1>
          {/* Travel Card button */}

        </div>

        {/* Day tabs + view toggle */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex items-center justify-between pb-3">
          <div className="flex gap-2">
            {itinerary.days.map((day, i) => (
              <button
                key={day.dayNumber}
                onClick={() => setActiveDay(i)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                  activeDay === i
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none'
                    : 'bg-white text-slate-500 hover:text-slate-700 border border-blue-100/60'
                }`}
              >
                Day {day.dayNumber}
              </button>
            ))}
          </div>
          {/* View mode toggle */}
          <div className="flex gap-0.5 bg-slate-50/50 rounded-xl p-1 border border-blue-100/50">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-white shadow-sm text-blue-600 font-semibold' : 'text-slate-400'}`}
              title="卡牌视图"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('river')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'river' ? 'bg-white shadow-sm text-blue-600 font-semibold' : 'text-slate-400'}`}
              title="时间线视图"
            >
              <AlignJustify size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Adjustment Alert */}
      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-3xl mx-auto px-4 sm:px-6 mt-4"
          >
            <div className="bg-white rounded-2xl p-5 border border-blue-100/60 shadow-sm relative">
              <button
                onClick={() => setShowAlert(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>

              <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <Bot size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium mt-1">
                    下午 2 点气温较高，当前路线连续室外步行 2.8 小时，建议插入 45 分钟室内休息点，并减少 1 个低优先级点位。
                  </p>
                </div>
              </div>

              <div className="pl-11 space-y-2">
                <p className="text-xs text-slate-400 font-medium mb-2">用户可选择：</p>
                {versions.map((v) => {
                  const Icon = v.icon;
                  return (
                    <button
                      key={v.id}
                      onClick={() => {
                        handleVersionSwitch(v.id, v.label);
                        setShowAlert(false);
                      }}
                      disabled={isRegenerating}
                      className="w-full text-left px-4 py-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-100 transition-all flex items-center justify-between group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={16} className={activeVersion === v.id ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-600'} />
                        <span className={`text-sm font-medium ${activeVersion === v.id ? 'text-blue-700' : 'text-slate-700 group-hover:text-blue-700'}`}>
                          {v.label} {v.desc && <span className="text-xs font-normal text-slate-500">({v.desc})</span>}
                        </span>
                      </div>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-400" />
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Energy Curve */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-4">
        <EnergyCurve spots={currentItinerary.days[activeDay]?.spots || []} />
      </div>

      {/* Map - linked to spots */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-4">
        <MapView
          spots={currentItinerary.days[activeDay]?.spots || []}
          city={currentItinerary.title.match(/上海|北京|杭州|成都|广州|深圳|南京|西安|重庆|武汉|长沙|厦门|苏州|青岛/)?.[0] || '上海'}
          onSpotClick={handleMapSpotClick}
        />
      </div>

      {/* Regenerating overlay */}
      {isRegenerating && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-center gap-2">
            <Loader size={16} className="text-blue-500 animate-spin" />
            <span className="text-sm text-blue-600 font-medium">正在生成新版本...</span>
          </div>
        </div>
      )}

      {/* Content: Cards or Timeline view */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-6">
        {/* AI Generator Explanation Section (Step 3 Image style) */}
        {viewMode === 'cards' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 mb-6"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-blue-100 flex items-center justify-center shrink-0 shadow-sm">
              <Bot size={16} className="text-blue-600" />
            </div>
            <div className="bg-white border border-blue-100/60 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-800 leading-relaxed mb-1.5">
                {(() => {
                  const spots = currentItinerary.days[activeDay]?.spots || [];
                  const spotNames = spots.filter(s => !s.isLuckySpot).slice(0, 3).map(s => s.name).join('、');
                  const luckyCount = spots.filter(s => s.isLuckySpot).length;
                  return `行程已生成！共 ${spots.length} 个地点：${spotNames}等${luckyCount > 0 ? `，含 ${luckyCount} 个惊喜盲盒` : ''}。每个地点附有推荐理由，滑动查看详情。`;
                })()}
              </p>
            </div>
          </motion.div>
        )}

        {viewMode === 'cards' ? (
          <div className="space-y-3">
            <AnimatePresence>
              {currentItinerary.days[activeDay]?.spots.map((spot, i) => (
                <motion.div
                  key={spot.id}
                  ref={(el) => { spotRefs.current[i] = el; }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={highlightedSpot === i ? 'ring-2 ring-blue-400 rounded-2xl transition-all' : ''}
                >
                  <SpotCardComponent
                    spot={spot}
                    isFlipped={flippedCards.has(spot.id)}
                    onFlip={() => toggleFlip(spot.id)}
                    index={i}
                    isRevealed={revealedLucky.has(spot.id)}
                    onReveal={() => setRevealedLucky(prev => new Set(prev).add(spot.id))}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <TimelineView spots={currentItinerary.days[activeDay]?.spots || []} />
        )}
      </div>

      {/* Bottom version switcher (persistent) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-blue-100/50 py-4 px-4 sm:px-6 z-10 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-2.5 justify-center relative">
          {isRegenerating && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-xl">
              <Loader size={14} className="text-blue-500 animate-spin mr-1.5" />
              <span className="text-xs text-blue-600 font-medium">切换中...</span>
            </div>
          )}
          {versions.map((v) => {
            const Icon = v.icon;
            const isCached = !!versionCache[v.id];
            return (
              <button
                key={v.id}
                onClick={() => handleVersionSwitch(v.id, v.label)}
                disabled={isRegenerating}
                className={`text-xs px-4 sm:px-5 py-2.5 rounded-xl transition-all font-semibold flex items-center gap-1.5 shadow-sm active:scale-[0.98] disabled:opacity-50 ${
                  activeVersion === v.id
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-transparent'
                    : 'bg-white text-slate-600 hover:text-blue-600 border border-blue-100'
                }`}
              >
                <Icon size={14} />
                {v.label}
                {isCached && v.id !== 'classic' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 ml-0.5" title="已缓存" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ===== Timeline View (replaces Time River) ===== */
function TimelineView({ spots }: { spots: SpotCard[] }) {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-[19px] top-2 bottom-2 w-px bg-slate-200" />

      <div className="space-y-4">
        {spots.map((spot, i) => {
          const isRest = spot.category === '休息';
          const isLucky = spot.isLuckySpot;

          return (
            <motion.div
              key={spot.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative pl-12"
            >
              {/* Timeline dot */}
              <div className={`absolute left-3 top-5 w-3 h-3 rounded-full border-2 border-white z-10 ${
                isLucky ? 'bg-[#0c8ce9]' :
                isRest ? 'bg-slate-300' :
                'bg-slate-900'
              }`} />

              {/* Spot content card */}
              <div className={`bg-white rounded-xl p-4 border shadow-xs ${
                isLucky ? 'border-[#0c8ce9]/20' : 'border-slate-100'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {isLucky && <Gift size={14} className="text-[#0c8ce9]" />}
                      <h3 className="font-medium text-slate-900 text-sm">{spot.name}</h3>
                    </div>
                    <p className="text-xs text-slate-500 mb-2 leading-relaxed">{spot.description}</p>
                    <div className="flex gap-1.5 flex-wrap">
                      <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 flex items-center gap-1">
                        <Clock size={10} />
                        {spot.bestTime}
                      </span>
                      {spot.walkingMinutes > 0 && (
                        <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 flex items-center gap-1">
                          <Footprints size={10} />
                          {spot.walkingMinutes}min
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                    {getCategoryIcon(spot.category)}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ===== Spot Card Component ===== */
function SpotCardComponent({ spot, isFlipped, onFlip, index, isRevealed, onReveal }: { spot: SpotCard; isFlipped: boolean; onFlip: () => void; index: number; isRevealed: boolean; onReveal: () => void }) {
  const getCrowdColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-emerald-600 bg-emerald-50';
      case 'medium': return 'text-amber-600 bg-amber-50';
      case 'high': return 'text-red-500 bg-red-50';
      default: return 'text-slate-500 bg-slate-50';
    }
  };

  const getCrowdLabel = (level: string) => {
    switch (level) {
      case 'low': return '人少';
      case 'medium': return '适中';
      case 'high': return '人多';
      default: return '';
    }
  };

  // Lucky Spot blind box - unrevealed state
  if (spot.isLuckySpot && !isRevealed) {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={onReveal}
        className="cursor-pointer"
      >
        <div className="bg-white rounded-xl p-6 border border-[#0c8ce9]/15 shadow-xs text-center relative overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-12 h-12 rounded-full bg-[#0c8ce9]/10 flex items-center justify-center mx-auto mb-3"
          >
            <Gift size={24} className="text-[#0c8ce9]" />
          </motion.div>
          <h3 className="font-semibold text-slate-900 text-sm mb-1">Lucky Spot 盲盒</h3>
          <p className="text-xs text-slate-400">点击揭晓 Travel Copilot 为你挑选的惊喜地点</p>
          <div className="flex justify-center gap-1 mt-3">
            {[...Array(3)].map((_, i) => (
              <motion.span
                key={i}
                animate={{ opacity: [0.2, 0.8, 0.2] }}
                transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-[#0c8ce9]"
              />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-2xl overflow-hidden border border-blue-100/60 shadow-sm mb-3"
    >
      {/* Spot image header */}
      <div className={`relative h-28 sm:h-36 bg-gradient-to-br ${getCategoryGradient(spot.category)} overflow-hidden`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getSpotImageUrl(spot)}
          alt={spot.name}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4">
          <div className="flex items-center gap-2">
            {spot.isLuckySpot && <Gift size={16} className="text-yellow-300" />}
            <h3 className="font-bold text-white text-lg drop-shadow-sm">{spot.name}</h3>
          </div>
          <p className="text-xs text-white/80 mt-0.5 line-clamp-1">{spot.description}</p>
        </div>
      </div>

      <div className="p-4 sm:p-5">

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {/* Recommendation Reason */}
        <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-50">
          <div className="flex items-center gap-1.5 mb-1 text-blue-700">
            <Star size={14} className="fill-current" />
            <span className="text-xs font-semibold">推荐理由</span>
          </div>
          <div className="flex gap-0.5 mb-1.5 text-yellow-400">
             {'★'.repeat(5)}
          </div>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">{spot.reason}</p>
        </div>

        {/* Crowd Risk */}
        <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-50">
          <div className="flex items-center gap-1.5 mb-1 text-blue-700">
            <Users size={14} />
            <span className="text-xs font-semibold">人流风险</span>
          </div>
          <p className={`text-xs font-bold mb-1.5 ${getCrowdColor(spot.crowdLevel).replace('bg-', 'bg-opacity-0 text-')}`}>{getCrowdLabel(spot.crowdLevel)}</p>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">节假日人流预测较低</p>
        </div>

        {/* Photo Suitability */}
        <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-50">
          <div className="flex items-center gap-1.5 mb-1 text-blue-700">
            <Camera size={14} />
            <span className="text-xs font-semibold">拍照适配度</span>
          </div>
          <div className="flex gap-0.5 mb-1.5 text-yellow-400">
             {'★'.repeat(Math.round(spot.photoScore))}{'☆'.repeat(5 - Math.round(spot.photoScore))}
          </div>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">自然光线出片率高</p>
        </div>
      </div>

      {/* Bottom info */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600">
          <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Footprints size={12} />
          </div>
          <div>
            <span className="font-semibold block text-slate-700">步行强度</span>
            <span className="text-slate-500">单日步行约 {spot.walkingMinutes} 分钟</span>
          </div>
        </div>

        {spot.alternatives.length > 0 && (
          <div className="flex items-center gap-1.5 text-slate-600">
            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <MapPin size={12} />
            </div>
            <div>
              <span className="font-semibold block text-slate-700">可替代地点</span>
              <span className="text-slate-500">下雨/人多时可备选 {spot.alternatives.length} 处</span>
            </div>
          </div>
        )}
      </div>
      </div>
    </motion.div>
  );
}

/* ===== Energy Curve ===== */
function EnergyCurve({ spots }: { spots: SpotCard[] }) {
  const energyData = spots.map((spot) => {
    if (spot.category === '休息') return 20;
    if (spot.category === '美食') return 35;
    if (spot.walkingMinutes > 45) return 85;
    if (spot.walkingMinutes > 30) return 65;
    return 45;
  });

  const maxEnergy = Math.max(...energyData, 1);

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Activity size={14} className="text-slate-900" />
          <h3 className="text-xs font-medium text-slate-900">能量曲线</h3>
        </div>
        <span className="text-[10px] sm:text-xs text-slate-400">体力消耗预估</span>
      </div>
      <div className="flex items-end gap-1.5 h-14">
        {energyData.map((energy, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${(energy / maxEnergy) * 100}%` }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: 'easeOut' }}
            className={`flex-1 rounded-t transition-colors ${
              energy <= 30 ? 'bg-slate-200' :
              energy <= 50 ? 'bg-slate-300' :
              energy <= 70 ? 'bg-slate-500' :
              'bg-slate-900'
            }`}
            title={spots[i]?.name}
          />
        ))}
      </div>
      <div className="flex gap-1.5 mt-1.5">
        {spots.map((spot, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-[9px] sm:text-[10px] text-slate-400 truncate block leading-tight">
              {spot.name.slice(0, 3)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== Helpers ===== */
function getCategoryIcon(category: string) {
  const iconClass = "text-slate-400";
  switch (category) {
    case '拍照': return <Camera size={16} className={iconClass} />;
    case '美食': return <UtensilsCrossed size={16} className={iconClass} />;
    case '休息': return <Coffee size={16} className={iconClass} />;
    case '文化': return <Palette size={16} className={iconClass} />;
    default: return <MapPin size={16} className={iconClass} />;
  }
}

// 根据地点名生成配图URL（使用 picsum 基于 seed 的稳定图片）
function getSpotImageUrl(spot: SpotCard): string {
  // 用地点名作为 seed，确保同一地点每次显示相同图片
  const seed = encodeURIComponent(spot.name);
  return `https://picsum.photos/seed/${seed}/400/250`;
}

// 根据类别使用配色渐变作为图片fallback
function getCategoryGradient(category: string): string {
  switch (category) {
    case '拍照': return 'from-amber-100 to-orange-100';
    case '美食': return 'from-red-50 to-orange-50';
    case '休息': return 'from-green-50 to-emerald-50';
    case '文化': return 'from-purple-50 to-indigo-50';
    case '景点': return 'from-sky-50 to-blue-50';
    default: return 'from-slate-50 to-slate-100';
  }
}
