import React from "react";
import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";
import { Stack, Typography } from "@mui/material";
import { SummaryCard } from "./RegulatoryRespectSummaryCard";
import { Chart } from "./RegulatoryRespectChart";
import { AlertsRecap } from "./RegulatoryRespectAlertsRecap";

const useStyles = makeStyles((theme) => ({
  text: {
    color: fr.colors.decisions.background.flat.grey.default,
  },
}));

export default function RegulatoryRespectResults() {
  const classes = useStyles();

  const noData = false;
  if (noData) {
    return (
      <Typography sx={{ margin: "auto" }} className={classes.text}>
        Aucun temps de travail sur la période sélectionnée.
      </Typography>
    );
  }

  return (
    <Stack direction="row" width="100%" p={4} columnGap={8}>
      <Stack direction="column" rowGap={4} sx={{ width: "380px" }}>
        <SummaryCard
          nbAlerts={5}
          currentMonth="janvier 2026"
          previousMonth="décembre"
          nbAlertsPreviousMonth={3}
        />
        <Chart />
      </Stack>
      <AlertsRecap sx={{ flexGrow: 1 }} />
    </Stack>
  );
}
