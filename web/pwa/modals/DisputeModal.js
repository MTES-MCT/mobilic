import React from "react";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Modal from "../../common/Modal";

export default function DisputeModal({
  open,
  handleClose,
  handleSubmit
}) {
  const [text, setText] = React.useState("");

  React.useEffect(() => setText(""), [open]);

  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title="Contester la modification"
      size="sm"
      content={
        <Input
          label="Indiquez la raison de votre désaccord :"
          textArea
          nativeTextAreaProps={{
            value: text,
            onChange: e => setText(e.target.value),
            placeholder: "J'ai commencé plus tôt que l'heure indiquée",
            rows: 3
          }}
        />
      }
      actions={
        <>
          <Button
            priority="secondary"
            onClick={handleClose}
          >
            Annuler
          </Button>
          <Button
            onClick={async () => {
              await handleSubmit(text.trim());
              handleClose();
            }}
            disabled={!text.trim()}
          >
            Envoyer
          </Button>
        </>
      }
    />
  );
}
