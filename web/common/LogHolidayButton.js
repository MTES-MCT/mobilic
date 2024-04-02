import React from "react";
import { Grid, IconButton, Typography } from "@mui/material";
import DateRangeIcon from "@mui/icons-material/DateRange";

export function LogHolidayButton({ onClick }) {
  return (
    <Grid
      container
      item
      direction="row"
      alignItems="center"
      justifyContent={{ sm: "flex-end" }}
      sm={6}
    >
      <IconButton color="primary" onClick={onClick}>
        <DateRangeIcon />
      </IconButton>
      <Typography align="left" mr={2}>
        Renseigner une indisponibilité
      </Typography>
    </Grid>
  );
}
