// public/sw.js
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  // 點擊通知後嘗試開啟皮克敏 App
  event.waitUntil(
    clients.openWindow('pikminbloom://')
  );
});