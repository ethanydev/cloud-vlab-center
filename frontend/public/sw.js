// Service Worker — 푸시 알림 수신 및 표시

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "알림", body: event.data.text() };
  }

  const { title, body, icon, data } = payload;

  event.waitUntil(
    self.registration.showNotification(title || "가상 실습실", {
      body: body || "",
      icon: icon || "/img.png",
      badge: "/img.png",
      data: data || {},
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  let path = "/";

  if (
    data.type === "reservation_approved" ||
    data.type === "reservation_rejected"
  ) {
    path = "/?page=reservations";
  } else if (data.type === "container_ready") {
    path = "/?page=reservations";
  }

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // 이미 열린 탭이 있으면 포커스
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.focus();
            client.postMessage({ type: "SW_NAVIGATE", page: data.type === "container_ready" ? "reservations" : "reservations" });
            return;
          }
        }
        // 없으면 새 탭 열기
        if (clients.openWindow) {
          return clients.openWindow(self.location.origin + path);
        }
      })
  );
});
