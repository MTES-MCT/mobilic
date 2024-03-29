import TextField from "@mui/material/TextField";
import React from "react";

function validateSirenString(string) {
  if (!string) return true;
  if (string.length !== 9) return false;
  if (!/^\d+$/.test(string)) return false;

  // The last digit of the 9-digit siren must be the Luhn checksum of the 8 firsts
  // The following implementation is inspired from https://simplycalc.com/luhn-source.php

  let luhnSum = 0;
  for (let i = 8; i >= 0; i--) {
    let digit = parseInt(string.charAt(i));
    if (i % 2 === 1) {
      digit *= 2;
    }
    if (digit > 9) {
      digit -= 9;
    }
    luhnSum += digit;
  }
  return luhnSum % 10 === 0;
}

export function SirenInputField({
  siren,
  setSiren,
  error,
  setError,
  className
}) {
  return (
    <TextField
      error={error}
      required
      className={className}
      variant="standard"
      label="SIREN"
      placeholder="123456789"
      helperText={error ? "L'entrée n'est pas un numéro de SIREN valide" : ""}
      value={siren}
      onChange={e => {
        const newSirenValue = e.target.value.replace(/\s/g, "");
        setSiren(newSirenValue);
        setError(!validateSirenString(newSirenValue));
      }}
    />
  );
}
