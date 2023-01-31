export function readCookie(name) {
  const cookieEntry = document.cookie.match(
    "(^|;)\\s*" + name + "\\s*=\\s*([^;]+)"
  );
  return cookieEntry ? cookieEntry.pop() : null;
}

export function clearCookie(name) {
  document.cookie = `${name}=;secure;`;
}

export function setCookie(name, value, isRootPath = false) {
  document.cookie = `${name}=${value}${isRootPath ? ";path=/;" : ""}`;
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
