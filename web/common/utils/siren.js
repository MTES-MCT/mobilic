export function sirenValidationErrorMessage(siren) {
  if (!siren) {
    return "Veuillez compléter ce champ.";
  }
  if (siren.length !== 9 || !/^\d+$/.test(siren)) {
    return "Ce numéro SIREN n'est pas valide. Le numéro SIREN est composé de 9 chiffres.";
  }

  // The last digit of the 9-digit siren must be the Luhn checksum of the 8 firsts
  // The following implementation is inspired from https://simplycalc.com/luhn-source.php

  let luhnSum = 0;
  for (let i = 8; i >= 0; i--) {
    let digit = parseInt(siren.charAt(i));
    if (i % 2 === 1) {
      digit *= 2;
    }
    if (digit > 9) {
      digit -= 9;
    }
    luhnSum += digit;
  }
  const validSiren = luhnSum % 10 === 0;
  if (!validSiren) {
    return "Ce numéro SIREN n'est pas valide. Vérifiez le numéro auprès de l'entreprise ou de la personne qui vous l'a transmis.";
  }
  return null;
}
