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
  onClose
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
    const tokens = t.split(SEPARATORS_REGEX);
    if (!ignoreLast || tokens.length > 1) {
      setHasValidated(true);
    }
    const { valid, invalid } = tokens
      .map(token => token.trim())
      .reduce(
        (acc, token, index) => {
          if (!token) return acc;
          const shouldSkipLast = ignoreLast && index === tokens.length - 1;
          if (isValidEntry(token) && !shouldSkipLast) {
            const normalized = isValidMobilicId(token)
              ? token
              : token.toLowerCase();
            acc.valid.push(normalized);
          } else {
            acc.invalid.push(token);
          }
          return acc;
        },
        { valid: [], invalid: [] }
      );
    const existingValues = new Set(entries.map(e => e.value));
    const newEntries = valid
      .filter(v => !existingValues.has(v))
      .map(v =>
        isValidMobilicId(v)
          ? { type: "id", value: v }
          : { type: "email", value: v }
      );
    const combined = [...entries, ...newEntries].slice(0, MAX_ENTRIES);
    setEntries(combined);
    setText(invalid.filter(e => !!e).join("\n"));
  }

  const countItemsInText = t => {
    return t.split(SEPARATORS_REGEX).length;
  };

  React.useEffect(() => {
    if (!text) {
      setHasValidated(false);
    }
  }, [text]);

  const isTextInvalid = React.useMemo(
    () => text && !isValidEntry(text),
    [text]
  );

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
        ? "Le format saisi n'est pas valide. Saisissez une adresse e-mail (prenom.nom@domaine.fr) ou un identifiant Mobilic (nombre entier)."
        : tooManyEntries || tooManyEntriesInPastedText
        ? `Le nombre d'entrées ne peut dépasser ${MAX_ENTRIES}. Veuillez découper la liste et procéder en plusieurs fois.`
        : "",
    [isTextInvalid, tooManyEntries, hasValidated, tooManyEntriesInPastedText]
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
              onChange: e => {
                parseText(e.target.value);
              },
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
              value: text
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
            disabled={entries.length === 0}
            onClick={async e => {
              let finalEntries = [...entries];

              if (text) {
                if (!isValidEntry(text)) {
                  setHasValidated(true);
                  return;
                }
                const normalized = isValidMobilicId(text)
                  ? text
                  : text.toLowerCase();
                const existingValues = new Set(
                  finalEntries.map(en => en.value)
                );
                if (!existingValues.has(normalized)) {
                  finalEntries.push(
                    isValidMobilicId(text)
                      ? { type: "id", value: normalized }
                      : { type: "email", value: normalized }
                  );
                }
              }

              const emails = finalEntries
                .filter(en => en.type === "email")
                .map(en => en.value);
              const userIds = finalEntries
                .filter(en => en.type === "id")
                .map(en => parseInt(en.value, 10));

              trackEvent(
                BATCH_INVITE_MODAL_SUBMIT(emails.length + userIds.length)
              );
              await handleSubmit({ emails, userIds });
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
