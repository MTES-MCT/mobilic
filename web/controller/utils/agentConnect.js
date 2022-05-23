import { API_HOST } from "common/utils/api";

export function buildAgentConnectCallbackUrl() {
  return window.location.origin + "/ac-callback";
}

export function buildAgentConnectUrl(redirectUri) {
  return `${API_HOST}/ac/authorize?redirect_uri=${encodeURIComponent(
    redirectUri
  )}`;
}
