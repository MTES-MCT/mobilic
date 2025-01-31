import React from "react";
import Typography from "@mui/material/Typography";
import { LoadingButton } from "common/components/LoadingButton";
import TextField from "@mui/material/TextField";
import Modal from "../../common/Modal";
import { Button } from "@codegouvfr/react-dsfr/Button";

export default function BatchInviteModal({
  open,
  handleClose,
  handleSubmit,
  isNewAdmin = false
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

  return (
    <Modal
      open={open}
      handleClose={handleClose}
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

          <TextField
            fullWidth
            label="Adresses email"
            placeholder={`martin.dupond@gmail.com\ncorinne.robert@outlook.fr\n...`}
            multiline
            minRows={10}
            maxRows={15}
            value={text}
            error={tooManyLinesError}
            helperText={
              tooManyLinesError
                ? "Le nombre d'emails ne peut pas dépasser 100. Vous pouvez découper la liste et le faire en plusieurs fois"
                : ""
            }
            onChange={e => setText(e.target.value)}
          />
        </>
      }
      actions={
        <>
          {isNewAdmin && (
            <Button onClick={handleClose} priority="secondary">
              Plus tard
            </Button>
          )}
          <LoadingButton
            disabled={!text || tooManyLinesError}
            onClick={async e => {
              await handleSubmit(parseText(text));
              handleClose();
            }}
          >
            {isNewAdmin ? "Valider" : "Inviter"}
          </LoadingButton>
        </>
      }
    />
  );
}
