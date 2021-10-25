import * as Sentry from "@sentry/browser";
import { isConnectionError } from "./errors";

const ERROR_NAMES_TO_FILTER_OUT = [
  "NetworkError",
  "WrongStatusError",
  "AbortError",
  "TimeoutError",
  "InvalidRefreshToken"
];

const ERROR_MESSAGES_TO_FILTER_OUT = [
  "Timeout exceeded",
  "NetworkError when attempting to fetch resource.",
  "La connexion réseau a été perdue.",
  "Non-Error promise rejection captured with value",
  "reading 'firstElementChild'"
];

export function captureSentryException(err, context) {
  if (
    !isConnectionError(err) &&
    !ERROR_NAMES_TO_FILTER_OUT.includes(err.name) &&
    !ERROR_MESSAGES_TO_FILTER_OUT.includes(err.message)
  ) {
    let loggedError = err;
    if (err.networkError) loggedError = err.networkError;
    Sentry.withScope(function(scope) {
      if (loggedError.name === "ServerParseError") {
        loggedError.message = "Could not parse JSON";
        scope.setContext("response", { body: loggedError._text });
      }
      Sentry.captureException(loggedError, context);
    });
  }
}

export function initSentry() {
  if (
    process.env.REACT_APP_SENTRY_URL &&
    process.env.REACT_APP_SENTRY_RELEASE
  ) {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_URL,
      release: process.env.REACT_APP_SENTRY_RELEASE,
      environment: process.env.REACT_APP_SENTRY_ENVIRONMENT || "dev",
      ignoreErrors: ERROR_MESSAGES_TO_FILTER_OUT
    });
  }
}
