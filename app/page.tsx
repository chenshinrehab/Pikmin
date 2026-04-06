'use client'

import { useState, useEffect, useRef } from 'react'

type Timer = {
  id: string;
  location: string;
  startTime: number;
  targetTime: number;
  isTriggered: boolean;
}

export default function PikminTimer() {
  const [timers, setTimers] = useState<Timer[]>([])
  const [minutes, setMinutes] = useState('')
  const [seconds, setSeconds] = useState('')
  const [location, setLocation] = useState('')
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [isAlarming, setIsAlarming] = useState(false)
  const [activeLocation, setActiveLocation] = useState('')
  const [isTabActive, setIsTabActive] = useState(true)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const wakeLockRef = useRef<any>(null)

  // 1. 初始化與偵測頁面狀態
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(e => console.error(e));
    }

    const saved = localStorage.getItem('pikmin-timers-v3')
    if (saved) setTimers(JSON.parse(saved))

    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission()
    }

    const audio = new Audio('/alert.mp3')
    audio.loop = true // 僅在頁面內時循環
    audioRef.current = audio

    // 監聽頁面是否在前台
    const handleVisibilityChange = () => setIsTabActive(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 螢幕常亮請求
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        }
      } catch (e) { console.log('Wake lock failed'); }
    }
    requestWakeLock();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      audio.pause();
      wakeLockRef.current?.release();
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('pikmin-timers-v3', JSON.stringify(timers))
  }, [timers])

  // 2. 核心計時邏輯 (Web Worker)
  useEffect(() => {
    const worker = new Worker('/timer-worker.js');
    worker.onmessage = () => {
      const now = Date.now()
      setCurrentTime(now)

      setTimers(prev => {
        let changed = false;
        const updated = prev.map(t => {
          if (!t.isTriggered && now >= t.targetTime) {
            changed = true;
            handleTrigger(t);
            return { ...t, isTriggered: true }
          }
          return t;
        });

        const filtered = updated.filter(t => {
          if (t.isTriggered && now > t.targetTime + 15000) {
            changed = true;
            return false;
          }
          return true;
        });

        return changed ? filtered : prev;
      });
    }
    return () => worker.terminate();
  }, [isTabActive]); // 依賴 tab 狀態決定提醒方式

  // 3. 提醒觸發邏輯
  const handleTrigger = async (timer: Timer) => {
    // A. 無論如何都發送系統通知 (會震動並發出系統提示音)
    if ('serviceWorker' in navigator && Notification.permission === 'granted') {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification('🍄 準備搶蘑菇！', {
        body: `${timer.location}\n新蘑菇即將生成！`,
        icon: '/icon.png',
        // @ts-ignore
        vibrate: [500, 100, 500],
        tag: timer.id,
        requireInteraction: true
      });
    }

    // B. 如果使用者正在看頁面，才播放音樂並彈窗
    if (document.visibilityState === 'visible') {
      setIsAlarming(true);
      setActiveLocation(timer.location);
      audioRef.current?.play().catch(e => console.log(e));
    }
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const m = Number(minutes) || 0;
    const s = Number(seconds) || 0;
    if (m === 0 && s === 0) return;

    const start = Date.now();
    const target = start + (m * 60 + s + 270) * 1000;

    const newTimer = { id: crypto.randomUUID(), location: location || '某處蘑菇', startTime: start, targetTime: target, isTriggered: false };
    setTimers(prev => [...prev, newTimer].sort((a,b) => a.targetTime - b.targetTime));
    setMinutes(''); setSeconds(''); setLocation('');
    
    // 預解鎖音效
    audioRef.current?.play().then(() => audioRef.current?.pause()).catch(() => {});
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-stone-50 font-sans text-stone-900">
      <div className="max-w-md mx-auto">
        
        {/* 全螢幕彈窗 (僅在頁面內顯示) */}
        {isAlarming && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-green-900/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl text-center border-8 border-green-500 animate-in zoom-in duration-300">
              <div className="text-7xl mb-4">🍄</div>
              <h2 className="text-3xl font-black mb-2">時間到囉！</h2>
              <p className="text-green-700 font-bold mb-6">{activeLocation}</p>
              <button 
                onClick={() => { audioRef.current?.pause(); setIsAlarming(false); }}
                className="w-full bg-green-600 text-white font-black py-5 rounded-full text-xl active:scale-95 transition-all shadow-lg shadow-green-200"
              >
                關閉音樂並去打蘑菇
              </button>
            </div>
          </div>
        )}

        <header className="text-center mb-8 pt-4 flex flex-col items-center">
          <div className="text-6xl mb-2">🍄</div>
          <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">蘑菇計時器</h1>
          <p className="text-green-700 bg-green-100 px-3 py-1 rounded-full text-[10px] font-bold mt-2 tracking-widest uppercase text-center">自動補時 4 分 30 秒</p>
        </header>

        {/* 輸入區 */}
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-[32px] border border-stone-100 shadow-xl shadow-stone-500/5 mb-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-stone-400 ml-1 uppercase">分鐘</label>
              <input type="number" placeholder="0" className="w-full bg-stone-100 p-4 rounded-2xl text-xl font-bold outline-none focus:ring-2 focus:ring-green-400" value={minutes} onChange={e => setMinutes(e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] font-black text-stone-400 ml-1 uppercase">秒數</label>
              <input type="number" placeholder="0" className="w-full bg-stone-100 p-4 rounded-2xl text-xl font-bold outline-none focus:ring-2 focus:ring-green-400" value={seconds} onChange={e => setSeconds(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-stone-400 ml-1 uppercase">地點標籤</label>
            <input type="text" placeholder="例如：公園、火車站" className="w-full bg-stone-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-green-400" value={location} onChange={e => setLocation(e.target.value)} />
          </div>
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl transition-all active:scale-95 shadow-md shadow-green-200">
            開始倒數任務
          </button>
        </form>

        {/* 倒數列表 */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-stone-300 tracking-[0.2em] ml-2 uppercase text-center">進行中的倒數</h3>
          {timers.length === 0 && (
            <div className="text-center py-12 bg-white rounded-[32px] border border-stone-100 text-stone-400 shadow-inner">
               <div className="text-5xl mb-3 opacity-30">🍃</div>
               等待任務中...
            </div>
          )}
          {timers.map(timer => (
            <div key={timer.id} className={`p-6 rounded-[32px] border transition-all ${timer.isTriggered ? 'bg-stone-100 border-stone-200 opacity-40' : 'bg-white border-green-50 shadow-md shadow-green-500/5'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-stone-400 text-[10px] font-black uppercase mb-1 truncate">{timer.location}</p>
                  <p className={`text-4xl font-mono font-bold tracking-tighter ${timer.isTriggered ? 'text-stone-400' : 'text-green-600'}`}>
                    {(timer.targetTime - currentTime <= 0) ? "00:00" : (function() {
                      const d = Math.max(0, timer.targetTime - currentTime);
                      const m = Math.floor(d / 60000);
                      const s = Math.floor((d % 60000) / 1000);
                      return `${m}:${s.toString().padStart(2, '0')}`;
                    })()}
                  </p>
                </div>
                <button onClick={() => setTimers(prev => prev.filter(t => t.id !== timer.id))} className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-300 hover:text-red-500 transition-colors">✕</button>
              </div>
              <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-green-500 h-full transition-all duration-1000 ease-linear"
                  style={{ width: `${Math.min(100, Math.max(0, ((currentTime - timer.startTime) / (timer.targetTime - timer.startTime)) * 100))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}