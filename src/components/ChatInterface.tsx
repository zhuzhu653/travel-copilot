'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, SlidersHorizontal, Lightbulb, Sparkles, Compass, User, Bot } from 'lucide-react';
import { PreferenceSliders } from './PreferenceSliders';
import type { UserPreferences, Itinerary } from '@/app/page';

interface ChatInterfaceProps {
  preferences: UserPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
  chatHistory: Array<{ role: string; content: string }>;
  setChatHistory: React.Dispatch<React.SetStateAction<Array<{ role: string; content: string }>>>;
  onItineraryGenerated: (itinerary: Itinerary) => void;
  showSlidersOnMount?: boolean;
}

export function ChatInterface({
  preferences,
  setPreferences,
  chatHistory,
  setChatHistory,
  onItineraryGenerated,
  showSlidersOnMount = false,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSliders, setShowSliders] = useState(showSlidersOnMount);
  const [messageCount, setMessageCount] = useState(() => {
    // 返回时用已有聊天记录的用户消息数来初始化
    return chatHistory.filter(m => m.role === 'user').length;
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  useEffect(() => {
    if (chatHistory.length === 0) {
      const welcomeMsg = preferences.personality
        ? `你好，我是你的AI旅行规划师。不直接生成排篇攻略，先来聊聊你的需求吧！想去哪、玩几天、有什么特别想做的事？`
        : '你好，我是你的AI旅行规划师。不直接粗暴套模板，先来聊聊你的需求吧！想去哪、玩几天、有什么特别想做的事？';
      setChatHistory([{ role: 'assistant', content: welcomeMsg }]);
    }
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const newMessages = [...chatHistory, { role: 'user', content: text }];
    setChatHistory(newMessages);
    setInput('');
    setIsLoading(true);
    setMessageCount((c) => c + 1);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          action: 'chat',
        }),
      });

      const data = await res.json();
      if (data.content) {
        setChatHistory([...newMessages, { role: 'assistant', content: data.content }]);
      }
    } catch {
      setChatHistory([
        ...newMessages,
        { role: 'assistant', content: '网络连接出现问题，请稍后再试。' },
      ]);
    } finally {
      setIsLoading(false);
    }

    if (messageCount >= 1 && !showSliders) {
      setShowSliders(true);
    }
  };

  const getInspiration = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...chatHistory.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: '给我分享一个关于旅行目的地的有趣冷知识或者本地故事吧，要让人眼前一亮的那种！简短一些，2-3句话就好。' },
          ],
          action: 'chat',
        }),
      });

      const data = await res.json();
      if (data.content) {
        setChatHistory((prev) => [...prev, { role: 'assistant', content: data.content }]);
      }
    } catch {
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', content: '上海的弄堂里藏着很多隐蔽的咖啡馆，老虎窗外晾着衣服，里面却是精品手冲——这就是上海的"违和感美学"。' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateItinerary = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory.map((m) => ({ role: m.role, content: m.content })),
          action: 'generate',
          preferences: preferences.weights,
        }),
      });

      const data = await res.json();
      if (data.content) {
        const jsonMatch = data.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const itinerary = JSON.parse(jsonMatch[0]) as Itinerary;
            onItineraryGenerated(itinerary);
            return;
          } catch {
            // JSON parse failed, fall through to mock
          }
        }
      }
      // If we get here, API didn't return valid itinerary JSON
      onItineraryGenerated(getMockItinerary());
    } catch (e) {
      console.error('Generate error:', e);
      onItineraryGenerated(getMockItinerary());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-blue-100/50 px-5 sm:px-6 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm shadow-blue-200">
              <Compass className="w-4 h-4 text-white" strokeWidth={1.8} />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-800">Travel Copilot</h1>
              <p className="text-2xs text-blue-400">旅行规划助手</p>
            </div>
          </div>
          {preferences.personality && (
            <span className="text-2xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full border border-blue-100 font-medium">
              {preferences.personality}
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-4">
        {/* Quick start examples */}
        {chatHistory.length <= 1 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2.5 mt-2"
          >
            <p className="text-xs text-slate-400 font-medium">试试这些：</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                '端午去上海玩两天，想citywalk、拍照打卡、吃吃喝喝',
                '去杭州两天，松弛一点，不特种兵',
                '想找个海边小城发呆三天，预算2000以内',
                '第一次去日本，5天自由行求攻略',
              ].map((text, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(text)}
                  className="text-left p-3 rounded-xl bg-white/80 border border-blue-100/60 hover:border-blue-200 hover:shadow-sm transition-all text-xs sm:text-sm text-slate-600 hover:text-slate-800"
                >
                  {text}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {chatHistory.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-blue-600' : 'bg-white border border-blue-100'}`}>
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-blue-600" />
                )}
              </div>
              
              {/* Bubble */}
              <div
                className={`max-w-[80%] sm:max-w-[72%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-tr-sm shadow-sm shadow-blue-200'
                    : 'bg-white border border-blue-100/60 shadow-sm rounded-tl-sm text-slate-700'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3 flex-row">
            <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center shadow-sm bg-white border border-blue-100">
              <Bot className="w-4 h-4 text-blue-600" />
            </div>
            <div className="bg-white border border-blue-100/60 rounded-2xl rounded-tl-sm px-4 py-4 shadow-sm">
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preference Sliders Panel */}
      <AnimatePresence>
        {showSliders && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-blue-100/50 bg-slate-50/50 overflow-hidden relative"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-50" />
            
            {/* Context Bubble inside slider */}
            <div className="mx-5 sm:mx-6 mt-4 mb-2 flex items-start gap-2">
              <div className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center shadow-sm bg-white border border-blue-100">
                <Bot className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="bg-white border border-blue-100/60 shadow-sm rounded-2xl rounded-tl-sm px-3.5 py-2 text-xs text-slate-700 font-medium">
                这次旅行你更看重什么呢？让我来为你定制吧：
              </div>
            </div>

            <PreferenceSliders
              weights={preferences.weights}
              onChange={(weights) => setPreferences((p) => ({ ...p, weights }))}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur-lg border-t border-blue-100/50 px-5 sm:px-6 py-3.5">
        <div className="flex gap-2.5 items-end">
          <div className="flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="输入你的旅行想法..."
              rows={1}
              className="w-full resize-none rounded-lg bg-slate-50 border border-slate-150 focus:border-slate-300 focus:bg-white px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:bg-slate-100 disabled:from-slate-100 disabled:to-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-all shadow-sm shadow-blue-200 disabled:shadow-none"
          >
            <Send className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-2.5">
          <button
            onClick={() => setShowSliders(!showSliders)}
            className="text-2xs bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-600 px-2.5 py-1.5 rounded-full transition-colors flex items-center gap-1.5 font-medium"
          >
            <SlidersHorizontal className="w-3 h-3" strokeWidth={2} />
            {showSliders ? '收起' : '偏好'}
          </button>
          <button
            onClick={getInspiration}
            disabled={isLoading}
            className="text-2xs bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-600 px-2.5 py-1.5 rounded-full transition-colors flex items-center gap-1.5 font-medium disabled:opacity-50"
          >
            <Lightbulb className="w-3 h-3" strokeWidth={2} />
            灵感
          </button>
          {messageCount >= 2 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={generateItinerary}
              disabled={isLoading}
              className="text-2xs bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-slate-100 disabled:to-slate-100 disabled:text-slate-400 text-white px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 font-medium shadow-sm shadow-blue-200 disabled:shadow-none"
            >
              <Sparkles className="w-3 h-3" strokeWidth={2} />
              生成行程
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function getMockItinerary(): Itinerary {
  return {
    title: '端午上海 Citywalk · 氛围漫游版',
    version: '经典版',
    days: [
      {
        dayNumber: 1,
        spots: [
          {
            id: '1',
            name: '杨浦滨江工业遗存带',
            description: '百年工业遗迹与现代艺术的交融',
            reason: '人少景美，工业风出片率极高，节假日人流仅为外滩的1/10',
            crowdLevel: 'low',
            photoScore: 5,
            walkingMinutes: 45,
            bestTime: '9:00-11:00',
            alternatives: ['复兴岛', '民生码头'],
            isLuckySpot: false,
            category: '拍照',
          },
          {
            id: '2',
            name: '定海桥互助社区',
            description: '藏在老城区的社区艺术空间',
            reason: '本地人才知道的文化据点',
            crowdLevel: 'low',
            photoScore: 3,
            walkingMinutes: 20,
            bestTime: '10:30-12:00',
            alternatives: ['OCAT上海馆', '明当代美术馆'],
            isLuckySpot: false,
            category: '文化',
          },
          {
            id: '3',
            name: '平凉路菜市场',
            description: '最地道的上海市井烟火气',
            reason: '本地人日常采买的菜场，藏着老上海味道的早点摊',
            crowdLevel: 'medium',
            photoScore: 4,
            walkingMinutes: 15,
            bestTime: '11:30-13:00',
            alternatives: ['蒙西菜场', '乌中市集'],
            isLuckySpot: false,
            category: '美食',
          },
          {
            id: '4',
            name: 'Free Time Block',
            description: '找家咖啡馆歇一歇',
            reason: '上午步行约2小时，建议休息30-45分钟补充能量',
            crowdLevel: 'low',
            photoScore: 2,
            walkingMinutes: 0,
            bestTime: '13:00-14:00',
            alternatives: [],
            isLuckySpot: false,
            category: '休息',
          },
          {
            id: '5',
            name: '衡复风貌区支线',
            description: '梧桐树下的法式老洋房漫步',
            reason: '避开武康路主干道，支线人流减少70%，出片率不减',
            crowdLevel: 'low',
            photoScore: 5,
            walkingMinutes: 60,
            bestTime: '14:30-16:30',
            alternatives: ['愚园路', '新华路'],
            isLuckySpot: false,
            category: '拍照',
          },
          {
            id: '6',
            name: 'Lucky Spot',
            description: '到达后揭晓的惊喜目的地',
            reason: '基于你的人格和今日路线特别推荐',
            crowdLevel: 'low',
            photoScore: 4,
            walkingMinutes: 10,
            bestTime: '17:00-18:00',
            alternatives: [],
            isLuckySpot: true,
            category: '景点',
          },
        ],
      },
      {
        dayNumber: 2,
        spots: [
          {
            id: '7',
            name: '前滩花海公园',
            description: '城市中的大片花田，视野开阔',
            reason: '远离市中心，节假日人流低，自然光拍照极佳',
            crowdLevel: 'low',
            photoScore: 5,
            walkingMinutes: 40,
            bestTime: '8:30-10:30',
            alternatives: ['辰山植物园', '共青森林公园'],
            isLuckySpot: false,
            category: '拍照',
          },
          {
            id: '8',
            name: '龙华寺素斋',
            description: '百年古刹的清净素食',
            reason: '脱离喧嚣的用餐体验，龙华素斋远近闻名',
            crowdLevel: 'medium',
            photoScore: 3,
            walkingMinutes: 15,
            bestTime: '11:00-12:30',
            alternatives: ['功德林', '枣子树'],
            isLuckySpot: false,
            category: '美食',
          },
          {
            id: '9',
            name: '午后留白',
            description: '不安排目的地的自由探索时间',
            reason: '这段时间属于你，可以就近逛逛或者找一家店发呆',
            crowdLevel: 'low',
            photoScore: 0,
            walkingMinutes: 0,
            bestTime: '13:00-14:30',
            alternatives: [],
            isLuckySpot: false,
            category: '休息',
          },
          {
            id: '10',
            name: '西岸艺术中心片区',
            description: '当代艺术与江景的完美结合',
            reason: '龙美术馆+西岸美术馆联动，室内为主不怕天气变化',
            crowdLevel: 'medium',
            photoScore: 4,
            walkingMinutes: 50,
            bestTime: '14:30-17:00',
            alternatives: ['余德耀美术馆', 'teamLab'],
            isLuckySpot: false,
            category: '文化',
          },
          {
            id: '11',
            name: '永康路小酒馆',
            description: '落日时分的微醺收尾',
            reason: '适合旅行最后一站的松弛收尾，氛围感满分',
            crowdLevel: 'medium',
            photoScore: 3,
            walkingMinutes: 10,
            bestTime: '17:30-19:00',
            alternatives: ['安福路小酒馆', '巨鹿路'],
            isLuckySpot: false,
            category: '美食',
          },
        ],
      },
    ],
  };
}
