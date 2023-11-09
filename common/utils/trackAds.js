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
  function gtag() {
    window.dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "AW-11378818239");
};

const removeGoogleAds = () => {
  if (window.dataLayer) {
    delete window.dataLayer;
  }
};

module.exports = {
  initAxeptio,
  initGoogleAds,
  removeGoogleAds
};
