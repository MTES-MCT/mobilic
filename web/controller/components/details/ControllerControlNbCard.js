import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";
import { FieldTitle } from "../../../common/typography/FieldTitle";
import { Button } from "@codegouvfr/react-dsfr/Button";

const useStyles = makeStyles(() => ({
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
    width: "100%",
    justifyContent: "center"
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
    </Stack>
  );
}
