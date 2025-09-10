import React from "react";
import RegulatoryThresholdItem from "./RegulatoryThresholdItem";
import { certificateStyles } from "./CertificationAdvices";
import { Grid } from "@mui/material";

export default function RegulatoryThresholdsGrid({ compliancyReport }) {
  const classes = certificateStyles();
  return (
    <Grid container spacing={4}>
      <Grid item xs={6}>
        <p className={classes.subtitle}>Seuils journaliers</p>
        {compliancyReport
          .filter(compliancyItem => compliancyItem.period === "day")
          .map((compliancyItem, index) => (
            <RegulatoryThresholdItem
              key={`daily-${compliancyItem.type}-${index}`}
              compliancyItem={compliancyItem}
            />
          ))}
      </Grid>
      <Grid item xs={6}>
        <p className={classes.subtitle}>Seuils hebdomadaires</p>
        {compliancyReport
          .filter(compliancyItem => compliancyItem.period === "week")
          .map((compliancyItem, index) => (
            <RegulatoryThresholdItem
              key={`daily-${compliancyItem.type}-${index}`}
              compliancyItem={compliancyItem}
            />
          ))}
      </Grid>
    </Grid>
  );
}
