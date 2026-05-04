import React from "react";
import { LoadingButton } from "common/components/LoadingButton";
import Modal from "../../common/Modal";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "../../common/forms/Input";
import { validateCleanEmailString } from "common/utils/validation";
import { TagsGroup } from "@codegouvfr/react-dsfr/TagsGroup";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import { BATCH_INVITE_MODAL_SUBMIT } from "common/utils/matomoTags";

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

export default function BatchInviteModal({
  open,
  handleClose,
  handleSubmit,
  isNewAdmin = false,
  title = "",
  description = "",
  inputLabel = "Adresses e-mail ou identifiants Mobilic",
  inputHintText = "Saisissez des adresses e-mail (prenom.nom@domaine.fr) ou des identifiants Mobilic (nombres entiers), séparés par un espace, une virgule ou un point-virgule.",
  acceptButtonTitle = "",
  onClose,
  validationFn = isValidEntry,
  normalizeFn = defaultNormalize,
  validationErrorMessage = DEFAULT_VALIDATION_ERROR,
  placeholder = "",
  separatorsRegex = SEPARATORS_REGEX,
  trackingEventFn = BATCH_INVITE_MODAL_SUBMIT,
  parseOnInput = true
}) {
  const { trackEvent } = useMatomo();
  const [entries, setEntries] = React.useState([]);
  const [text, setText] = React.useState("");
  const [hasValidated, setHasValidated] = React.useState(false);
  const [
    tooManyEntriesInPastedText,
    setTooManyEntriesInPastedText
  ] = React.useState(false);

  function parseText(t, ignoreLast = true) {
    const tokens = t.split(separatorsRegex);
    if (!ignoreLast || tokens.length > 1) {
      setHasValidated(true);
    }
    const { valid, invalid } = tokens
      .map(token => token.trim())
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
        { valid: [], invalid: [] }
      );
    const existingValues = new Set(entries.map(e => e.value));
    const newEntries = valid.filter(e => !existingValues.has(e.value));
    const combined = [...entries, ...newEntries].slice(0, MAX_ENTRIES);
    setEntries(combined);
    setText(invalid.filter(e => !!e).join("\n"));
  }

  const countItemsInText = t => {
    return t.split(separatorsRegex).length;
  };

  React.useEffect(() => {
    if (!text) {
      setHasValidated(false);
    }
  }, [text]);

  const isTextInvalid = React.useMemo(
    () => text && !validationFn(text),
    [text, validationFn]
  );

  const handleTextChange = parseOnInput
    ? e => parseText(e.target.value)
    : e => setText(e.target.value);

  React.useEffect(() => setTooManyEntriesInPastedText(false), [text]);

  const tooManyEntries = React.useMemo(
    () => entries.length >= MAX_ENTRIES,
    [entries]
  );

  const _handleClose = () => {
    if (onClose) {
      onClose();
    }
    handleClose();
  };

  const removeEntry = value => {
    setEntries(current => current.filter(e => e.value !== value));
  };

  const isError = React.useMemo(
    () =>
      (hasValidated && isTextInvalid) ||
      tooManyEntries ||
      tooManyEntriesInPastedText,
    [isTextInvalid, tooManyEntries, hasValidated, tooManyEntriesInPastedText]
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
      validationErrorMessage
    ]
  );

  return (
    <Modal
      open={open}
      handleClose={_handleClose}
      title={
        title ||
        (isNewAdmin
          ? "Invitez vos salariés sur Mobilic !"
          : "Inviter une liste d'emails ou d'identifiants")
      }
      content={
        <>
          {description ||
            (isNewAdmin ? (
              <>
                <p>
                  Invitez plusieurs salariés en une fois en renseignant leur
                  adresse e-mail ou identifiant Mobilic, ou en copiant une
                  liste dans l'encadré ci-dessous.
                </p>
                <p>
                  Une fois le compte créé, ils seront rattachés à votre
                  entreprise et pourront commencer à enregistrer du temps de
                  travail.
                </p>
              </>
            ) : (
              <p>
                Invitez plusieurs salariés en une fois en renseignant leur
                adresse e-mail ou identifiant Mobilic, ou en copiant une
                liste dans l'encadré ci-dessous.
              </p>
            ))}
          <Input
            label={inputLabel}
            hintText={inputHintText}
            textArea
            state={isError ? "error" : "default"}
            stateRelatedMessage={errorMessage}
            nativeTextAreaProps={{
              onChange: handleTextChange,
              onBlur: e => {
                parseText(e.target.value, false);
              },
              onPaste: e => {
                e.preventDefault();
                setTooManyEntriesInPastedText(false);
                const pastedText = e.clipboardData.getData("text");
                const nbNewEntries = countItemsInText(pastedText);
                if (nbNewEntries + entries.length > MAX_ENTRIES) {
                  setTooManyEntriesInPastedText(true);
                  return;
                }
                parseText(pastedText, false);
              },
              value: text,
              ...(placeholder && { placeholder })
            }}
            disabled={tooManyEntries}
          />
          <TagsGroup
            tags={entries.map(entry => ({
              children:
                entry.type === "id"
                  ? `ID: ${entry.value}`
                  : entry.value,
              dismissible: true,
              nativeButtonProps: {
                onClick: () => removeEntry(entry.value),
                "aria-label": `Retirer ${entry.value}`
              }
            }))}
          />
        </>
      }
      actions={
        <>
          {isNewAdmin && (
            <Button onClick={_handleClose} priority="secondary">
              Plus tard
            </Button>
          )}
          <LoadingButton
            disabled={entries.length === 0 && !text.trim()}
            onClick={async e => {
              let finalEntries = [...entries];

              if (text) {
                const tokens = text
                  .split(separatorsRegex)
                  .map(t => t.trim())
                  .filter(Boolean);
                if (!tokens.every(validationFn)) {
                  parseText(text, false);
                  setHasValidated(true);
                  return;
                }
                const seen = new Set(finalEntries.map(en => en.value));
                for (const t of tokens) {
                  const normalized = normalizeFn(t);
                  if (!seen.has(normalized.value)) {
                    seen.add(normalized.value);
                    finalEntries.push(normalized);
                  }
                }
                finalEntries = finalEntries.slice(0, MAX_ENTRIES);
              }

              const allValues = finalEntries.map(en => en.value);
              const emails = finalEntries
                .filter(en => en.type === "email")
                .map(en => en.value);
              const userIds = finalEntries
                .filter(en => en.type === "id")
                .map(en => parseInt(en.value, 10));

              trackEvent(trackingEventFn(allValues.length));
              const result = await handleSubmit({ entries: allValues, emails, userIds });
              if (result?.failedEntries?.length > 0) {
                setEntries(result.failedEntries.map(v => normalizeFn(v)));
                setText("");
                return;
              }
              _handleClose();
            }}
          >
            {acceptButtonTitle || (isNewAdmin ? "Valider" : "Inviter")}
          </LoadingButton>
        </>
      }
    />
  );
}
