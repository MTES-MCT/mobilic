import React from "react";

import { MobileDatePicker } from "@mui/x-date-pickers";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";

import { startOfMonth, subMonths } from "date-fns";
import { MAX_NB_MONTHS_HISTORY } from "common/utils/mission";

export function PeriodFilter({
  minDate,
  setMinDate,
  maxDate,
  setMaxDate,
  periodFilterRangeError
}) {
  const today = new Date();
  const firstHistoryDate = startOfMonth(
    subMonths(new Date(), MAX_NB_MONTHS_HISTORY)
  );
  return (
    <Grid container spacing={2} pl={2}>
      <Grid item>
        <MobileDatePicker
          label="Début"
          value={minDate}
          inputFormat="MMMM yyyy"
          fullWidth
          onChange={setMinDate}
          openTo={"month"}
          views={["year", "month"]}
          cancelText={null}
          closeOnSelect={true}
          disableMaskedInput={true}
          minDate={firstHistoryDate}
          maxDate={today}
          renderInput={props => (
            <TextField
              {...props}
              required
              variant="outlined"
              size="small"
              error={!!periodFilterRangeError}
              helperText={periodFilterRangeError}
            />
          )}
        />
      </Grid>
      <Grid item>
        <MobileDatePicker
          label="Fin"
          value={maxDate}
          inputFormat="MMMM yyyy"
          fullWidth
          onChange={setMaxDate}
          openTo={"month"}
          views={["year", "month"]}
          cancelText={null}
          closeOnSelect={true}
          disableMaskedInput={true}
          minDate={minDate}
          maxDate={today}
          renderInput={props => (
            <TextField
              {...props}
              required
              variant="outlined"
              size="small"
              error={!!periodFilterRangeError}
              helperText={periodFilterRangeError}
            />
          )}
        />
      </Grid>
    </Grid>
  );
}
