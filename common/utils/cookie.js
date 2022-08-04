export function readCookie(name) {
  const cookieEntry = document.cookie.match(
    "(^|;)\\s*" + name + "\\s*=\\s*([^;]+)"
  );
  return cookieEntry ? cookieEntry.pop() : null;
}

export function currentUserId() {
  return parseInt(readCookie("userId")) || null;
}

export function currentControllerId() {
  return parseInt(readCookie("controllerId")) || null;
}

export function clearUserIdCookie() {
  document.cookie = "userId=;";
}

export function clearControllerIdCookie() {
  document.cookie = "controllerId=;";
}
