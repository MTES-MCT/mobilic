import { Cell, PieChart, LabelList, Pie, ResponsiveContainer } from "recharts";
import React from "react";
import { makeStyles } from "@mui/styles";
import { ACTIVITIES } from "../utils/activities";
import { formatTimer } from "../utils/time";
import { computeTotalActivityDurations } from "../utils/metrics";

const RADIAN = Math.PI / 180;

function renderCustomizedLabel(
  name,
  { cx, cy, startAngle, endAngle, innerRadius, outerRadius }
) {
  if (endAngle - startAngle < 20) return null;
  let radiusIndex = 0.5;
  if (endAngle - startAngle < 30) radiusIndex = 0.8;
  else if (endAngle - startAngle < 40) radiusIndex = 0.7;

  const midAngle = (startAngle + endAngle) / 2;
  const radius = innerRadius + (outerRadius - innerRadius) * radiusIndex;
  const x = cx + radius * Math.cos(-midAngle * RADIAN) - 9;
  const y = cy + radius * Math.sin(-midAngle * RADIAN) - 9;

  return ACTIVITIES[name].renderIcon({
    x,
    y,
    textAnchor: x > cx ? "start" : "end",
    dominantBaseline: "central",
    style: { color: "white" },
    height: 18,
    width: 18
  });
}

const useStyles = makeStyles(theme => ({
  pieContainer: {
    maxWidth: ({ maxWidth }) => maxWidth,
    margin: "auto"
  }
}));

export function ActivitiesPieChart({
  activities,
  fromTime = null,
  untilTime = null,
  minWidth = 200,
  maxWidth = 300,
  minHeight = 200,
  maxHeight = 300
}) {
  const classes = useStyles({ maxWidth });

  const stats = computeTotalActivityDurations(activities, fromTime, untilTime);

  if (!stats || !stats.total) {
    return null;
  }

  const pieData = Object.values(ACTIVITIES)
    .map(a => ({
      title: a.label,
      value: Math.round((stats[a.name] * 100.0) / stats.total),
      color: a.color,
      name: a.name,
      label: formatTimer(stats[a.name])
    }))
    .filter(a => !!a.value);

  return (
    <ResponsiveContainer
      aspect={1}
      minWidth={minWidth}
      minHeight={minHeight}
      maxHeight={maxHeight}
      width="100%"
      height="100%"
      className={classes.pieContainer}
    >
      <PieChart style={{ margin: "auto", maxHeight, maxWidth }}>
        <Pie
          cx="50%"
          cy="50%"
          outerRadius={65}
          data={pieData}
          dataKey="value"
          nameKey="name"
          label={entry => entry.label}
        >
          <LabelList
            dataKey="label"
            position="inside"
            content={entry => renderCustomizedLabel(entry.name, entry.viewBox)}
          />
          {pieData.map(entry => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
