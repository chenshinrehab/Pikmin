"use client";

import React, { useState } from 'react';
import { 
  Clipboard, 
  RefreshCcw, 
  Stethoscope, 
  Palmtree, 
  Code, 
  Sparkles, 
  Flame, 
  TreeDeciduous, 
  Check,
  Layout,
  Edit3,
  Smile,
  MessageCircle
} from 'lucide-react';
import { buildFbPostPrompt, FbPromptOptions } from '@/utils/fbPromptBuilder';

export default function PromptGeneratorPage() {
  const [options, setOptions] = useState<FbPromptOptions>({
    fanpage: 'rehabDoctor',
    topicSource: 'trending',
    customTopic: '',
    length: 'medium',
    style: 'warm',
    emojiDensity: 'low', 
    includeHashtags: true,
    callToAction: 'shareExperience' 
  });

  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // 修改：生成後自動複製
  const handleGenerateAndCopy = async () => {
    const prompt = buildFbPostPrompt(options);
    setGeneratedPrompt(prompt);
    
    // 自動複製邏輯
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('自動複製失敗', err);
    }
  };

  const handleManualCopy = async () => {
    if (!generatedPrompt) return;
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('複製失敗');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto">
        
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl mb-4 text-blue-600">
            <Sparkles size={32} />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-3">陳醫師的社群 AI 中控台</h1>
          <p className="text-slate-500 font-medium italic text-lg uppercase tracking-tight">One-Click Generate & Auto Copy</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-5 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-8 space-y-10">
              
              {/* 1. 選擇發文身分 - 加大文字並優化漸層 */}
              <div>
                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 block">1. 選擇發文身分</label>
                <div className="flex gap-4">
                  {[
                    { id: 'rehabDoctor', icon: Stethoscope, label: '復健醫師', color: 'from-blue-500 to-cyan-400' },
                    { id: 'europeTravel', icon: Palmtree, label: '歐洲旅遊', color: 'from-emerald-500 to-teal-400' },
                    { id: 'seoTech', icon: Code, label: 'SEO技術', color: 'from-indigo-600 to-purple-500' }
                  ].map(item => (
                    <button 
                      key={item.id}
                      onClick={() => setOptions({...options, fanpage: item.id as any})}
                      className={`flex-1 p-5 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${
                        options.fanpage === item.id 
                        ? `border-transparent bg-gradient-to-br ${item.color} text-white scale-105 shadow-lg` 
                        : 'border-slate-100 text-slate-300 hover:border-slate-200 bg-white'
                      }`}
                    >
                      <item.icon size={32} />
                      <span className="text-sm font-black text-center leading-tight">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. 話題抓取策略 - 加大文字並優化漸層 */}
              <div>
                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 block">2. 話題抓取策略</label>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[
                    { id: 'trending', icon: Flame, label: '熱門時事', color: 'from-orange-500 to-red-400' },
                    { id: 'evergreen', icon: TreeDeciduous, label: '長青議題', color: 'from-green-500 to-lime-400' },
                    { id: 'custom', icon: Edit3, label: '自訂討論', color: 'from-blue-600 to-indigo-400' }
                  ].map(item => (
                    <button 
                      key={item.id}
                      onClick={() => setOptions({...options, topicSource: item.id as any})}
                      className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                        options.topicSource === item.id 
                        ? `border-transparent bg-gradient-to-br ${item.color} text-white shadow-md scale-105` 
                        : 'border-slate-50 text-slate-300 bg-slate-50'
                      }`}
                    >
                      <item.icon size={24} /> 
                      <span className="text-xs font-black tracking-tight">{item.label}</span>
                    </button>
                  ))}
                </div>
                {options.topicSource === 'custom' && (
                  <textarea 
                    placeholder="輸入自訂主題 (如：新進超音波設備、私密景點、技術技巧...)"
                    className="w-full bg-slate-50 border-2 border-blue-100 rounded-2xl p-4 text-sm focus:outline-none focus:border-blue-400 min-h-[100px] animate-in fade-in zoom-in-95"
                    value={options.customTopic}
                    onChange={(e) => setOptions({...options, customTopic: e.target.value})}
                  />
                )}
              </div>

              {/* 3. 其他參數 */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Smile size={14}/> Emoji 密度</label>
                  <select className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 cursor-pointer" value={options.emojiDensity} onChange={e => setOptions({...options, emojiDensity: e.target.value as any})}>
                    <option value="none">無 (純文字)</option>
                    <option value="low">少量 (點綴)</option>
                    <option value="medium">中等 (推薦)</option>
                    <option value="high">多 (活潑)</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><MessageCircle size={14}/> 互動要求 (CTA)</label>
                  <select className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer" value={options.callToAction} onChange={e => setOptions({...options, callToAction: e.target.value as any})}>
                    <option value="none">不要 (直接結尾)</option>
                    <option value="shareExperience">邀請分享類似經驗</option>
                    <option value="question">引導回答選擇問題</option>
                    <option value="linkClick">引導點擊詳情連結</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">語氣風格</label>
                  <select className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 cursor-pointer" value={options.style} onChange={e => setOptions({...options, style: e.target.value as any})}>
                    <option value="warm">溫暖親切</option>
                    <option value="professional">專業權威</option>
                    <option value="humorous">幽默風趣</option>
                    <option value="storytelling">敘事風格</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">篇幅模式</label>
                  <select className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer" value={options.length} onChange={e => setOptions({...options, length: e.target.value as any})}>
                    <option value="short">短篇精華</option>
                    <option value="medium">標準深度</option>
                    <option value="story">✨ 故事長文框架</option>
                  </select>
                </div>
              </div>

              {/* 生成按鈕 - 觸發自動複製 */}
              <button 
                onClick={handleGenerateAndCopy}
                className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl hover:bg-black transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3"
              >
                {copied ? <Check className="text-emerald-400 animate-bounce" /> : <RefreshCcw />}
                {copied ? '已自動複製！' : '生成並複製指令'}
              </button>
            </div>
          </div>

          {/* 右側：輸出區域 */}
          <div className="lg:col-span-7 flex flex-col h-full min-h-[600px]">
            <div className="bg-slate-900 rounded-[3.5rem] p-8 shadow-2xl flex flex-col h-full relative border-[12px] border-slate-800">
              <div className="flex justify-between items-center mb-8">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  <span className="ml-3 text-[10px] font-mono text-slate-500 tracking-widest uppercase text-sm">auto_copied.md</span>
                </div>
                {generatedPrompt && (
                  <button 
                    onClick={handleManualCopy} 
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black transition-all ${
                      copied ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    {copied ? <Check size={16} /> : <Clipboard size={16} />}
                    {copied ? 'COPIED!' : 'MANUAL COPY'}
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {generatedPrompt ? (
                  <div className="text-slate-300 font-mono text-sm leading-loose whitespace-pre-wrap animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {generatedPrompt}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 italic space-y-6 opacity-40">
                    <Layout size={64} strokeWidth={1} />
                    <p className="text-center font-medium italic">設定完成後點擊按鈕<br/>系統將自動複製指令</p>
                  </div>
                )}
              </div>
              <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center opacity-30">
                <p className="text-[10px] text-slate-600 font-mono tracking-tighter uppercase font-bold">Model: Gemini 1.5 Pro Enabled</p>
                <span className="text-[10px] text-slate-600 font-mono italic uppercase">System Online</span>
              </div>
            </div>
          </div>

        </div>
      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
}