import "core-js";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import React from "react";
import Root from "./root";
import { initSentry } from "common/utils/sentry";
console.log("A");

initSentry();
console.log("B");

// Crisp button
if (process.env.REACT_APP_CRISP_WEBSITE_ID) {
  window.$crisp = [];
  window.CRISP_WEBSITE_ID = process.env.REACT_APP_CRISP_WEBSITE_ID;
  const script = document.createElement("script");
  script.src = "https://client.crisp.chat/l.js";
  script.async = 1;
  document.getElementsByTagName("head")[0].appendChild(script);
}
console.log("C");

ReactDOM.render(<Root />, document.getElementById("root"));
console.log("D");

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
console.log("E");
