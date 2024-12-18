import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";
import { FieldTitle } from "../../../common/typography/FieldTitle";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Box from "@mui/material/Box";

const useStyles = makeStyles(theme => ({
  card: {
    borderRadius: "4px",
    border: "1px solid",
    borderColor: fr.colors.decisions.border.default.grey.default,
    padding: "8px 12px 12px 12px",
    [theme.breakpoints.up("sm")]: {
      maxWidth: "50%"
    }
  },
  value: {
    fontWeight: 700,
    fontSize: "1.25rem",
    flexGrow: 1
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
    <Stack direction="column" rowGap={1} className={classes.card} flexGrow={1}>
      <FieldTitle component="h2" flexGrow={1}>
        {label}
      </FieldTitle>
      <Box display="flex" flexWrap="wrap" alignItems="center" rowGap={1}>
        <Typography className={classes.value}>{nbElem}</Typography>
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
      </Box>
    </Stack>
  );
}

export function ControllerControlNbCards({
  nbAlerts = null,
  nbWorkingDays = null,
  onChangeTab
}) {
  return (
    <Stack direction="row" columnGap={1}>
      {(nbWorkingDays || nbWorkingDays === 0) && (
        <ControllerControlNbCard
          label="Journées enregistrées"
          buttonLabel="Historique"
          nbElem={nbWorkingDays}
          onClick={() => onChangeTab("history")}
        />
      )}
      {(nbAlerts || nbAlerts === 0) && (
        <ControllerControlNbCard
          label="Alertes réglementaires"
          buttonLabel="Alertes"
          nbElem={nbAlerts}
          onClick={() => onChangeTab("alerts")}
        />
      )}
    </Stack>
  );
}
