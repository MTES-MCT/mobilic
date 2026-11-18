import React from "react";
import { API_HOST } from "common/utils/api";
import { captureSentryException } from "common/utils/sentry";
import Notice from "./Notice";

const ALLOWED_LEVELS = new Set(["info", "warning", "error"]);

const isNetworkError = err => err instanceof TypeError;

const BANNER_CACHE_TTL_MS = 5 * 60 * 1000;

let bannerPromise = null;
let bannerFetchedAt = 0;

const fetchBanner = () => {
  if (!bannerPromise || Date.now() - bannerFetchedAt > BANNER_CACHE_TTL_MS) {
    bannerFetchedAt = Date.now();
    bannerPromise = fetch(`${API_HOST}/global-banner`)
      .then(res => (res.ok ? res.json() : null))
      .catch(err => {
        if (!isNetworkError(err)) captureSentryException(err);
        return null;
      });
  }
  return bannerPromise;
};

export function GlobalBanner() {
  const [banner, setBanner] = React.useState(null);

  React.useEffect(() => {
    fetchBanner().then(data => {
      if (data?.enabled && data?.message) setBanner(data);
    });
  }, []);

  if (!banner) return null;
  const level = ALLOWED_LEVELS.has(banner.level) ? banner.level : "info";

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
