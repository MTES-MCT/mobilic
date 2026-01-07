import React from "react";
import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";
import { Stack, Typography } from "@mui/material";
import { SummaryCard } from "./RegulatoryRespectSummaryCard";
import { RegulatoryRespectChart } from "./RegulatoryRespectChart";
import { AlertsRecap } from "./RegulatoryRespectAlertsRecap";
import { useRegulatoryAlertsSummaryContext } from "../../utils/contextRegulatoryAlertsSummary";

const useStyles = makeStyles((theme) => ({
  text: {
    color: fr.colors.decisions.background.flat.grey.default
  }
}));

export default function RegulatoryRespectResults() {
  const classes = useStyles();

  const { summary } = useRegulatoryAlertsSummaryContext();

  if (!summary?.hasAnyComputation) {
    return (
      <Typography sx={{ margin: "auto" }} className={classes.text}>
        Aucun temps de travail sur la période sélectionnée.
      </Typography>
    );
  }

  return (
    <Stack direction="row" width="100%" p={4} columnGap={8}>
      <Stack direction="column" rowGap={4} sx={{ width: "380px" }}>
        <SummaryCard />
        <RegulatoryRespectChart />
      </Stack>
      <AlertsRecap sx={{ flexGrow: 1 }} />
    </Stack>
  );
}
