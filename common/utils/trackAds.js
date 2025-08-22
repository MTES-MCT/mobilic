const initAxeptio = () => {
  window.axeptioSettings = {
    clientId: "64f1d4e7850da3efb96b1576",
    cookiesVersion: "V1.0"
  };

  (function(d, s) {
    const t = d.getElementsByTagName(s)[0];
    const e = d.createElement(s);
    e.async = true;
    e.src = "//static.axept.io/sdk-slim.js";
    t.parentNode.insertBefore(e, t);
  })(document, "script");
};

function gtag() {
  window.dataLayer.push(arguments);
}

const initGoogleAds = () => {
  const el = document.createElement("script");
  el.setAttribute(
    "src",
    "https://www.googletagmanager.com/gtag/js?id=AW-11378818239"
  );
  el.setAttribute("async", true);
  if (document.body !== null) {
    document.body.appendChild(el);
  }

  window.dataLayer = window.dataLayer || [];
  gtag("js", new Date());
  gtag("config", "AW-11378818239");
};

const isGoogleAdsInitiated = () => {
  return !!window.dataLayer;
};

const trackGoogleAds = () => {
  if (!isGoogleAdsInitiated()) {
    console.info("Google ads script not initiated: event won't be sent");
  } else {
    gtag("event", "conversion", {
      send_to: "AW-11378818239/ErUFCOnghf8YEL_567Eq"
    });
  }
};

const removeGoogleAds = () => {
  if (window.dataLayer) {
    delete window.dataLayer;
  }
};

module.exports = {
  initAxeptio,
  initGoogleAds,
  trackGoogleAds,
  removeGoogleAds,
  isGoogleAdsInitiated
};
