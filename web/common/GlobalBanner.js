import React from "react";
import { API_HOST } from "common/utils/api";
import { captureSentryException } from "common/utils/sentry";
import Notice from "./Notice";

const ALLOWED_LEVELS = ["info", "warning", "error"];

// Network failures (offline, aborted request) are expected and not worth reporting.
const isNetworkError = err =>
  err?.name === "AbortError" || err instanceof TypeError;

// Globally fetched from a public endpoint so it also shows to logged-out users.
export function GlobalBanner() {
  const [banner, setBanner] = React.useState(null);

  React.useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_HOST}/global-banner`, { signal: controller.signal })
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data?.enabled && data?.message) setBanner(data);
      })
      .catch(err => {
        if (!isNetworkError(err)) captureSentryException(err);
      });
    return () => controller.abort();
  }, []);

  if (!banner) return null;
  const level = ALLOWED_LEVELS.includes(banner.level) ? banner.level : "info";

  return (
    <div role="status" aria-live="polite" style={{ width: "100%" }}>
      <Notice
        type={level}
        isFullWidth
        style={{ padding: "12px 0" }}
        description={banner.message}
      />
    </div>
  );
}
