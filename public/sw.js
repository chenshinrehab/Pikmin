// public/sw.js
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/') // 點擊通知回網頁
  );
});