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

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url.indexOf(self.location.origin) !== -1 && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow("/app");
    })
  );
});
