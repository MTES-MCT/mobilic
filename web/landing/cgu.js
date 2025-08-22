import React from "react";
import { LoadingButton } from "common/components/LoadingButton";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import Modal from "../common/Modal";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { ExternalLink } from "../common/ExternalLink";
import Typography from "@mui/material/Typography";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";

export const CGU_EXTERNAL_URL = "https://cgu.mobilic.beta.gouv.fr";
export const CGU_API_EXTERNAL_URL = "https://cgu-api.mobilic.beta.gouv.fr/";

function CGUModal({ open, handleClose, handleAccept, handleReject }) {
  const store = useStoreSyncedWithLocalStorage();
  const [isChecked, setIsChecked] = React.useState(false);

  return (
    <Modal
      size="sm"
      open={open}
      handleClose={handleClose}
      title="Conditions générales d'utilisation"
      content={
        <>
          <Typography sx={{ marginTop: 1 }}>
            Pour créer un compte, vous devez accepter nos{" "}
            <ExternalLink
              url={CGU_EXTERNAL_URL}
              text="conditions générales d’utilisation"
              withIcon
            />
            . Veuillez les lire attentivement avant d'accepter.
          </Typography>
          <Checkbox
            legend=""
            options={[
              {
                label:
                  "En cochant cette case, vous confirmez avoir lu et accepté nos conditions générales d'utilisation",
                nativeInputProps: {
                  checked: isChecked,
                  onChange: e => setIsChecked(e.target.checked)
                }
              }
            ]}
          />
        </>
      }
      actions={
        <>
          {handleReject && (
            <LoadingButton
              priority="secondary"
              onClick={async () => {
                if (handleReject) await handleReject();
                handleClose();
              }}
            >
              Refuser
            </LoadingButton>
          )}
          {!handleReject && (
            <Button priority="secondary" onClick={handleClose}>
              Fermer
            </Button>
          )}
          {handleAccept && (
            <LoadingButton
              onClick={async () => {
                await handleAccept();
                await store.setHasAcceptedCgu();
                handleClose();
              }}
              disabled={!isChecked}
            >
              Accepter
            </LoadingButton>
          )}
        </>
      }
    />
  );
}

export default CGUModal;
