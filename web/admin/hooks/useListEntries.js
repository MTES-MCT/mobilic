import React from "react";
import { validateCleanEmailString } from "common/utils/validation";

const SEPARATORS_REGEX = /[,;\n ]/;
const MAX_ENTRIES = 100;

function isValidMobilicId(value) {
  return /^\d+$/.test(value) && parseInt(value, 10) > 0;
}

function isValidEntry(value) {
  return validateCleanEmailString(value) || isValidMobilicId(value);
}

function defaultNormalize(token) {
  if (isValidMobilicId(token)) {
    return { type: "id", value: token };
  }
  return { type: "email", value: token.toLowerCase() };
}

const DEFAULT_VALIDATION_ERROR =
  "Le format saisi n'est pas valide. Saisissez une adresse e-mail (prenom.nom@domaine.fr) ou un identifiant Mobilic (nombre entier).";

export default function useListEntries({
  validationFn = isValidEntry,
  normalizeFn = defaultNormalize,
  validationErrorMessage = DEFAULT_VALIDATION_ERROR,
  separatorsRegex = SEPARATORS_REGEX,
} = {}) {
  const [entries, setEntries] = React.useState([]);
  const [text, setText] = React.useState("");
  const [hasValidated, setHasValidated] = React.useState(false);
  const [tooManyEntriesInPastedText, setTooManyEntriesInPastedText] =
    React.useState(false);

  function parseText(t, ignoreLast = true) {
    const tokens = t.split(separatorsRegex);
    if (!ignoreLast || tokens.length > 1) {
      setHasValidated(true);
    }
    const { valid, invalid } = tokens
      .map((token) => token.trim())
      .reduce(
        (acc, token, index) => {
          if (!token) return acc;
          const shouldSkipLast = ignoreLast && index === tokens.length - 1;
          if (validationFn(token) && !shouldSkipLast) {
            acc.valid.push(normalizeFn(token));
          } else {
            acc.invalid.push(token);
          }
          return acc;
        },
        { valid: [], invalid: [] },
      );
    const existingValues = new Set(entries.map((e) => e.value));
    const newEntries = valid.filter((e) => !existingValues.has(e.value));
    const combined = [...entries, ...newEntries].slice(0, MAX_ENTRIES);
    setEntries(combined);
    setText(invalid.filter((e) => !!e).join("\n"));
  }

  const countItemsInText = (t) => {
    return t.split(separatorsRegex).length;
  };

  React.useEffect(() => {
    if (!text) {
      setHasValidated(false);
    }
  }, [text]);

  const isTextInvalid = React.useMemo(
    () => text && !validationFn(text),
    [text, validationFn],
  );

  React.useEffect(() => setTooManyEntriesInPastedText(false), [text]);

  const tooManyEntries = React.useMemo(
    () => entries.length >= MAX_ENTRIES,
    [entries],
  );

  const removeEntry = (value) => {
    setEntries((current) => current.filter((e) => e.value !== value));
  };

  const isError = React.useMemo(
    () =>
      (hasValidated && isTextInvalid) ||
      tooManyEntries ||
      tooManyEntriesInPastedText,
    [isTextInvalid, tooManyEntries, hasValidated, tooManyEntriesInPastedText],
  );

  const errorMessage = React.useMemo(
    () =>
      isTextInvalid && hasValidated
        ? validationErrorMessage
        : tooManyEntries || tooManyEntriesInPastedText
          ? `Le nombre d'entrées ne peut dépasser ${MAX_ENTRIES}. Veuillez découper la liste et procéder en plusieurs fois.`
          : "",
    [
      isTextInvalid,
      tooManyEntries,
      hasValidated,
      tooManyEntriesInPastedText,
      validationErrorMessage,
    ],
  );

  const handlePaste = (e) => {
    e.preventDefault();
    setTooManyEntriesInPastedText(false);
    const pastedText = e.clipboardData.getData("text");
    const nbNewEntries = countItemsInText(pastedText);
    if (nbNewEntries + entries.length > MAX_ENTRIES) {
      setTooManyEntriesInPastedText(true);
      return;
    }
    parseText(pastedText, false);
  };

  function finalizeEntries() {
    let finalEntries = [...entries];
    if (text) {
      const tokens = text
        .split(separatorsRegex)
        .map((t) => t.trim())
        .filter(Boolean);
      if (!tokens.every(validationFn)) {
        parseText(text, false);
        setHasValidated(true);
        return null;
      }
      const seen = new Set(finalEntries.map((en) => en.value));
      for (const t of tokens) {
        const normalized = normalizeFn(t);
        if (!seen.has(normalized.value)) {
          seen.add(normalized.value);
          finalEntries.push(normalized);
        }
      }
      finalEntries = finalEntries.slice(0, MAX_ENTRIES);
      setEntries(finalEntries);
      setText("");
    }
    return finalEntries;
  }

  function replaceEntries(values) {
    setEntries(values.map(normalizeFn));
    setText("");
  }

  function reset() {
    setEntries([]);
    setText("");
    setHasValidated(false);
    setTooManyEntriesInPastedText(false);
  }

  return {
    entries,
    text,
    parseText,
    handlePaste,
    removeEntry,
    isError,
    errorMessage,
    tooManyEntries,
    finalizeEntries,
    replaceEntries,
    reset,
  };
}
