// Polyfills OBLIGATOIRES en premier
import "core-js";
import * as serviceWorker from "./serviceWorker";
import React from "react";
import Root from "./root";
import { createRoot } from "react-dom/client";
import { initSentry } from "common/utils/sentry";
import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";
import { Link } from "react-router-dom";

if (typeof global === 'undefined') {
  window.global = window;
}
if (typeof process === 'undefined') {
  window.process = { env: {}, browser: true };
}

startReactDsfr({
  defaultColorScheme: "light",
  Link
});

initSentry();


const container = document.getElementById("root");
const root = createRoot(container);
root.render(<Root />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
