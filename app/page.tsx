'use client';

import { useState, ChangeEvent } from 'react';
import { 
  Copy, ExternalLink, UserCircle, FileText, Sparkles, 
  Settings2, ClipboardCheck, CheckCircle2, Stethoscope, Coffee, Code, BookOpen
} from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { buildArticlePrompt, PromptOptions } from '@/utils/promptBuilder';
import Image from 'next/image';

export default function Home() {
  const { authorName, authorUrl, saveSettings, isLoaded } = useSettings();
  
  const [outline, setOutline] = useState<string>('');
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  
  const [useReference, setUseReference] = useState<boolean>(false);
  const [referenceText, setReferenceText] = useState<string>('');

  const [options, setOptions] = useState<PromptOptions>({
    category: 'professional',
    includeFaq: true,
    includeCitations: false,
    includeSchema: true,
    includeMeta: true,
    generateCode: false,
    includeIntent: true,
    includeMisconceptions: true,
    length: 'medium',
    style: 'professional',
  });

  const handleCategoryChange = (category: 'professional' | 'lifestyle') => {
    setOptions(prev => ({
      ...prev,
      category,
      style: category === 'professional' ? 'professional' : 'engaging'
    }));
  };

  const handleGenerateAndCopy = () => {
    if (!outline.trim()) {
      alert("請輸入文章主題、大綱或案例！");
      return;
    }

    const prompt = buildArticlePrompt(
      outline, 
      { ...options, authorName, authorUrl, referenceText: useReference ? referenceText : undefined }
    );
    
    setGeneratedPrompt(prompt);
    
    navigator.clipboard.writeText(prompt).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    });
  };

  const openGemini = () => {
    window.open('https://gemini.google.com/app', '_blank');
  };

  const openClaude = () => {
    window.open('https://claude.ai/', '_blank');
  };

  if (!isLoaded) return (
    <div className="min-h-screen bg-white flex items-center justify-center text-blue-600 font-bold">
      系統載入中...
    </div>
  );

  const placeholderText = options.category === 'professional'
    ? "請在此輸入專業文章大綱與參考案例...\n例如：\n1. 什麼是網球肘？\n2. 真實案例：工程師手肘痛的治療過程\n3. 體外震波與PRP的治療比較"
    : "請在此輸入生活風格大綱與親身體驗...\n例如：\n1. 抵達京都的初印象 (景點名稱)\n2. 推薦店家：位於錦市場的抹茶店 (具體店名)\n3. 交通方式比較";

  return (
    <div className="min-h-screen bg-[#FBFCFE] bg-[radial-gradient(at_top_center,_#e0e7ff_0%,_transparent_50%)] p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* 頂部置中 Logo 與標題區 */}
        <header className="flex flex-col items-center text-center space-y-5 pt-4">
          <a 
            href="https://ai-zeta-dusky-55.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-row items-center gap-4 group transition-all"
          >
            <div className="p-4 bg-white rounded-3xl border border-blue-100 shadow-[0_10px_40px_-10px_rgba(59,130,246,0.2)] group-hover:scale-105 transition-transform duration-500">
              <Image src="/favicon.svg" alt="標誌" width={56} height={56} />
            </div>
            <div className="flex flex-col text-left justify-center">
              <h2 className="text-3xl font-black tracking-widest text-slate-900 group-hover:text-blue-600 transition-colors">
                智網 Ai 引擎
              </h2>
              <p className="text-sm font-bold text-blue-500 mt-1">
                (從零到一，加速排名登頂，精準獲客)
              </p>
            </div>
          </a>
          
          <div className="space-y-3 mt-4">
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              全方位 AI 深度文章與程式碼產生器
            </h1>
            <p className="text-slate-500 text-lg md:text-xl font-medium">
              支援數據論文引用、動態表格排版，一鍵產出完整 React 網頁元件
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
          
          {/* 左側：詳細設定 */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* 領域選擇器 (帶漸層設計與高對比) */}
            <div className="bg-white/80 p-1.5 rounded-2xl border border-blue-50 backdrop-blur-xl flex gap-2 shadow-sm">
              <button 
                onClick={() => handleCategoryChange('professional')}
                className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all duration-300 ${
                  options.category === 'professional' 
                  ? 'bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] scale-105 z-10' 
                  : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200 opacity-60'
                }`}
              >
                <Stethoscope className="w-4 h-4" /> 專業知識類
              </button>
              <button 
                onClick={() => handleCategoryChange('lifestyle')}
                className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all duration-300 ${
                  options.category === 'lifestyle' 
                  ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white shadow-[0_0_20px_rgba(249,115,22,0.5)] scale-105 z-10' 
                  : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200 opacity-60'
                }`}
              >
                <Coffee className="w-4 h-4" /> 生活風格類
              </button>
            </div>

            {/* 作者資訊卡片 */}
            <div className="bg-white p-6 rounded-3xl border border-blue-50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5">
              <h2 className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-50 pb-4 text-lg">
                <UserCircle className="w-5 h-5 text-blue-500" /> 
                <span className="tracking-wide text-base md:text-lg">身分識別設定</span>
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="text-base font-bold text-slate-700 tracking-wider block mb-2">作者姓名</label>
                  <input 
                    type="text" 
                    value={authorName} 
                    onChange={(e) => saveSettings({ name: e.target.value })} 
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300" 
                    placeholder="輸入作者名稱" 
                  />
                </div>
                <div>
                  <label className="text-base font-bold text-slate-700 tracking-wider block mb-2">作者介紹網址(內文建議有公信力的對外連結)</label>
                  <input 
                    type="text" 
                    value={authorUrl} 
                    onChange={(e) => saveSettings({ aUrl: e.target.value })} 
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-base focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300" 
                    placeholder="/連結路徑" 
                  />
                </div>
              </div>
            </div>

            {/* 進階參數卡片 */}
            <div className="bg-white p-6 rounded-3xl border border-blue-50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5">
              <h2 className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-50 pb-4 text-lg">
                <Settings2 className="w-5 h-5 text-blue-500" /> 
                <span className="tracking-wide">內容參數配置</span>
              </h2>
              <div className="grid grid-cols-1 gap-2">
                <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border border-transparent hover:bg-blue-50/50">
                  <input type="checkbox" checked={options.includeFaq} onChange={(e) => setOptions({...options, includeFaq: e.target.checked})} className="w-4 h-4 rounded border-slate-200 text-blue-600 focus:ring-0" />
                  <span className="text-sm text-slate-600">產生常見問題 (FAQ)</span>
                </label>
                
                <label className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100 cursor-pointer hover:bg-blue-100/50 transition-all">
                  <input type="checkbox" checked={options.includeCitations} onChange={(e) => setOptions({...options, includeCitations: e.target.checked})} className="w-4 h-4 rounded border-blue-200 text-blue-600 focus:ring-0" />
                  <span className="text-sm font-bold text-blue-700 flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    {options.category === 'professional' ? '標示數據文獻與真實 DOI' : '列出高信賴度參考網頁'}
                  </span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-blue-50/50 transition-all">
                  <input type="checkbox" checked={options.includeMisconceptions} onChange={(e) => setOptions({...options, includeMisconceptions: e.target.checked})} className="w-4 h-4 rounded border-slate-200 text-blue-600 focus:ring-0" />
                  <span className="text-sm text-slate-600">常見誤區解析 (反向查證)</span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-blue-50/50 transition-all">
                  <input type="checkbox" checked={options.includeIntent} onChange={(e) => setOptions({...options, includeIntent: e.target.checked})} className="w-4 h-4 rounded border-slate-200 text-blue-600 focus:ring-0" />
                  <span className="text-sm text-slate-600">佈局搜尋意圖 (潛在問題小標)</span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-blue-50/50 transition-all">
                  <input type="checkbox" checked={options.includeMeta} onChange={(e) => setOptions({...options, includeMeta: e.target.checked})} className="w-4 h-4 rounded border-slate-200 text-blue-600" />
                  <span className="text-sm text-slate-600">SEO 描述 (Meta Description)</span>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-blue-50/50 transition-all">
                  <input type="checkbox" checked={options.includeSchema} onChange={(e) => setOptions({...options, includeSchema: e.target.checked})} className="w-4 h-4 rounded border-slate-200 text-blue-600" />
                  <span className="text-sm text-slate-600">JSON-LD 結構化資料 (含 FAQ)</span>
                </label>

                <label className="flex items-center gap-3 p-4 bg-slate-900 rounded-2xl cursor-pointer hover:bg-black transition-all group shadow-xl text-white">
                  <Code className="w-4 h-4 text-blue-400 group-hover:rotate-12 transition-transform" />
                  <input type="checkbox" checked={options.generateCode} onChange={(e) => setOptions({...options, generateCode: e.target.checked})} className="w-4 h-4 rounded border-slate-700 text-blue-500 focus:ring-0" />
                  <span className="text-sm font-bold tracking-wider">產出完整網頁程式碼</span>
                </label>
              </div>
              
              <div className="pt-4 space-y-3">
                <select 
                  value={options.style} 
                  onChange={(e) => setOptions({...options, style: e.target.value as any})} 
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-600 focus:border-blue-500 outline-none appearance-none"
                >
                  {options.category === 'professional' ? (
                    <>
                      <option value="professional">風格：專業嚴謹實證</option>
                      <option value="warm">風格：暖心衛教導向</option>
                      <option value="structured">風格：條理邏輯結構</option>
                    </>
                  ) : (
                    <>
                      <option value="engaging">風格：生動體驗敘事</option>
                      <option value="warm">風格：親切生活隨筆</option>
                      <option value="humorous">風格：幽默趣味共鳴</option>
                    </>
                  )}
                </select>
                <select 
                  value={options.length} 
                  onChange={(e) => setOptions({...options, length: e.target.value as any})} 
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-600 focus:border-blue-500 outline-none appearance-none"
                >
                  <option value="short">長度：短篇精華 (600字)</option>
                  <option value="medium">長度：標準規格 (1200字)</option>
                  <option value="long">長度：深度專題解析</option>
                </select>
              </div>
            </div>

            {/* 參考過往文章卡片 */}
            <div className="bg-white p-6 rounded-3xl border border-blue-50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4 text-slate-700">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={useReference} 
                  onChange={(e) => setUseReference(e.target.checked)} 
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all" 
                />
                <span className="font-bold group-hover:text-blue-600 transition-colors">參考過往文章敘事口吻</span>
              </label>
              
              {useReference && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <textarea 
                    value={referenceText}
                    onChange={(e) => setReferenceText(e.target.value)}
                    placeholder="請貼上您以前撰寫的文章，AI 將分析風格並模仿其語氣與節奏..."
                    className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm text-slate-700 placeholder:text-slate-400 transition-all resize-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 右側：主工作區 */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 工作台輸入區 */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-blue-50 shadow-[0_20px_50px_rgba(0,0,0,0.05)] flex flex-col h-full relative overflow-hidden">
              {/* 背景科技光飾 */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-100/30 blur-[80px] pointer-events-none rounded-full"></div>
              
              <div className="flex items-center gap-3 mb-6 relative">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-slate-800">
                  文章大綱、需求指令與參考案例
                  <span className="block text-sm font-normal text-blue-500 mt-1">
                    {options.category === 'professional' ? '(請提供兩個獨特的見解)' : '(請提供在地人才知道的秘辛或是分享小秘訣)'}
                  </span>
                </h2>
              </div>

              <textarea 
                value={outline}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setOutline(e.target.value)}
                placeholder={placeholderText}
                className="w-full h-[450px] p-6 bg-slate-50/50 border border-slate-100 rounded-[2rem] focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none text-base leading-relaxed text-slate-700 placeholder:text-slate-300 transition-all resize-none"
              />
              
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 產生指令按鈕 */}
                <button 
                  onClick={handleGenerateAndCopy}
                  className={`py-5 rounded-2xl font-black tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95 ${
                    isCopied 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-200' 
                    : 'bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 hover:from-blue-700 hover:via-indigo-600 hover:to-purple-700 text-white shadow-blue-200'
                  }`}
                >
                  {isCopied ? <ClipboardCheck className="w-6 h-6" /> : <Copy className="w-5 h-5" />}
                  {isCopied ? '指令已成功複製' : '產生並複製指令'}
                </button>
                
                {/* 開啟 AI 視窗按鈕區 */}
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={openClaude}
                    disabled={!generatedPrompt}
                    className={`py-5 rounded-2xl font-black tracking-widest transition-all flex items-center justify-center gap-1 shadow-lg text-sm active:scale-95 border-none bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-orange-200 ${
                      generatedPrompt 
                      ? 'hover:from-amber-600 hover:to-orange-600 opacity-100' 
                      : 'opacity-50 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <ExternalLink className="w-4 h-4" /> CLAUDE
                  </button>
                  <button 
                    onClick={openGemini}
                    disabled={!generatedPrompt}
                    className={`py-5 rounded-2xl font-black tracking-widest transition-all flex items-center justify-center gap-1 shadow-lg text-sm active:scale-95 ${
                      generatedPrompt 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-blue-200 border-none opacity-100' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border-2 border-slate-100 opacity-50'
                    }`}
                  >
                    <ExternalLink className="w-4 h-4" /> GEMINI
                  </button>
                </div>
              </div>

              {/* 產出的 Prompt 預覽 */}
              {generatedPrompt && (
                <div className="mt-8 animate-in zoom-in-95 fade-in duration-500">
                  <div className="flex items-center justify-between mb-3 px-2">
                    <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">指令編譯預覽 (已自動複製)</span>
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                      <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></div>
                    </div>
                  </div>
                  <div className="p-6 bg-slate-900 rounded-3xl text-sm font-mono text-blue-100/90 leading-relaxed max-h-48 overflow-y-auto border border-white/10 shadow-inner">
                    <span className="text-emerald-400 mr-2">❯</span> {generatedPrompt}
                  </div>
                  <p className="text-center text-xs text-blue-600 mt-4 font-bold">
                    💡 提示：現在您可以直接到 AI 視窗按下「Ctrl + V」貼上指令了！
                  </p>
                </div>
              )}
            </div>

            <footer className="text-center py-8 text-[11px] font-bold text-slate-300 tracking-[0.3em] uppercase">
              專業創作者專用系統 &copy; 2026 智網 AI 引擎
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}