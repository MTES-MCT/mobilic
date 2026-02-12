export function readCookie(name) {
  const cookieEntry = document.cookie.match(
    "(^|;)\\s*" + name + "\\s*=\\s*([^;]+)"
  );
  return cookieEntry ? cookieEntry.pop() : null;
}

export function clearCookie(name, isRootPath = false) {
  setCookie(name, "", -1, isRootPath);
}

export function setCookie(name, value, expirationDays = null, isRootPath = false) {
  let cookie = `${name}=${value};secure`;
  if (expirationDays) {
    const maxAge = expirationDays * 24 * 60 * 60;
    cookie += `;max-age=${maxAge}`;
  }
  if (isRootPath) {
    cookie += ";path=/";
  }
  document.cookie = cookie;
}

export function currentUserId() {
  return parseInt(readCookie("userId")) || null;
}

export function currentControllerId() {
  return parseInt(readCookie("controllerId")) || null;
}

export function clearUserIdCookie() {
  document.cookie = "userId=;secure;";
}

export function clearControllerIdCookie() {
  document.cookie = "controllerId=;secure;";
}

export function hasGoogleAdsConsent() {
  const axeptioData = readCookie("axeptio_authorized_vendors");
  if (!axeptioData) return false;
  return axeptioData.includes("google_ads");
}
