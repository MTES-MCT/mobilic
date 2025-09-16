import React from "react";
import RegulatoryThresholdItem from "./RegulatoryThresholdItem";
import { certificateStyles } from "./CertificationAdvices";
import { Grid, Typography } from "@mui/material";

export default function RegulatoryThresholdsGrid({ compliancyReport }) {
  const classes = certificateStyles();
  return (
    <Grid container spacing={4}>
      <Grid item xs={6}>
        <Typography className={classes.subtitle} mb={3}>
          Seuils journaliers
        </Typography>
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
        <Typography className={classes.subtitle} mb={3}>
          Seuils hebdomadaires
        </Typography>
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
