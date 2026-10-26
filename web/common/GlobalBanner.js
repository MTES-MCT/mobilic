import React from "react";
import { API_HOST } from "common/utils/api";
import { captureSentryException } from "common/utils/sentry";
import Notice from "./Notice";

// Globally fetched from a public endpoint so it also shows to logged-out users.
export function GlobalBanner() {
  const [banner, setBanner] = React.useState(null);

  React.useEffect(() => {
    fetch(`${API_HOST}/global-banner`)
      .then(res => res.json())
      .then(data => {
        if (data?.enabled && data?.message) setBanner(data);
      })
      .catch(captureSentryException);
  }, []);

  if (!banner) return null;

  return (
    <div role="status" aria-live="polite" style={{ width: "100%" }}>
      <Notice
        type={banner.level}
        isFullWidth
        style={{ padding: "12px 0" }}
        description={banner.message}
      />
    </div>
  );
}
