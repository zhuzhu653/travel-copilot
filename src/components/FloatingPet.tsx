'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';

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

interface FloatingPetProps {
  currentStage: string;
}

export function FloatingPet({ currentStage }: FloatingPetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTip, setCurrentTip] = useState('');
  const [showBubble, setShowBubble] = useState(false);
  const [hasPetImage, setHasPetImage] = useState(false);

  useEffect(() => {
    // Check if pet image exists
    const img = new Image();
    img.onload = () => setHasPetImage(true);
    img.onerror = () => setHasPetImage(false);
    img.src = '/pet.png';
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

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50">
      {/* Tip bubble */}
      <AnimatePresence>
        {showBubble && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            className="absolute bottom-full right-0 mb-3 w-52"
          >
            <div className="bg-white/95 backdrop-blur-sm border border-blue-100 rounded-2xl shadow-lg px-3.5 py-2.5 relative">
              <p className="text-xs text-slate-600 leading-relaxed">{currentTip}</p>
              {/* Speech bubble tail */}
              <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-r border-b border-blue-100 transform rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded panel */}
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
                <h3 className="text-xs font-semibold text-blue-600">小助手提示</h3>
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

      {/* Pet character button */}
      <motion.button
        onClick={() => {
          if (!isOpen) getNextTip();
          setIsOpen(!isOpen);
          setShowBubble(false);
        }}
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
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
          /* CSS fallback pet - cute blob character */
          <div className="w-12 h-12 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full shadow-lg shadow-blue-200 flex items-center justify-center">
              {/* Eyes */}
              <div className="flex gap-1.5 -mt-0.5">
                <div className="w-2 h-2.5 bg-white rounded-full relative">
                  <div className="absolute bottom-0.5 left-0.5 w-1 h-1 bg-slate-800 rounded-full" />
                </div>
                <div className="w-2 h-2.5 bg-white rounded-full relative">
                  <div className="absolute bottom-0.5 left-0.5 w-1 h-1 bg-slate-800 rounded-full" />
                </div>
              </div>
            </div>
            {/* Blush */}
            <div className="absolute bottom-2.5 left-1.5 w-2 h-1 bg-pink-200 rounded-full opacity-60" />
            <div className="absolute bottom-2.5 right-1.5 w-2 h-1 bg-pink-200 rounded-full opacity-60" />
            {/* Tiny hat */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-2.5 bg-blue-600 rounded-t-full" />
            <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-7 h-1 bg-blue-700 rounded-full" />
          </div>
        )}
      </motion.button>
    </div>
  );
}
