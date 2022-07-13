import { API_HOST } from "common/utils/api";

export function buildAgentConnectCallbackUrl() {
  return window.location.origin + "/ac-callback";
}

export function buildAgentConnectUrl(redirectUri) {
  return `${API_HOST}/ac/authorize?redirect_uri=${encodeURIComponent(
    redirectUri
  )}`;
}

export function buildAgentConnectLogoutUrl(redirectPath = "/logout") {
  return `${API_HOST}/ac/logout?post_logout_redirect_uri=${encodeURIComponent(
    window.location.origin + redirectPath
  )}`;
}
