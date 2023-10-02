const VALID_EMAIL_RE = /^[a-z0-9._+-]+[@][a-z0-9-]+(\.[a-z0-9-]+)+$/;

export function validateCleanEmailString(cleanString) {
  return VALID_EMAIL_RE.test(cleanString);
}

export function cleanEmailString(string) {
  return string.toLowerCase().replace(/\s/g, "");
}

export function isStringLengthValid(string, maxLength) {
  return string.length > 0 && string.length <= maxLength;
}
