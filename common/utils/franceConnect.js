import { API_HOST } from "./api";

export function buildCallbackUrl(employeeInvite, create, isAdmin) {
  let baseUrl = window.location.origin + "/callback";
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

const ARBITRARY_LARGE_INT = 10000000;

function randomInt() {
  return Math.floor(Math.random() * ARBITRARY_LARGE_INT);
}

export function buildFranceConnectUrl(redirectUri) {
  return `${API_HOST}/fc/authorize?response_type=code&scope=openid given_name family_name email birth_date&client_id=211286433e39cce01db448d80181bdfd005554b19cd51b3fe7943f6b3b86ab6e&nonce=${randomInt()}&state=${randomInt()}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}`;
}
