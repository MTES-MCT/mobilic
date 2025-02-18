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
  onClose
}) {
  const [emails, setEmails] = React.useState([]);
  const [text, setText] = React.useState("");

  function parseText(t, ignoreLast = true) {
    const newEmails = t.split(SEPARATORS_REGEX);
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
    setText(
      [...invalid, ...uniqueValidEmails.slice(MAX_EMAILS)]
        .filter(e => !!e)
        .join("\n")
    );
  }

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

  return (
    <Modal
      open={open}
      handleClose={_handleClose}
      title={
        isNewAdmin
          ? "Invitez vos salariés sur Mobilic !"
          : "Inviter une liste d'emails"
      }
      content={
        <>
          {isNewAdmin ? (
            <>
              <p>
                Invitez plusieurs salariés en une fois en renseignant leur
                adresse e-mail ou en copiant une liste dans l’encadré
                ci-dessous.
              </p>
              <p>
                Une fois le compte créé, ils seront rattachés à votre entreprise
                et pourront commencer à enregistrer du temps de travail.
              </p>
            </>
          ) : (
            <p>
              Invitez plusieurs salariés en une fois en renseignant leur adresse
              e-mail ou en copiant une liste dans l’encadré ci-dessous.
            </p>
          )}
          <Input
            label="Adresses e-mail"
            hintText="Exemple de format attendu : prenom.nom@domaine.fr. Les adresses doivent être séparées par un espace."
            textArea
            state={tooManyEmails ? "error" : "default"}
            stateRelatedMessage={
              tooManyEmails
                ? `Le nombre d’e-mails ne peut dépasser ${MAX_EMAILS}. Veuillez découper la liste et procéder en plusieurs fois.`
                : ""
            }
            nativeTextAreaProps={{
              onChange: e => {
                parseText(e.target.value);
              },
              onBlur: e => {
                parseText(e.target.value, false);
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
              await handleSubmit(emails);
              _handleClose();
            }}
          >
            {isNewAdmin ? "Valider" : "Inviter"}
          </LoadingButton>
        </>
      }
    />
  );
}
