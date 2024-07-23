import React from "react";
import { Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Button, Checkbox } from "@dataesr/react-dsfr";
import { ExternalLink } from "../../common/ExternalLink";
import Modal from "../../common/Modal";

const useStyles = makeStyles(theme => ({
  warningIcon: {
    color: "#CE0500",
    marginRight: theme.spacing(1)
  }
}));

export default function AcceptCguModal({ handleClose, handleSubmit }) {
  const classes = useStyles();
  const [isChecked, setIsChecked] = React.useState(false);
  const [hasTurnedDown, setHasTurnedDown] = React.useState(false);
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
              url={"https://mobilic.beta.gouv.fr/cgu"}
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
          checked={isChecked}
          onChange={e => setIsChecked(e.target.checked)}
          label="En cochant cette case, vous confirmez avoir lu et accepté nos conditions générales d'utilisation"
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
            onClick={handleSubmit}
            disabled={!isChecked}
          >
            Valider
          </Button>
          {hasTurnedDown ? (
            <Button
              title="Supprimer mon compte"
              onClick={() => console.log("delete account")}
              secondary
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
              secondary
            >
              Je refuse
            </Button>
          )}
        </>
      }
    />
  );
}
