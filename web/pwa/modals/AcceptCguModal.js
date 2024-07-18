import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Button, Checkbox } from "@dataesr/react-dsfr";
import { ExternalLink } from "../../common/ExternalLink";

const useStyles = makeStyles(theme => ({
  title: {
    fontSize: "1.5rem"
  },
  content: {
    color: "rgba(0, 0, 0, 0.8)"
  },
  dialogPaper: {
    margin: 0,
    position: "fixed",
    bottom: 0,
    width: "100%",
    maxWidth: "100%",
    [theme.breakpoints.up("sm")]: {
      position: "relative",
      bottom: "auto",
      width: "auto",
      maxWidth: "590px"
    }
  },
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
            />{" "}
            .
          </>
        </Typography>
        <Typography sx={{ marginTop: 1 }}>
          Pour continuer à bénéficier des services Mobilic, nous vous invitons à
          les lire et à les accepter.
        </Typography>
      </>
    ),
    [hasTurnedDown]
  );
  return (
    <Dialog
      open={true}
      onClose={handleClose}
      aria-labelledby="cgu-dialog-title"
      aria-describedby="cgu-dialog-description"
      classes={{ paper: classes.dialogPaper }}
    >
      <DialogTitle id="cgu-dialog-title" className={classes.title}>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          id="cgu-dialog-description"
          className={classes.content}
        >
          {content}
        </DialogContentText>
        <Checkbox
          checked={isChecked}
          onChange={e => setIsChecked(e.target.checked)}
          label="En cochant cette case, vous confirmez avoir lu et accepté nos conditions générales d'utilisation"
        />
      </DialogContent>
      <DialogActions>
        <Stack
          direction="row-reverse"
          justifyContent="flex-start"
          p={2}
          spacing={4}
          width="100%"
        >
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
              onClick={() => setHasTurnedDown(true)}
              secondary
            >
              Je refuse
            </Button>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
