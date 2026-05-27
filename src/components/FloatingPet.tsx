'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Repeat } from 'lucide-react';

interface TipConfig {
  stage: string;
  tips: string[];
}

const TIPS_BY_STAGE: TipConfig[] = [
  {
    stage: 'welcome',
    tips: [
      '点击"开始旅行"进入性格测试~',
      '测试只需要 30 秒哦！',
      '也可以跳过测试直接开始聊天~',
    ],
  },
  {
    stage: 'personality',
    tips: [
      '选择最接近你的答案就好~',
      '答案会影响后续推荐的行程风格哦',
      '凭直觉选就对啦！',
    ],
  },
  {
    stage: 'chat',
    tips: [
      '点击示例卡片可以快速开始~',
      '聊两轮后会解锁"生成行程"按钮',
      '点击"灵感"获取旅行冷知识~',
      '说得越具体，行程越精准哦！',
    ],
  },
  {
    stage: 'itinerary',
    tips: [
      '有个惊喜盲盒等你揭晓~',
      '每张卡片都有替代方案哦',
      '觉得不满意可以返回调整~',
    ],
  },
];

// 多种可爱动物造型
type PetType = 'cat' | 'dog' | 'rabbit' | 'bird' | 'panda';

interface PetDesign {
  name: string;
  bodyColor: string;
  earStyle: 'pointed' | 'floppy' | 'long' | 'none' | 'round';
  eyeStyle: 'round' | 'happy' | 'big';
  hasWings: boolean;
  accentColor: string;
  noseColor: string;
}

const PET_DESIGNS: Record<PetType, PetDesign> = {
  cat: {
    name: '小猫咪',
    bodyColor: 'from-orange-200 to-orange-300',
    earStyle: 'pointed',
    eyeStyle: 'happy',
    hasWings: false,
    accentColor: 'bg-orange-400',
    noseColor: 'bg-pink-300',
  },
  dog: {
    name: '小狗狗',
    bodyColor: 'from-amber-100 to-amber-200',
    earStyle: 'floppy',
    eyeStyle: 'round',
    hasWings: false,
    accentColor: 'bg-amber-400',
    noseColor: 'bg-slate-800',
  },
  rabbit: {
    name: '小兔子',
    bodyColor: 'from-pink-100 to-pink-200',
    earStyle: 'long',
    eyeStyle: 'big',
    hasWings: false,
    accentColor: 'bg-pink-300',
    noseColor: 'bg-pink-400',
  },
  bird: {
    name: '小鸟儿',
    bodyColor: 'from-sky-200 to-blue-300',
    earStyle: 'none',
    eyeStyle: 'round',
    hasWings: true,
    accentColor: 'bg-sky-400',
    noseColor: 'bg-orange-400',
  },
  panda: {
    name: '小熊猫',
    bodyColor: 'from-white to-slate-100',
    earStyle: 'round',
    eyeStyle: 'round',
    hasWings: false,
    accentColor: 'bg-slate-800',
    noseColor: 'bg-slate-900',
  },
};

const PET_LIST: PetType[] = ['cat', 'dog', 'rabbit', 'bird', 'panda'];

