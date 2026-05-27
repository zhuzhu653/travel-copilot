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
        // 尝试多种方式提取 JSON
        let jsonStr: string | null = null;
        
        // 1. 尝试匹配 ```json ... ``` 代码块
        const codeBlockMatch = data.content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
        if (codeBlockMatch) {
          jsonStr = codeBlockMatch[1].trim();
        }
        
        // 2. 尝试直接匹配 JSON 对象
        if (!jsonStr) {
          const jsonMatch = data.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            jsonStr = jsonMatch[0];
          }
        }

        if (jsonStr) {
          try {
            const itinerary = JSON.parse(jsonStr) as Itinerary;
            if (itinerary.title && itinerary.days?.length > 0) {
              onItineraryGenerated(itinerary);
              return;
            }
          } catch {
            console.error('JSON parse failed, content:', data.content.slice(0, 200));
          }
        }
      }
      // API 返回但解析失败，提示用户重试
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: '行程生成遇到了一点问题，请再试一次吧！如果持续失败，可以用更具体的描述，比如"去杭州玩两天，想逛西湖和吃本地菜"。' 
      }]);
    } catch (e) {
      console.error('Generate error:', e);
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: '网络连接出了点问题，请稍后重试生成行程。' 
      }]);
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
      <div className="sticky bottom-0 bg-white/90 backdrop-blur-lg border-t border-blue-100/50 px-5 sm:px-6 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
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

// Mock itinerary removed - API errors now show user-friendly retry messages
