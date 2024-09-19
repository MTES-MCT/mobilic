import React from "react";
import { Typography } from "@mui/material";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { ExternalLink } from "../../common/ExternalLink";
import Modal, { modalStyles } from "../../common/Modal";
import { useCgu } from "../../common/useCgu";

export default function AcceptCguModal({ onAccept, onReject, handleClose }) {
  const { acceptCgu, rejectCgu } = useCgu();
  const classes = modalStyles();
  const [isChecked, setIsChecked] = React.useState(false);
  const [hasTurnedDown, setHasTurnedDown] = React.useState(false);

  const _onAccept = async () => {
    await acceptCgu();
    onAccept();
  };
  const _onReject = async () => {
    await rejectCgu();
    onReject();
  };
  const title = React.useMemo(
    () =>
      hasTurnedDown ? (
        <>
          <span
            className={`fr-icon-warning-fill ${classes.warningIcon}`}
            aria-hidden="true"
          ></span>
          Votre compte va être supprimé
        </>
      ) : (
        "Mise à jour des conditions générales d'utilisation"
      ),
    [hasTurnedDown]
  );
  const content = React.useMemo(
    () => (
      <>
        <Typography>
          <>
            {hasTurnedDown
              ? "Votre compte Mobilic sera supprimé car vous n’avez pas accepté les"
              : "Nous avons récemment changé nos"}{" "}
            <ExternalLink
              url={"https://cgu.mobilic.beta.gouv.fr"}
              text={"conditions générales d'utilisation"}
            />
            .
          </>
        </Typography>
        <Typography sx={{ marginTop: 1 }}>
          Pour continuer à bénéficier des services Mobilic, nous vous invitons à
          les lire et à les accepter.
        </Typography>
        <Checkbox
          options={[
            {
              label:
                "En cochant cette case, vous confirmez avoir lu et accepté nos conditions générales d'utilisation"
            }
          ]}
          checked={isChecked}
          onChange={e => setIsChecked(e.target.checked)}
        />
      </>
    ),
    [hasTurnedDown, isChecked]
  );
  return (
    <Modal
      open={true}
      handleClose={handleClose}
      size="sm"
      zIndex={3500}
      title={title}
      content={content}
      actions={
        <>
          <Button
            title="Accepter les Conditions Générales d'Utilisation"
            onClick={_onAccept}
            disabled={!isChecked}
          >
            Valider
          </Button>
          {hasTurnedDown ? (
            <Button
              title="Supprimer mon compte"
              onClick={_onReject}
              priority="secondary"
              className={classes.deleteButton}
            >
              Supprimer mon compte
            </Button>
          ) : (
            <Button
              title="Refuser les Conditions Générales d'Utilisation"
              onClick={() => {
                setHasTurnedDown(true);
                setIsChecked(false);
              }}
              priority="secondary"
            >
              Je refuse
            </Button>
          )}
        </>
      }
    />
  );
}
