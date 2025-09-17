import { API_HOST } from "./api";

export function buildCallbackUrl(employeeInvite, create, isAdmin) {
  let baseUrl = window.location.origin + "/fc-callback";
  const qs = new URLSearchParams(window.location.search);
  const next = qs.get("next");

  const context = create ? "signup" : "login";
  baseUrl = baseUrl + `?context=${context}`;

  if (employeeInvite) {
    baseUrl = baseUrl + `&invite_token=${employeeInvite.inviteToken}`;
  }
  if (next) {
    baseUrl = baseUrl + `&next=${encodeURIComponent(next)}`;
  }
  if (create) {
    const signupNext = "/signup/user_login" + (isAdmin ? "?admin=true" : "");
    baseUrl = baseUrl + `&create=true`;
    const url = new URL(baseUrl);
    url.searchParams.set("next", signupNext);
    baseUrl = url.toString();
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
