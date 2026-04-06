'use client'

import { useState, useEffect } from 'react'

type AlarmRecord = {
  id: string;
  location: string;
  targetTime: number; 
  displayTime: string; // 格式化後的時間 (HH:mm)
}

export default function PikminTimer() {
  const [minutes, setMinutes] = useState('')
  const [seconds, setSeconds] = useState('')
  const [location, setLocation] = useState('')
  const [history, setHistory] = useState<AlarmRecord[]>([])

  // 1. 初始化：載入歷史紀錄
  useEffect(() => {
    const saved = localStorage.getItem('pikmin-alarm-history')
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch (e) {
        console.error("載入紀錄失敗", e)
      }
    }
  }, [])

  // 2. 儲存紀錄
  useEffect(() => {
    localStorage.setItem('pikmin-alarm-history', JSON.stringify(history))
  }, [history])

  // 3. 核心邏輯：計算時間並跳轉系統鬧鐘
  const handleSetAlarm = (e: React.FormEvent) => {
    e.preventDefault()
    const m = Number(minutes) || 0
    const s = Number(seconds) || 0
    if (m === 0 && s === 0) return

    // 計算目標時間：現在 + 輸入時間 + 4.5 分鐘 (270秒)
    const now = new Date()
    const totalOffsetSeconds = (m * 60) + s + (4.5 * 60)
    const targetDate = new Date(now.getTime() + totalOffsetSeconds * 1000)

    // 格式化為 HH:mm
    const hh = targetDate.getHours().toString().padStart(2, '0')
    const mm = targetDate.getMinutes().toString().padStart(2, '0')
    const alarmTimeStr = `${hh}:${mm}`
    const label = location || '🍄 皮克敏蘑菇'

    // 新增紀錄
    const newRecord: AlarmRecord = {
      id: crypto.randomUUID(),
      location: label,
      targetTime: targetDate.getTime(),
      displayTime: alarmTimeStr
    }
    setHistory(prev => [newRecord, ...prev].slice(0, 10)) // 保留最近10筆

    // 清空輸入
    setMinutes('')
    setSeconds('')
    setLocation('')

    // --- 跳轉系統鬧鐘 ---
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)

    if (isIOS) {
      // iOS: 請確保已建立名為 「PikTimer」 的捷徑
      // 捷徑應接受文字輸入：時間,地點
      const shortcutUrl = `shortcuts://run-shortcut?name=PikTimer&input=${alarmTimeStr},${label}`
      window.location.href = shortcutUrl
    } else {
      // Android: 使用 Intent 喚起鬧鐘設定
      const androidIntent = `intent://com.android.deskclock/#Intent;action=android.intent.action.SET_ALARM;i.android.intent.extra.alarm.HOUR=${hh};i.android.intent.extra.alarm.MINUTES=${mm};s.android.intent.extra.alarm.MESSAGE=${label};i.android.intent.extra.alarm.SKIP_UI=false;end`
      window.location.href = androidIntent
    }
  }

  const removeRecord = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id))
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-stone-50 font-sans">
      <div className="max-w-md mx-auto">
        
        <header className="text-center mb-8 pt-4 flex flex-col items-center">
          <div className="text-6xl mb-2">🍄</div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">蘑菇鬧鐘助手</h1>
          <p className="text-green-700 bg-green-100 px-3 py-1 rounded-full text-[10px] font-bold mt-2 tracking-widest uppercase">自動計算 + 4 分 30 秒</p>
        </header>

        {/* 輸入表單卡片 */}
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
            <label className="text-[10px] font-black text-stone-400 ml-1 uppercase">地點或標籤</label>
            <input 
              type="text" placeholder="例如：火車站前"
              className="w-full bg-stone-100 p-4 rounded-2xl text-stone-900 mt-1 focus:ring-2 focus:ring-green-400 outline-none transition"
              value={location} onChange={e => setLocation(e.target.value)}
            />
          </div>

          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-black py-4 rounded-2xl transition-all active:scale-95 shadow-md shadow-green-200 text-lg">
            計算並跳轉鬧鐘
          </button>
        </form>

        {/* 歷史紀錄清單 */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-stone-300 tracking-[0.2em] ml-2 uppercase">最近設定的紀錄</h3>
          
          {history.length === 0 && (
            <div className="text-center py-12 bg-white rounded-[32px] border border-stone-100 text-stone-400 shadow-inner">
              <div className="text-5xl mb-3 opacity-30">🍃</div>
              目前沒有紀錄喔
            </div>
          )}

          {history.map(item => (
            <div 
              key={item.id} 
              className="p-6 bg-white rounded-[32px] border border-green-50 shadow-md shadow-green-500/5 flex items-center justify-between group"
            >
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-stone-400 text-[10px] font-black uppercase mb-1 truncate">{item.location}</p>
                <p className="text-4xl font-mono font-bold tracking-tighter text-green-600">
                  {item.displayTime}
                </p>
              </div>
              <button 
                onClick={() => removeRecord(item.id)}
                className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-300 hover:text-red-500 transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="mt-10 p-4 bg-white/50 rounded-2xl border border-stone-100">
          <p className="text-[10px] text-stone-400 leading-relaxed text-center">
            💡 <strong className="text-stone-500">提示：</strong><br/>
            iOS：請建立名為 <code className="bg-stone-200 px-1 rounded">PikTimer</code> 的捷徑。<br/>
            Android：點擊按鈕後會直接彈出鬧鐘編輯視窗。
          </p>
        </div>
      </div>
    </main>
  )
}