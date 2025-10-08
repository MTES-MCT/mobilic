const LICENSE_FORMAT = {
  YEAR_LENGTH: 4,
  DEPT_LENGTH: 2,
  NUMBER_LENGTH: 7,
  YEAR_END_POS: 4,
  DEPT_END_POS: 7,
  SEPARATOR: "/",
  PATTERN: /^\d{4}\/\d{2}\/\d{7}$/,
  PLACEHOLDER: "aaaa/xx/xxxxxxx",
  EXAMPLE: "2023/84/0002112"
};

const MAX_DIGITS =
  LICENSE_FORMAT.YEAR_LENGTH +
  LICENSE_FORMAT.DEPT_LENGTH +
  LICENSE_FORMAT.NUMBER_LENGTH;

export function formatLicenseNumber(value, previousValue = "") {
  let cleanValue = value.replace(/[^\d/]/g, "");

  const isDeleting = value.length < previousValue.length;
  if (isDeleting) return cleanValue;

  cleanValue = cleanValue.replace(/\//g, "").substring(0, MAX_DIGITS);

  if (cleanValue.length > LICENSE_FORMAT.YEAR_END_POS) {
    cleanValue =
      cleanValue.slice(0, LICENSE_FORMAT.YEAR_END_POS) +
      LICENSE_FORMAT.SEPARATOR +
      cleanValue.slice(LICENSE_FORMAT.YEAR_END_POS);
  }

  if (cleanValue.length > LICENSE_FORMAT.DEPT_END_POS) {
    cleanValue =
      cleanValue.slice(0, LICENSE_FORMAT.DEPT_END_POS) +
      LICENSE_FORMAT.SEPARATOR +
      cleanValue.slice(LICENSE_FORMAT.DEPT_END_POS);
  }

  return cleanValue;
}

export function validateLicenseFormat(value) {
  if (!value) return false;
  return LICENSE_FORMAT.PATTERN.test(value);
}

export function parseLicenseNumber(value) {
  if (!value) return null;

  const parts = value.split(LICENSE_FORMAT.SEPARATOR);
  if (parts.length !== 3) return null;

  return {
    year: parts[0],
    department: parts[1],
    number: parts[2]
  };
}

export function getLicensePlaceholder() {
  return LICENSE_FORMAT.PLACEHOLDER;
}

export function getLicenseExample() {
  return LICENSE_FORMAT.EXAMPLE;
}
