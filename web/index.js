import "core-js";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import * as Sentry from "@sentry/browser";
import React from "react";
import Root from "./root";

if (process.env.REACT_APP_SENTRY_URL) {
  Sentry.init({ dsn: process.env.REACT_APP_SENTRY_URL });
}

ReactDOM.render(<Root />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
