import { API_HOST } from "./api";

export function buildCallbackUrl(employeeInvite, create, isAdmin) {
  let baseUrl = window.location.origin + "/fc-callback";
  let hasQueryString = false;
  if (employeeInvite) {
    baseUrl = baseUrl + `?invite_token=${employeeInvite.inviteToken}`;
    hasQueryString = true;
  }
  if (create) {
    baseUrl =
      baseUrl +
      `${hasQueryString ? "&" : "?"}create=true&next=/signup/user_login`;
    if (isAdmin) {
      baseUrl = baseUrl + "?admin=true";
    }
  }
  return baseUrl;
}

export function buildFranceConnectUrl(redirectUri) {
  return `${API_HOST}/fc/authorize?redirect_uri=${encodeURIComponent(
    redirectUri
  )}`;
}

export function buildFCLogoutUrl(fcToken) {
  return `${API_HOST}/fc/logout?id_token_hint=${fcToken}&post_logout_redirect_uri=${encodeURIComponent(
    window.location.origin + "/logout"
  )}`;
}
