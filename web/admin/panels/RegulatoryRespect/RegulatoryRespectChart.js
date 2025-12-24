import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import {
  Pie,
  PieChart,
  Sector,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { useRegulatoryAlertsSummaryContext } from "../../utils/contextRegulatoryAlertsSummary";
import { SegmentedControl } from "@codegouvfr/react-dsfr/SegmentedControl";

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

const renderActiveShape = ({
  cx,
  cy,
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
  fill,
  payload
}) => {
  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.value}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={(outerRadius ?? 0) + 6}
        outerRadius={(outerRadius ?? 0) + 10}
        fill={fill}
      />
    </g>
  );
};

export const Chart = () => {
  const { summary } = useRegulatoryAlertsSummaryContext();
  const [selectedView, setSelectedView] = useState("chart");

  console.log("summary", summary);
  // const data = [
  //   { name: "Group A", value: 400 },
  //   { name: "Group B", value: 300 },
  //   { name: "Group C", value: 300 },
  //   { name: "Group D", value: 200 }
  // ];
  console.log("[...summary.dailyAlerts, ...summary.weeklyAlerts]", [
    ...summary.dailyAlerts,
    ...summary.weeklyAlerts
  ]);
  const data = [...summary.dailyAlerts, ...summary.weeklyAlerts]
    .filter((alert) => alert.alertsType in ALERTS_DATA)
    .map((alert) => ({
      name: ALERTS_DATA[alert.alertsType].label,
      value: alert.nbAlerts,
      fill: ALERTS_DATA[alert.alertsType].color
    }))
    .filter((d) => d.value > 0);
  return (
    <Box className="fr-tile">
      <Typography
        fontWeight="bold"
        fontSize="1.2rem"
        textAlign="left"
        lineHeight="1.75rem"
      >
        Répartition des dépassements de seuils
      </Typography>
      {selectedView === "chart" ? (
        <ResponsiveContainer width="100%" aspect={1}>
          <PieChart>
            <Pie
              activeShape={renderActiveShape}
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="50%"
              outerRadius="70%"
              fill="#8884d8"
              dataKey="value"
              isAnimationActive={true}
            />
            <Tooltip
              content={() => null}
              // defaultIndex={defaultIndex}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <>table</>
      )}
      <SegmentedControl
        segments={[
          {
            iconId: "fr-icon-pie-chart-2-fill",
            label: "Graphe",
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
  );
};