// CSS 动物渲染
function CSSPet({ type }: { type: PetType }) {
  const design = PET_DESIGNS[type];

  return (
    <div className="w-12 h-12 relative">
      {/* Body */}
      <div className={`absolute inset-0 bg-gradient-to-br ${design.bodyColor} rounded-full shadow-lg flex items-center justify-center`}>
        {/* Eyes */}
        <div className="flex gap-1.5 -mt-0.5">
          {design.eyeStyle === 'happy' ? (
            <>
              <div className="w-2 h-1 border-t-2 border-slate-800 rounded-t-full mt-1" />
              <div className="w-2 h-1 border-t-2 border-slate-800 rounded-t-full mt-1" />
            </>
          ) : design.eyeStyle === 'big' ? (
            <>
              <div className="w-2.5 h-2.5 bg-white rounded-full relative border border-slate-200">
                <div className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 bg-red-400 rounded-full" />
              </div>
              <div className="w-2.5 h-2.5 bg-white rounded-full relative border border-slate-200">
                <div className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 bg-red-400 rounded-full" />
              </div>
            </>
          ) : (
            <>
              <div className="w-2 h-2.5 bg-white rounded-full relative">
                <div className="absolute bottom-0.5 left-0.5 w-1 h-1 bg-slate-800 rounded-full" />
              </div>
              <div className="w-2 h-2.5 bg-white rounded-full relative">
                <div className="absolute bottom-0.5 left-0.5 w-1 h-1 bg-slate-800 rounded-full" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Nose */}
      <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 w-1.5 h-1 ${design.noseColor} rounded-full`} />

      {/* Blush */}
      <div className="absolute bottom-2.5 left-1.5 w-2 h-1 bg-pink-200 rounded-full opacity-60" />
      <div className="absolute bottom-2.5 right-1.5 w-2 h-1 bg-pink-200 rounded-full opacity-60" />

      {/* Ears */}
      {design.earStyle === 'pointed' && (
        <>
          <div className={`absolute -top-1.5 left-1 w-3 h-3 ${design.accentColor} rounded-tl-full rounded-tr-full rotate-[-15deg]`} />
          <div className={`absolute -top-1.5 right-1 w-3 h-3 ${design.accentColor} rounded-tl-full rounded-tr-full rotate-[15deg]`} />
        </>
      )}
      {design.earStyle === 'floppy' && (
        <>
          <div className={`absolute -top-0.5 left-0 w-3 h-4 ${design.accentColor} rounded-full rotate-[-30deg] origin-bottom`} />
          <div className={`absolute -top-0.5 right-0 w-3 h-4 ${design.accentColor} rounded-full rotate-[30deg] origin-bottom`} />
        </>
      )}
      {design.earStyle === 'long' && (
        <>
          <div className={`absolute -top-4 left-2 w-2.5 h-5 ${design.accentColor} rounded-full rotate-[-8deg]`} />
          <div className={`absolute -top-4 right-2 w-2.5 h-5 ${design.accentColor} rounded-full rotate-[8deg]`} />
        </>
      )}
      {design.earStyle === 'round' && (
        <>
          <div className={`absolute -top-1 left-0.5 w-3.5 h-3.5 ${design.accentColor} rounded-full`} />
          <div className={`absolute -top-1 right-0.5 w-3.5 h-3.5 ${design.accentColor} rounded-full`} />
        </>
      )}

      {/* Wings for bird */}
      {design.hasWings && (
        <>
          <div className={`absolute top-3 -left-2 w-3 h-2 ${design.accentColor} rounded-full opacity-80`} />
          <div className={`absolute top-3 -right-2 w-3 h-2 ${design.accentColor} rounded-full opacity-80`} />
        </>
      )}
    </div>
  );
}

interface FloatingPetProps {
  currentStage: string;
}

export function FloatingPet({ currentStage }: FloatingPetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTip, setCurrentTip] = useState('');
  const [showBubble, setShowBubble] = useState(false);
  const [petType, setPetType] = useState<PetType>('cat');
  const [showPetSelector, setShowPetSelector] = useState(false);
  const [hasPetImage, setHasPetImage] = useState(false);

  useEffect(() => {
    // Check if custom pet image exists (use fetch to avoid console 404 noise)
    fetch('/pet.png', { method: 'HEAD' })
      .then(res => setHasPetImage(res.ok))
      .catch(() => setHasPetImage(false));
  }, []);

  useEffect(() => {
    // Load saved pet preference
    const saved = localStorage.getItem('pet-type');
    if (saved && PET_LIST.includes(saved as PetType)) {
      setPetType(saved as PetType);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const tips = TIPS_BY_STAGE.find((t) => t.stage === currentStage)?.tips || TIPS_BY_STAGE[0].tips;
      setCurrentTip(tips[0]);
      setShowBubble(true);
      setTimeout(() => setShowBubble(false), 5000);
    }, 2500);
    return () => clearTimeout(timer);
  }, [currentStage]);

  const getNextTip = () => {
    const tips = TIPS_BY_STAGE.find((t) => t.stage === currentStage)?.tips || TIPS_BY_STAGE[0].tips;
    const currentIndex = tips.indexOf(currentTip);
    const nextTip = tips[(currentIndex + 1) % tips.length];
    setCurrentTip(nextTip);
  };

  const switchPet = (type: PetType) => {
    setPetType(type);
    localStorage.setItem('pet-type', type);
    setShowPetSelector(false);
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50">
      {/* Tip bubble */}
      <AnimatePresence>
        {showBubble && !isOpen && !showPetSelector && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            className="absolute bottom-full right-0 mb-3 w-52"
          >
            <div className="bg-white/95 backdrop-blur-sm border border-blue-100 rounded-2xl shadow-lg px-3.5 py-2.5 relative">
              <p className="text-xs text-slate-600 leading-relaxed">{currentTip}</p>
              <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-r border-b border-blue-100 transform rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pet selector */}
      <AnimatePresence>
        {showPetSelector && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            className="absolute bottom-full right-0 mb-3 w-56"
          >
            <div className="bg-white/95 backdrop-blur-sm border border-blue-100 rounded-2xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-blue-600">选择你的旅行伙伴</h3>
                <button onClick={() => setShowPetSelector(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {PET_LIST.map((type) => (
                  <button
                    key={type}
                    onClick={() => switchPet(type)}
                    className={`p-1.5 rounded-xl transition-all flex flex-col items-center gap-1 ${
                      petType === type
                        ? 'bg-blue-50 border-2 border-blue-300 scale-105'
                        : 'hover:bg-slate-50 border-2 border-transparent'
                    }`}
                  >
                    <div className="w-8 h-8 flex items-center justify-center scale-[0.7]">
                      <CSSPet type={type} />
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-center text-2xs text-slate-400 mt-2">
                {PET_DESIGNS[petType].name}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded tips panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            className="absolute bottom-full right-0 mb-3 w-56"
          >
            <div className="bg-white/95 backdrop-blur-sm border border-blue-100 rounded-2xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-blue-600">{PET_DESIGNS[petType].name}的提示</h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-3 min-h-[32px]">
                {currentTip || '点击下方按钮获取提示~'}
              </p>
              <button
                onClick={getNextTip}
                className="w-full text-2xs bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-600 py-2 rounded-xl transition-colors flex items-center justify-center gap-1 font-medium"
              >
                下一条
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pet character + controls */}
      <div className="flex items-end gap-1.5">
        {/* Switch pet button */}
        <motion.button
          onClick={() => {
            setShowPetSelector(!showPetSelector);
            setIsOpen(false);
            setShowBubble(false);
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-7 h-7 rounded-full bg-white/80 border border-blue-100 shadow-sm flex items-center justify-center text-blue-400 hover:text-blue-600 transition-colors"
        >
          <Repeat className="w-3 h-3" strokeWidth={2} />
        </motion.button>

        {/* Main pet button */}
        <motion.button
          onClick={() => {
            if (!isOpen) getNextTip();
            setIsOpen(!isOpen);
            setShowBubble(false);
            setShowPetSelector(false);
          }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        >
          {hasPetImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src="/pet.png"
              alt="旅行小助手"
              className="w-full h-full object-contain drop-shadow-lg"
            />
          ) : (
            <CSSPet type={petType} />
          )}
        </motion.button>
      </div>
    </div>
  );
}
