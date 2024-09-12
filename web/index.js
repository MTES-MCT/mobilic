import "core-js";
import * as serviceWorker from "./serviceWorker";
import React from "react";
import Root from "./root";
import { createRoot } from "react-dom/client";
import { initSentry } from "common/utils/sentry";
import { Crisp } from "crisp-sdk-web";

initSentry();

if (process.env.REACT_APP_CRISP_WEBSITE_ID) {
  Crisp.configure(process.env.REACT_APP_CRISP_WEBSITE_ID, {
    autoload: process.env.REACT_APP_CRISP_AUTOLOAD === "1"
  });
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<Root />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
