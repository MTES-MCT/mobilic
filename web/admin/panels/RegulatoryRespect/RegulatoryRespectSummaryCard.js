import React from "react";
import { makeStyles } from "@mui/styles";
import { Box, Stack, Typography } from "@mui/material";
import { fr } from "@codegouvfr/react-dsfr";
import classNames from "classnames";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";

const useStyles = makeStyles((theme) => ({
  card: {
    borderBottom: `4px solid #3965EA`,
  },
  title: {
    color: fr.colors.decisions.text.actionHigh.grey.default,
  },
  subTitle: {
    color: fr.colors.decisions.background.flat.grey.default,
  },
  change: {
    color: fr.colors.decisions.text.mention.grey.default,
    fontSize: "0.75rem",
  },
}));

export const SummaryCard = ({
  nbAlerts,
  currentMonth,
  previousMonth,
  nbAlertsPreviousMonth = null,
}) => {
  const classes = useStyles();

  const percDiff = Math.floor(
    ((nbAlerts - nbAlertsPreviousMonth) / nbAlerts) * 100
  );
  return (
    <Box className={classNames("fr-tile", classes.card)}>
      <Stack rowGap={1}>
        <Typography className={classes.title} variant="h2">
          {nbAlerts}
        </Typography>
        <Typography className={classes.subTitle} px={4} mb={2}>
          Dépassements de seuils en {currentMonth}
        </Typography>
        <Stack direction="row" columnGap={1}>
          <Typography className={classes.change}>
            En {percDiff > 0 ? "hausse" : "baisse"} par rapport à{" "}
            {previousMonth}
          </Typography>
          <Badge
            severity={percDiff > 0 ? "error" : "success"}
            small
            className="evolution"
            noIcon
          >
            <span
              className={cx(
                "fr-icon--sm",
                percDiff > 0
                  ? "fr-icon-corner-right-up-line"
                  : "fr-icon-corner-right-down-line"
              )}
            />
            {Math.abs(percDiff)}%
          </Badge>
        </Stack>
      </Stack>
    </Box>
  );
};
