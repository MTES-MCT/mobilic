import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { useRegulatoryAlertsSummaryContext } from "../../utils/contextRegulatoryAlertsSummary";
import { SegmentedControl } from "@codegouvfr/react-dsfr/SegmentedControl";
import { Table } from "@codegouvfr/react-dsfr/Table";
import { Chart } from "./Chart";

const ALERTS_DATA = {
  maximumWorkedDaysInWeek: {
    label: "Repos hebdomadaire",
    color: "#81EEF5"
  },
  maximumWorkInCalendarWeek: {
    label: "Durée du travail hebdomadaire",
    color: "#B478F1"
  },
  minimumDailyRest: {
    label: "Repos journalier",
    color: "#31A7AE"
  },
  not_enough_break: {
    label: "Temps de pause",
    color: "#5C68E5"
  },
  too_much_uninterrupted_work_time: {
    label: "Durée maximale de travail ininterrompu",
    color: "#29598F"
  },
  maximumWorkDayTime: {
    label: "Durée du travail quotidien",
    color: "#115ADF"
  }
};

export const RegulatoryRespectChart = () => {
  const { summary } = useRegulatoryAlertsSummaryContext();
  const [selectedView, setSelectedView] = useState("chart");
  const data = [...summary.dailyAlerts, ...summary.weeklyAlerts]
    .filter((alert) => alert.alertsType in ALERTS_DATA)
    .map((alert) => ({
      name: ALERTS_DATA[alert.alertsType].label,
      value: alert.nbAlerts,
      fill: ALERTS_DATA[alert.alertsType].color
    }))
    .filter((d) => d.value > 0);

  if (data.length === 0) {
    return;
  }
  return (
    <Box className="fr-tile alerts-chart" minHeight="470px">
      <Typography
        fontWeight="bold"
        fontSize="1.2rem"
        textAlign="left"
        lineHeight="1.75rem"
        paddingX={4}
      >
        Répartition des dépassements de seuils
      </Typography>
      {selectedView === "chart" ? (
        <Chart data={data} />
      ) : (
        <Box paddingX={4}>
          <Table
            caption="Répartition des dépassements de seuils"
            data={data.map((d) => [d.name, d.value])}
            headers={["Alerte", "Nombre"]}
          />
        </Box>
      )}
      <Box paddingX={4} mt={2}>
        <SegmentedControl
          segments={[
            {
              iconId: "fr-icon-pie-chart-2-fill",
              label: "Graphique",
              nativeInputProps: {
                value: "chart",
                defaultChecked: true,
                onChange: () => setSelectedView("chart")
              }
            },
            {
              iconId: "fr-icon-table-line",
              label: "Tableau",
              nativeInputProps: {
                value: "table",
                onChange: () => setSelectedView("table")
              }
            }
          ]}
        />
      </Box>
    </Box>
  );
};
