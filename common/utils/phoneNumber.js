import { parsePhoneNumber } from "libphonenumber-js";

export const formatPhoneNumber = isoPhoneNumber => {
  const parsedNumber = parsePhoneNumber(isoPhoneNumber);
  return parsedNumber.formatNational();
};
