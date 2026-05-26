'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, ChevronRight } from 'lucide-react';

interface TipConfig {
  stage: string;
  tips: string[];
}

const TIPS_BY_STAGE: TipConfig[] = [
  {
    stage: 'welcome',
    tips: [
      '点击"开始旅行"进入性格测试',
      '测试只需要 30 秒，帮助我了解你的偏好',
      '也可以跳过测试直接开始对话',
    ],
  },
  {
    stage: 'personality',
    tips: [
      '选择最接近你的答案就好，没有对错',
      '答案会影响后续推荐的行程风格',
      '凭直觉选择即可',
    ],
  },
  {
    stage: 'chat',
    tips: [
      '点击示例卡片可以快速开始',
      '聊两轮后会解锁"生成行程"按钮',
      '点击"灵感"获取旅行冷知识',
      '说得越具体，行程越精准',
    ],
  },
  {
    stage: 'itinerary',
    tips: [
      '点击"时间线"切换视图',
      '有个惊喜盲盒等你揭晓',
      '每张卡片都有替代方案',
      '觉得不满意可以返回调整',
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

  useEffect(() => {
    const timer = setTimeout(() => {
      const tips = TIPS_BY_STAGE.find((t) => t.stage === currentStage)?.tips || TIPS_BY_STAGE[0].tips;
      setCurrentTip(tips[0]);
      setShowBubble(true);
      setTimeout(() => setShowBubble(false), 4000);
    }, 3000);
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
            className="absolute bottom-full right-0 mb-2 w-48"
          >
            <div className="bg-white border border-slate-100 rounded-lg shadow-elevated px-3 py-2.5">
              <p className="text-xs text-slate-600 leading-relaxed">{currentTip}</p>
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
            className="absolute bottom-full right-0 mb-2 w-56"
          >
            <div className="bg-white border border-slate-100 rounded-xl shadow-float p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-slate-800">使用提示</h3>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-3 min-h-[32px]">
                {currentTip || '点击下方按钮获取提示'}
              </p>
              <button
                onClick={getNextTip}
                className="w-full text-2xs bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-600 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 font-medium"
              >
                下一条
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <button
        onClick={() => {
          if (!isOpen) getNextTip();
          setIsOpen(!isOpen);
          setShowBubble(false);
        }}
        className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-card hover:shadow-elevated flex items-center justify-center transition-all"
      >
        <HelpCircle className="w-4.5 h-4.5 text-slate-500" strokeWidth={1.5} />
      </button>
    </div>
  );
}
