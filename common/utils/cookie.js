export function readCookie(name) {
  const cookieEntry = document.cookie.match(
    "(^|;)\\s*" + name + "\\s*=\\s*([^;]+)"
  );
  return cookieEntry ? cookieEntry.pop() : null;
}

export function currentUserId() {
  return parseInt(readCookie("userId")) || null;
}
