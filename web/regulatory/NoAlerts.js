import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import { useIsWidthDown } from "common/utils/useWidth";
import { fr } from "@codegouvfr/react-dsfr";

const useStyles = makeStyles((theme) => ({
  card: (isMobile) => ({
    backgroundColor: isMobile ? fr.colors.decisions.text.inverted.success.default : "white",
    padding: theme.spacing(2)
  })
}));

export function NoAlerts() {
  const isMobile = useIsWidthDown("sm");
  const classes = useStyles(isMobile);

  return (
    <Stack direction="row" className={classes.card} columnGap={1} mt={1} alignItems="center">
      <span className={"fr-icon-success-line"} style={{ color: "#18753C" }} />
      <Typography fontWeight={500} textAlign="left">
        Tous les seuils réglementaires ont été respectés !
      </Typography>
    </Stack>
  );
}
