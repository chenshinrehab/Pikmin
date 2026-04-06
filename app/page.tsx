'use client'

import { useState, useEffect } from 'react'

type AlarmRecord = {
  id: string;
  location: string;
  targetTime: number; 
  displayTime: string; 
}

export default function PikminTimer() {
  const [minutes, setMinutes] = useState('')
  const [seconds, setSeconds] = useState('')
  const [location, setLocation] = useState('')
  const [history, setHistory] = useState<AlarmRecord[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('pikmin-alarm-history')
    if (saved) {
      try { setHistory(JSON.parse(saved)) } catch (e) { console.error(e) }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('pikmin-alarm-history', JSON.stringify(history))
  }, [history])

  const handleSetAlarm = (e: React.FormEvent) => {
    e.preventDefault()
    const m = Number(minutes) || 0
    const s = Number(seconds) || 0
    if (m === 0 && s === 0) return

    const now = new Date()
    const totalOffsetSeconds = (m * 60) + s + (4.5 * 60)
    const targetDate = new Date(now.getTime() + totalOffsetSeconds * 1000)

    const hh = targetDate.getHours()
    const mm = targetDate.getMinutes()
    const alarmTimeStr = `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`
    const label = location || '🍄 皮克敏蘑菇'

    const newRecord: AlarmRecord = {
      id: crypto.randomUUID(),
      location: label,
      targetTime: targetDate.getTime(),
      displayTime: alarmTimeStr
    }
    setHistory(prev => [newRecord, ...prev].slice(0, 10))

    setMinutes(''); setSeconds(''); setLocation('');

    // --- 跳轉系統鬧鐘邏輯 ---
    const userAgent = navigator.userAgent || navigator.vendor;
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);

    if (isIOS) {
      // iOS 方案 (捷徑)
      window.location.href = `shortcuts://run-shortcut?name=PikTimer&input=${alarmTimeStr},${label}`;
    } else {
      // Android 方案 (優化版 Intent)
      // 使用更通用的 Android 鬧鐘 Intent 格式
      const androidUrl = `intent://#Intent;action=android.intent.action.SET_ALARM;i.android.intent.extra.alarm.HOUR=${hh};i.android.intent.extra.alarm.MINUTES=${mm};s.android.intent.extra.alarm.MESSAGE=${encodeURIComponent(label)};i.android.intent.extra.alarm.SKIP_UI=false;end`;
      
      // 嘗試直接跳轉
      window.location.href = androidUrl;

      // 如果 500ms 後沒反應，可能是被阻擋，嘗試備用方案
      setTimeout(() => {
        if (confirm(`計算完成：${alarmTimeStr}\n是否手動開啟鬧鐘？`)) {
            // 備用方案：嘗試開啟時鐘 App
            window.location.href = "intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;component=com.android.deskclock/com.android.deskclock.DeskClock;end";
        }
      }, 500);
    }
  }

  const removeRecord = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id))
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-stone-50 font-sans">
      <div className="max-w-md mx-auto">
        <header className="text-center mb-8 pt-4 flex flex-col items-center">
          <div className="text-6xl mb-2 text-center">🍄</div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">蘑菇鬧鐘助手</h1>
          <p className="text-green-700 bg-green-100 px-3 py-1 rounded-full text-[10px] font-bold mt-2 tracking-widest uppercase text-center">自動計算 + 4 分 30 秒</p>
        </header>

        <form onSubmit={handleSetAlarm} className="bg-white p-6 rounded-[32px] border border-stone-100 shadow-xl shadow-stone-500/5 mb-8 space-y-4">
          <h2 className="text-lg font-bold text-stone-800 mb-2 flex items-center gap-2">
            <span className="text-green-600 text-xl">✚</span> 設定新提醒
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-stone-400 ml-1 uppercase">分鐘</label>
              <input 
                type="number" placeholder="0" required
                className="w-full bg-stone-100 p-4 rounded-2xl text-stone-900 mt-1 focus:ring-2 focus:ring-green-400 outline-none transition text-xl font-bold"
                value={minutes} onChange={e => setMinutes(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-stone-400 ml-1 uppercase">秒數</label>
              <input 
                type="number" placeholder="0"
                className="w-full bg-stone-100 p-4 rounded-2xl text-stone-900 mt-1 focus:ring-2 focus:ring-green-400 outline-none transition text-xl font-bold"
                value={seconds} onChange={e => setSeconds(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-stone-400 ml-1 uppercase">地點標籤</label>
            <input 
              type="text" placeholder="例如：火車站前"
              className="w-full bg-stone-100 p-4 rounded-2xl text-stone-900 mt-1 focus:ring-2 focus:ring-green-400 outline-none transition"
              value={location} onChange={e => setLocation(e.target.value)}
            />
          </div>

          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl transition-all active:scale-95 shadow-md shadow-green-200 text-lg">
            計算並開啟系統鬧鐘
          </button>
        </form>

        <div className="space-y-4">
          <h3 className="text-xs font-black text-stone-300 tracking-[0.2em] ml-2 uppercase">最近紀錄</h3>
          {history.length === 0 && (
            <div className="text-center py-12 bg-white rounded-[32px] border border-stone-100 text-stone-400 shadow-inner italic text-sm">
              尚未有設定紀錄
            </div>
          )}

          {history.map(item => (
            <div key={item.id} className="p-6 bg-white rounded-[32px] border border-green-50 shadow-md shadow-green-500/5 flex items-center justify-between">
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-stone-400 text-[10px] font-black uppercase mb-1 truncate">{item.location}</p>
                <p className="text-4xl font-mono font-bold tracking-tighter text-green-600">{item.displayTime}</p>
              </div>
              <button 
                onClick={() => removeRecord(item.id)}
                className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-300 hover:text-red-500"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}