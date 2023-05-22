import "core-js";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import React from "react";
import Root from "./root";
import { initSentry } from "common/utils/sentry";
import { Crisp } from "crisp-sdk-web";

initSentry();

Crisp.configure(process.env.REACT_APP_CRISP_WEBSITE_ID, {
  autoload: false
});

ReactDOM.render(<Root />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
