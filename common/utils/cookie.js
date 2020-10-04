export function readCookie(name) {
  const cookieEntry = document.cookie.match(
    "(^|;)\\s*" + name + "\\s*=\\s*([^;]+)"
  );
  return cookieEntry ? cookieEntry.pop() : null;
}
