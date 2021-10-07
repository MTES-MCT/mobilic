import * as Sentry from "@sentry/browser";
import { isConnectionError } from "./errors";

const ERROR_NAMES_TO_FILTER_OUT = [
  "NetworkError",
  "WrongStatusError",
  "AbortError",
  "TimeoutError",
  "RefreshTokenError"
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
    Sentry.captureException(err, context);
  }
}
