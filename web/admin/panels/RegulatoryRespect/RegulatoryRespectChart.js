import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { useRegulatoryAlertsSummaryContext } from "../../utils/contextRegulatoryAlertsSummary";
import { SegmentedControl } from "@codegouvfr/react-dsfr/SegmentedControl";
import { Table } from "@codegouvfr/react-dsfr/Table";
import { Chart } from "./Chart";
import { PRETTY_LABELS } from "./RegulatoryRespectAlertsRecap";

const ALERT_COLORS = {
  maximumWorkedDaysInWeek: "#81EEF5",
  maximumWorkInCalendarWeek: "#B478F1",
  minimumDailyRest: "#31A7AE",
  not_enough_break: "#5C68E5",
  too_much_uninterrupted_work_time: "#29598F",
  maximumWorkDayTime: "#115ADF",
  maximumNightWorkDayTime: "#1F1A4A"
};

export const RegulatoryRespectChart = () => {
  const { summary } = useRegulatoryAlertsSummaryContext();
  const [selectedView, setSelectedView] = useState("chart");
  const data = [...summary.dailyAlerts, ...summary.weeklyAlerts]
    .filter((alert) => alert.alertsType in ALERT_COLORS)
    .map((alert) => ({
      name: PRETTY_LABELS[alert.alertsType],
      value: alert.nbAlerts,
      fill: ALERT_COLORS[alert.alertsType]
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
            data={data.map((d) => [d.name, d.value])}
            headers={["Alerte", "Nombre"]}
          />
        </Box>
      )}
      <Box paddingX={4} mt={2}>
        <SegmentedControl
          small
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
