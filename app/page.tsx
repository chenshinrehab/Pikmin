'use client'

import { useState, useEffect, useRef } from 'react'

type Timer = {
  id: string;
  location: string;
  targetTime: number; // Unix Timestamp (ms)
  isTriggered: boolean;
}

export default function PikminTimer() {
  const [timers, setTimers] = useState<Timer[]>([])
  const [minutes, setMinutes] = useState('')
  const [location, setLocation] = useState('')
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [isAlarming, setIsAlarming] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 1. 初始化：註冊 SW、請求權限、載入快取、建立音效實例
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => console.error('SW register failed:', err));
    }

    const saved = localStorage.getItem('pikmin-timers')
    if (saved) {
      try {
        setTimers(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to parse saved timers", e)
      }
    }

    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission()
    }

    const audio = new Audio('/alert.mp3')
    audio.loop = true
    audioRef.current = audio

    return () => {
      audio.pause()
      audioRef.current = null
    }
  }, [])

  // 2. 持久化儲存計時器
  useEffect(() => {
    localStorage.setItem('pikmin-timers', JSON.stringify(timers))
  }, [timers])

  // 3. 核心時鐘：每秒檢查時間與更新介面
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setCurrentTime(now)

      setTimers(prevTimers => {
        let hasChanges = false
        const updated = prevTimers.map(timer => {
          if (!timer.isTriggered && now >= timer.targetTime) {
            hasChanges = true
            triggerAlarm(timer)
            return { ...timer, isTriggered: true }
          }
          return timer
        })
        return hasChanges ? updated : prevTimers
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // 4. 觸發鬧鈴邏輯 (音樂 + 震動 + 通知)
  const triggerAlarm = async (timer: Timer) => {
    setIsAlarming(true)
    
    if (audioRef.current) {
      audioRef.current.play().catch(e => {
        console.warn("自動播放被瀏覽器阻擋", e)
      })
    }

    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready
      registration.showNotification('🍄 準備打蘑菇囉！', {
        body: `${timer.location ? `地點：${timer.location}\n` : ''}新蘑菇即將生成，點擊開啟遊戲！`,
        icon: '/icon.png',
        // @ts-ignore: vibrate property might not be in the default TS NotificationOptions
        vibrate: [500, 200, 500, 200, 500],
        tag: timer.id,
        requireInteraction: true 
      })
    }
  }

  // 5. 停止鬧鈴
  const stopAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsAlarming(false)
  }

  // 6. 新增計時器邏輯
  const handleAddTimer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!minutes || isNaN(Number(minutes))) return

    const extraTimeMs = 4.5 * 60 * 1000
    const targetTime = Date.now() + (Number(minutes) * 60 * 1000) + extraTimeMs

    const newTimer: Timer = {
      id: crypto.randomUUID(),
      location: location || '某處的蘑菇',
      targetTime,
      isTriggered: false
    }

    setTimers(prev => [...prev, newTimer].sort((a, b) => a.targetTime - b.targetTime))
    setMinutes('')
    setLocation('')
    
    // 解鎖音效權限
    if (audioRef.current) {
      const promise = audioRef.current.play();
      promise.then(() => audioRef.current?.pause()).catch(() => {});
    }
  }

  // 格式化倒數計時字串
  const formatCountdown = (target: number) => {
    const diff = target - currentTime
    if (diff <= 0) return "TIME UP!"
    
    const totalSeconds = Math.floor(diff / 1000)
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <main className={`min-h-screen p-4 md:p-8 transition-colors duration-500 ${isAlarming ? 'bg-red-50' : 'bg-stone-50'}`}>
      <div className="max-w-md mx-auto">
        <header className="text-center mb-8 pt-4 flex flex-col items-center">
          <div className="text-6xl mb-2">🍄</div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">蘑菇計時器</h1>
          <p className="text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs font-bold mt-2">爆掉倒數 + 4分30秒提醒</p>
        </header>

        {isAlarming && (
          <div className="mb-8 animate-pulse">
            <button 
              onClick={stopAlarm}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-5 rounded-full text-xl shadow-lg shadow-red-200 active:scale-95 transition-all"
            >
              哨聲停止！準備戰鬥！
            </button>
          </div>
        )}

        <form onSubmit={handleAddTimer} className="bg-white p-6 rounded-3xl border border-stone-100 shadow-xl shadow-stone-500/5 mb-8 space-y-4">
          <h2 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
            <span className="text-green-600">✚</span> 新增蘑菇任務
          </h2>
          <div>
            <label className="text-xs font-bold text-stone-500 ml-1">現在蘑菇還剩幾分鐘？</label>
            <input 
              type="number" step="any" required placeholder="例如：15"
              className="w-full bg-stone-100 p-4 rounded-2xl text-stone-900 mt-1 focus:ring-2 focus:ring-green-400 outline-none transition placeholder:text-stone-400"
              value={minutes} onChange={e => setMinutes(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-stone-500 ml-1">在哪裡？(選填)</label>
            <input 
              type="text" placeholder="例如：車站前大蘑菇"
              className="w-full bg-stone-100 p-4 rounded-2xl text-stone-900 mt-1 focus:ring-2 focus:ring-green-400 outline-none transition placeholder:text-stone-400"
              value={location} onChange={e => setLocation(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 shadow-md shadow-green-200 text-lg">
            開始可愛倒數
          </button>
        </form>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-stone-400 tracking-wider ml-2">正在計時的蘑菇</h3>
          {timers.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-stone-100 text-stone-400 shadow-inner">
              <div className="text-5xl mb-3">🍃</div>
              目前沒有任務喔
            </div>
          )}
          {timers.map(timer => (
            <div 
              key={timer.id} 
              className={`p-5 rounded-3xl border transition-all ${
                timer.isTriggered 
                ? 'bg-stone-100 border-stone-200 opacity-60' 
                : 'bg-white border-green-100 shadow-md shadow-green-500/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-stone-500 text-xs font-medium truncate bg-stone-100 inline-block px-2 py-0.5 rounded-md mb-1">{timer.location}</p>
                  <p className={`text-3xl font-mono font-bold tracking-tighter ${timer.isTriggered ? 'text-stone-500' : 'text-green-600'}`}>
                    {formatCountdown(timer.targetTime)}
                  </p>
                </div>
                <button 
                  onClick={() => setTimers(prev => prev.filter(t => t.id !== timer.id))}
                  className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  ✕
                </button>
              </div>
              {!timer.isTriggered && (
                <div className="w-full bg-stone-100 h-1 rounded-full mt-4 overflow-hidden">
                    <div className="bg-green-400 h-full animate-pulse" style={{width: '70%'}}></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}