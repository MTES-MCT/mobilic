import React from "react";
import Typography from "@mui/material/Typography";
import { LoadingButton } from "common/components/LoadingButton";
import Modal from "../../common/Modal";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "../../common/forms/Input";

export default function BatchInviteModal({
  open,
  handleClose,
  handleSubmit,
  isNewAdmin = false,
  onClose
}) {
  const [text, setText] = React.useState("");
  const [tooManyLinesError, setTooManyLinesError] = React.useState(false);

  function parseText(t) {
    return t
      .split("\n")
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  React.useEffect(() => {
    if (parseText(text).length > 100) setTooManyLinesError(true);
    else setTooManyLinesError(false);
  }, [text]);

  const _handleClose = () => {
    if (onClose) {
      onClose();
    }
    handleClose();
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
                Ajoutez les adresses e-mail de vos salariés ci-dessous. Ils
                recevront un e-mail pour créer un compte.
              </p>
              <p>
                Une fois le compte créé, ils seront rattachés à votre entreprise
                et pourront commencer à enregistrer du temps de travail.
              </p>
            </>
          ) : (
            <Typography gutterBottom>
              Vous pouvez inviter d'un coup plusieurs salariés en copiant
              ci-dessous leur adresse mail. Chaque adresse doit figurer sur une
              nouvelle ligne.
            </Typography>
          )}
          <Input
            label="Adresses e-mail"
            hintText="Invitez plusieurs salariés d'un coup en séparant les adresses e-mail par des virgules."
            textArea
            state={tooManyLinesError ? "error" : "default"}
            stateRelatedMessage={
              tooManyLinesError
                ? "Le nombre d'emails ne peut pas dépasser 100. Vous pouvez découper la liste et le faire en plusieurs fois"
                : ""
            }
            nativeTextAreaProps={{
              onChange: e => setText(e.target.value),
              value: text
            }}
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
            disabled={!text || tooManyLinesError}
            onClick={async e => {
              await handleSubmit(parseText(text));
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
