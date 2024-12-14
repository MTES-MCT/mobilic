import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";
import { FieldTitle } from "../../../common/typography/FieldTitle";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Grid } from "@mui/material";

const useStyles = makeStyles(theme => ({
  card: {
    borderRadius: "4px",
    border: "1px solid",
    borderColor: fr.colors.decisions.border.default.grey.default,
    padding: "8px 12px 12px 12px"
  },
  value: {
    fontWeight: 700,
    fontSize: "1.25rem"
  },
  button: {
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      justifyContent: "center"
    }
  }
}));
export function ControllerControlNbCard({
  label,
  buttonLabel,
  nbElem,
  onClick
}) {
  const classes = useStyles();
  return (
    <Stack direction="column" className={classes.card} rowGap={1}>
      <FieldTitle>{label}</FieldTitle>
      <Stack direction={{ xs: "column", md: "row" }} rowGap={1}>
        <Typography className={classes.value} sx={{ flexGrow: 1 }}>
          {nbElem}
        </Typography>
        <Button
          priority="secondary"
          size="small"
          onClick={e => {
            e.preventDefault();
            onClick();
          }}
          iconId="fr-icon-arrow-right-s-line"
          iconPosition="right"
          className={classes.button}
        >
          {buttonLabel}
        </Button>
      </Stack>
    </Stack>
  );
}

export function ControllerControlNbCards({
  nbAlerts = null,
  nbWorkingDays = null,
  setTab
}) {
  return (
    <Grid container spacing={2} width="100%">
      {(nbWorkingDays || nbWorkingDays === 0) && (
        <Grid item xs={6}>
          <ControllerControlNbCard
            label="Journées enregistrées"
            buttonLabel="Historique"
            nbElem={nbWorkingDays}
            onClick={() => setTab("history")}
          />
        </Grid>
      )}
      {(nbAlerts || nbAlerts === 0) && (
        <Grid item xs={6}>
          <ControllerControlNbCard
            label="Alertes réglementaires"
            buttonLabel="Alertes"
            nbElem={nbAlerts}
            onClick={() => setTab("alerts")}
          />
        </Grid>
      )}
    </Grid>
  );
}
