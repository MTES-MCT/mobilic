import { Button } from "@codegouvfr/react-dsfr/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import { makeStyles } from "@mui/styles";
import { MobileDatePicker } from "@mui/x-date-pickers";
import { useModals } from "common/utils/modals";
import { addDaysToDate } from "common/utils/time";
import React from "react";
import { PeriodToggle } from "../../../admin/components/PeriodToggle";
import { ControlTypeFilters } from "../filters/ControlTypeFilter";

const useStyles = makeStyles(theme => ({
  filterGrid: {
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    flexShrink: 0
  }
}));

export function ControllerHistoryFilters({
  controlFilters,
  setControlFilters,
  period,
  setPeriod
}) {
  const classes = useStyles();
  const modals = useModals();

  const today = new Date();
  const oneYearAgo = addDaysToDate(new Date(), -365);

  return (
    <Grid
      spacing={2}
      container
      alignItems="end"
      className={classes.filterGrid}
      sx={{ justifyContent: { xs: "left", md: "center" } }}
    >
      <Grid item xs={12} md={2}>
        <ControlTypeFilters
          controlsType={controlFilters.controlsType}
          setControlsType={value =>
            setControlFilters(prevFilters => ({
              ...prevFilters,
              controlsType: value
            }))
          }
        />
      </Grid>
      <Grid item>
        <PeriodToggle period={period} setPeriod={setPeriod} />
      </Grid>
      <Grid item>
        <MobileDatePicker
          label="Début"
          value={controlFilters.fromDate}
          inputFormat="d MMMM yyyy"
          fullWidth
          disableCloseOnSelect={false}
          disableMaskedInput={true}
          onChange={newFromDate => {
            setControlFilters(prevFilters => {
              return {
                ...prevFilters,
                fromDate: newFromDate,
                toDate:
                  newFromDate > prevFilters.toDate
                    ? newFromDate
                    : prevFilters.toDate
              };
            });
          }}
          minDate={oneYearAgo}
          maxDate={today}
          renderInput={props => (
            <TextField {...props} required variant="outlined" size="small" />
          )}
        />
      </Grid>
      <Grid item>
        <MobileDatePicker
          label="Fin"
          value={controlFilters.toDate}
          inputFormat="d MMMM yyyy"
          fullWidth
          disableCloseOnSelect={false}
          disableMaskedInput={true}
          onChange={newToDate => {
            setControlFilters(prevFilters => {
              return {
                ...prevFilters,
                toDate: newToDate,
                fromDate:
                  newToDate < prevFilters.fromDate
                    ? newToDate
                    : prevFilters.fromDate
              };
            });
          }}
          maxDate={today}
          renderInput={props => (
            <TextField {...props} required variant="outlined" size="small" />
          )}
        />
      </Grid>
      <Grid item>
        <Button
          onClick={() =>
            modals.open("controllerExportC1BAll", { controlFilters })
          }
        >
          Exporter
        </Button>
      </Grid>
    </Grid>
  );
}
