self.addEventListener("push", function (event) {
  var payload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch (e) {
      payload = { title: "Mobilic", body: event.data.text() };
    }
  }

  var title = payload.title || "Mobilic";
  var options = {
    body: payload.body || "",
    icon: "/logos/logo192.png",
    badge: "/logos/logo48-maskable.png",
    data: payload.data || {},
    tag: payload.tag || "mobilic-notification",
    renotify: true,
    silent: false,
    requireInteraction: true
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  var data = event.notification.data || {};
  if (data.campaignId && data.clickToken) {
    fetch(
      "/api/campaign-click?c=" + data.campaignId + "&t=" + data.clickToken,
      { keepalive: true }
    ).catch(function () {});
  }

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (var client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow("/app");
    })
  );
});
