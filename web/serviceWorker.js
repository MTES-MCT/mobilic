// This optional code is used to register a service worker.
// register() is not called by default.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on subsequent visits to a page, after all the
// existing tabs open on the page have been closed, since previously cached
// resources are updated in the background.

// To learn more about the benefits of this model and instructions on how to
// opt-in, read https://bit.ly/CRA-PWA

const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === "[::1]" ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

export function register(config) {
  console.log("1");
  if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
    console.log("2");
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    console.log("3");
    if (publicUrl.origin !== window.location.origin) {
      console.log("4");
      // Our service worker won't work if PUBLIC_URL is on a different origin
      // from what our page is served on. This might happen if a CDN is used to
      // serve assets; see https://github.com/facebook/create-react-app/issues/2374
      return;
    }

    window.addEventListener("load", () => {
      console.log("5");
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        console.log("6");
        // This is running on localhost. Let's check if a service worker still exists or not.
        checkValidServiceWorker(swUrl, config);

        // Add some additional logging to localhost, pointing developers to the
        // service worker/PWA documentation.
        navigator.serviceWorker.ready.then(() => {
          console.log(
            "This web app is being served cache-first by a service " +
              "worker. To learn more, visit https://bit.ly/CRA-PWA"
          );
        });
      } else {
        console.log("7");
        // Is not localhost. Just register service worker
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  console.log("registerValidSW", swUrl);
  const currentServiceWorker = navigator.serviceWorker.controller;
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      registration.onupdatefound = () => {
        console.log("registration.onupdatefound");
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
      };
    })
    .catch(error => {
      console.error("Error during service worker registration:", error);
    });
  navigator.serviceWorker.oncontrollerchange = () => {
    console.log("Detecting new service worker");
    if (currentServiceWorker) window.location.reload();
  };
}

function checkValidServiceWorker(swUrl, config) {
  // Check if the service worker can be found. If it can't reload the page.
  console.log("checkValidServiceWorker, swUrl", swUrl);
  console.log("checkValidServiceWorker, config", config);
  fetch(swUrl, {
    headers: { "Service-Worker": "script" }
  })
    .then(response => {
      // Ensure service worker exists, and that we really are getting a JS file.
      console.log("checkResponse", response);
      console.log("content-type", response.headers.get("content-type"));
      const contentType = response.headers.get("content-type");
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf("javascript") === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then(registration => {
          registration.unregister().then(() => {
            console.log("UNREGISTER SERVICE WORKER");
            window.location.reload();
          });
        });
      } else {
        console.log("registerValidSW");
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log(
        "No internet connection found. App is running in offline mode."
      );
    });
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.unregister();
    });
  }
}
