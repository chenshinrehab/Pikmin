'use client'

import { useState, useEffect } from 'react'

type Timer = {
  id: string;
  location: string;
  startTime: number;  // 按下開始的時間點
  targetTime: number; // 爆掉 + 4.5分後的目標時間點
  isTriggered: boolean;
}

export default function PikminTimer() {
  const [timers, setTimers] = useState<Timer[]>([])
  const [minutes, setMinutes] = useState('')
  const [seconds, setSeconds] = useState('')
  const [location, setLocation] = useState('')
  const [currentTime, setCurrentTime] = useState(Date.now())

  // 1. 初始化與即時時鐘
  useEffect(() => {
    const saved = localStorage.getItem('pikmin-active-timers')
    if (saved) setTimers(JSON.parse(saved))

    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // 2. 儲存計時器
  useEffect(() => {
    localStorage.setItem('pikmin-active-timers', JSON.stringify(timers))
  }, [timers])

  // 3. 核心功能：計算、跳轉並開啟網頁倒數
  const handleStart = (e: React.FormEvent) => {
    e.preventDefault()
    const m = Number(minutes) || 0
    const s = Number(seconds) || 0
    if (m === 0 && s === 0) return

    const nowMs = Date.now()
    // 總偏移：(輸入分*60 + 輸入秒 + 4.5分*60) 轉換為毫秒
    const offsetMs = (m * 60 + s + 4.5 * 60) * 1000
    const targetMs = nowMs + offsetMs

    // A. 建立網頁倒數紀錄
    const newTimer: Timer = {
      id: crypto.randomUUID(),
      location: location || '某處的蘑菇',
      startTime: nowMs,
      targetTime: targetMs,
      isTriggered: false
    }
    setTimers(prev => [newTimer, ...prev].sort((a, b) => a.targetTime - b.targetTime))

    // B. 準備跳轉系統鬧鐘的時間資訊
    const targetDate = new Date(targetMs)
    const hh = targetDate.getHours()
    const mm = targetDate.getMinutes()
    const label = location || '🍄 皮克敏蘑菇'

    // C. 執行跳轉
    const userAgent = navigator.userAgent || navigator.vendor;
    if (/iPhone|iPad|iPod/i.test(userAgent)) {
      // iOS 捷徑方案
      window.location.href = `shortcuts://run-shortcut?name=PikTimer&input=${hh}:${mm},${label}`;
    } else {
      // Android 修正版 Intent
      const androidUrl = `intent://#Intent;action=android.intent.action.SET_ALARM;i.android.intent.extra.alarm.HOUR=${hh};i.android.intent.extra.alarm.MINUTES=${mm};s.android.intent.extra.alarm.MESSAGE=${encodeURIComponent(label)};i.android.intent.extra.alarm.SKIP_UI=false;end`;
      window.location.href = androidUrl;
    }

    setMinutes(''); setSeconds(''); setLocation('');
  }

  // 格式化倒數文字
  const formatCountdown = (target: number) => {
    const diff = target - currentTime
    if (diff <= 0) return "時間到！"
    const totalSec = Math.floor(diff / 1000)
    const min = Math.floor(totalSec / 60)
    const sec = totalSec % 60
    return `${min}:${sec.toString().padStart(2, '0')}`
  }

  // 計算進度條比例
  const getProgress = (timer: Timer) => {
    const total = timer.targetTime - timer.startTime
    const elapsed = currentTime - timer.startTime
    const progress = (elapsed / total) * 100
    return Math.min(Math.max(progress, 0), 100)
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-stone-50 font-sans text-stone-900">
      <div className="max-w-md mx-auto">
        <header className="text-center mb-8 pt-4 flex flex-col items-center">
          <div className="text-6xl mb-2 text-center">🍄</div>
          <h1 className="text-3xl font-extrabold tracking-tight text-center">蘑菇計時助手</h1>
          <p className="text-green-700 bg-green-100 px-3 py-1 rounded-full text-[10px] font-bold mt-2 tracking-widest uppercase text-center">自動計算 + 4 分 30 秒</p>
        </header>

        {/* 輸入區卡片 */}
        <form onSubmit={handleStart} className="bg-white p-6 rounded-[32px] border border-stone-100 shadow-xl shadow-stone-500/5 mb-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-stone-400 ml-1 uppercase">分鐘</label>
              <input 
                type="number" placeholder="0" className="w-full bg-stone-100 p-4 rounded-2xl text-xl font-bold outline-none focus:ring-2 focus:ring-green-400"
                value={minutes} onChange={e => setMinutes(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-stone-400 ml-1 uppercase">秒數</label>
              <input 
                type="number" placeholder="0" className="w-full bg-stone-100 p-4 rounded-2xl text-xl font-bold outline-none focus:ring-2 focus:ring-green-400"
                value={seconds} onChange={e => setSeconds(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-stone-400 ml-1 uppercase">地點標籤 (鬧鐘名稱)</label>
            <input 
              type="text" placeholder="例如：火車站前" className="w-full bg-stone-100 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-green-400"
              value={location} onChange={e => setLocation(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl transition-all active:scale-95 shadow-md shadow-green-200 text-lg">
            開始倒數並跳轉鬧鐘
          </button>
        </form>

        {/* 正在計時清單 */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-stone-300 tracking-[0.2em] ml-2 uppercase text-center">進行中的倒數</h3>
          {timers.length === 0 && (
            <div className="text-center py-12 bg-white rounded-[32px] border border-stone-100 text-stone-400 shadow-inner">
               <div className="text-5xl mb-3 opacity-30">🍃</div>
               尚無任務
            </div>
          )}
          {timers.map(timer => (
            <div key={timer.id} className="p-6 bg-white rounded-[32px] border border-green-50 shadow-md shadow-green-500/5 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-stone-400 text-[10px] font-black uppercase mb-1 truncate">{timer.location}</p>
                  <p className="text-4xl font-mono font-bold tracking-tighter text-green-600">
                    {formatCountdown(timer.targetTime)}
                  </p>
                </div>
                <button 
                  onClick={() => setTimers(prev => prev.filter(t => t.id !== timer.id))}
                  className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-300 hover:text-red-500"
                >
                  ✕
                </button>
              </div>
              {/* 進度條 */}
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-green-500 h-full transition-all duration-1000 ease-linear"
                  style={{ width: `${getProgress(timer)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-[10px] text-stone-400 text-center leading-relaxed">
          Android 若無反應：請改用 Chrome 開啟，並點擊「允許開啟外部應用程式」。<br/>
          iOS 若無反應：需配合名為 PikTimer 的捷徑。
        </p>
      </div>
    </main>
  )
}