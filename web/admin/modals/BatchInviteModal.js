import React from "react";
import { LoadingButton } from "common/components/LoadingButton";
import Modal from "../../common/Modal";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "../../common/forms/Input";
import { validateCleanEmailString } from "common/utils/validation";
import { TagsGroup } from "@codegouvfr/react-dsfr/TagsGroup";

const SEPARATORS_REGEX = /[,;\n ]/;
const MAX_EMAILS = 100;

export default function BatchInviteModal({
  open,
  handleClose,
  handleSubmit,
  isNewAdmin = false,
  title = "",
  description = "",
  acceptButtonTitle = "",
  onClose
}) {
  const [emails, setEmails] = React.useState([]);
  const [text, setText] = React.useState("");
  // use this variable to check if user has tried to validate input by pressing space for example
  const [hasValidated, setHasValidated] = React.useState(false);
  const [
    tooManyEmailsInPastedText,
    setTooManyEmailsInPastedText
  ] = React.useState(false);

  function parseText(t, ignoreLast = true) {
    const newEmails = t.split(SEPARATORS_REGEX);
    if (!ignoreLast || newEmails.length > 1) {
      setHasValidated(true);
    }
    const { valid, invalid } = newEmails
      .map(email => email.toLowerCase())
      .reduce(
        (acc, email, index) => {
          const isValid = validateCleanEmailString(email);
          // we don't want to take the last item because the user is probably not done writing
          if (isValid && (!ignoreLast || index < newEmails.length - 1)) {
            acc.valid.push(email);
          } else {
            acc.invalid.push(email);
          }
          return acc;
        },
        { valid: [], invalid: [] }
      );
    const uniqueValidEmails = [...new Set([...emails, ...valid])];
    setEmails(uniqueValidEmails.slice(0, MAX_EMAILS));
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
  const isTextInvalidEmail = React.useMemo(
    () => text && !validateCleanEmailString(text),
    [text]
  );

  React.useEffect(() => setTooManyEmailsInPastedText(false), [text]);

  const tooManyEmails = React.useMemo(() => emails.length >= MAX_EMAILS, [
    emails
  ]);

  const _handleClose = () => {
    if (onClose) {
      onClose();
    }
    handleClose();
  };

  const removeEmail = email => {
    setEmails(currentEmails => currentEmails.filter(e => e !== email));
  };

  const isError = React.useMemo(
    () =>
      (hasValidated && isTextInvalidEmail) ||
      tooManyEmails ||
      tooManyEmailsInPastedText,
    [isTextInvalidEmail, tooManyEmails, hasValidated, tooManyEmailsInPastedText]
  );
  const errorMessage = React.useMemo(
    () =>
      isTextInvalidEmail && hasValidated
        ? "Le format de l'adresse saisie n'est pas valide. Le format attendu est prenom.nom@domaine.fr."
        : tooManyEmails || tooManyEmailsInPastedText
        ? `Le nombre d’e-mails ne peut dépasser ${MAX_EMAILS}. Veuillez découper la liste et procéder en plusieurs fois.`
        : "",
    [isTextInvalidEmail, tooManyEmails, hasValidated, tooManyEmailsInPastedText]
  );

  return (
    <Modal
      open={open}
      handleClose={_handleClose}
      title={
        title ||
        (isNewAdmin
          ? "Invitez vos salariés sur Mobilic !"
          : "Inviter une liste d'emails")
      }
      content={
        <>
          {description ||
            (isNewAdmin ? (
              <>
                <p>
                  Invitez plusieurs salariés en une fois en renseignant leur
                  adresse e-mail ou en copiant une liste dans l’encadré
                  ci-dessous.
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
                adresse e-mail ou en copiant une liste dans l’encadré
                ci-dessous.
              </p>
            ))}
          <Input
            label="Adresses e-mail"
            hintText="Exemple de format attendu : prenom.nom@domaine.fr. Les adresses doivent être séparées par un espace."
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
                setTooManyEmailsInPastedText(false);
                const pastedText = e.clipboardData.getData("text");
                const nbNewEmails = countItemsInText(pastedText);
                if (nbNewEmails + emails.length > MAX_EMAILS) {
                  setTooManyEmailsInPastedText(true);
                  return;
                }
                parseText(pastedText, false);
              },
              value: text
            }}
            disabled={tooManyEmails}
          />
          <TagsGroup
            tags={emails.map(email => ({
              children: email,
              dismissible: true,
              nativeButtonProps: {
                onClick: () => removeEmail(email),
                "aria-label": `Retirer ${email}`
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
            disabled={emails.length === 0}
            onClick={async e => {
              if (text) {
                if (!validateCleanEmailString(text)) {
                  setHasValidated(true);
                  return;
                }
                await handleSubmit([...new Set([...emails, text])]);
              } else {
                await handleSubmit(emails);
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
