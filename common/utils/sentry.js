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
  "La connexion réseau a été perdue."
];

export function captureSentryException(err, context) {
  if (
    !isConnectionError(err) &&
    !ERROR_NAMES_TO_FILTER_OUT.includes(err.name) &&
    !ERROR_MESSAGES_TO_FILTER_OUT.includes(err.message)
  ) {
    let loggedError = err;
    if (err.networkError) loggedError = err.networkError;
    if (loggedError.name === "ServerParseError")
      loggedError.message = "Could not parse JSON";
    Sentry.captureException(loggedError, context);
  }
}
