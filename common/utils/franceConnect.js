import { API_HOST } from "./api";

export function buildCallbackUrl(employeeInvite, create, isAdmin) {
  let baseUrl = window.location.origin + "/fc-callback";
  const qs = new URLSearchParams(window.location.search);
  const next = qs.get("next");
  let hasQueryString = false;
  if (employeeInvite) {
    baseUrl = baseUrl + `?invite_token=${employeeInvite.inviteToken}`;
    hasQueryString = true;
  }
  if (next) {
    baseUrl =
      baseUrl + `${hasQueryString ? "&" : "?"}next=${encodeURIComponent(next)}`;
    hasQueryString = true;
  }
  if (create) {
    baseUrl =
      baseUrl +
      `${hasQueryString ? "&" : "?"}create=true&next=${encodeURIComponent(
        "/signup/user_login" + (isAdmin ? "?admin=true" : "")
      )}`;
  }
  return baseUrl;
}

export function buildFranceConnectUrl(redirectUri) {
  return `${API_HOST}/fc/authorize?redirect_uri=${encodeURIComponent(
    redirectUri
  )}`;
}

export function buildFCLogoutUrl(redirectPath = "/logout") {
  return `${API_HOST}/fc/logout?post_logout_redirect_uri=${encodeURIComponent(
    window.location.origin + redirectPath
  )}`;
}
