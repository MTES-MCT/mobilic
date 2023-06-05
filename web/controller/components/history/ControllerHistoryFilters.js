import { Button as ButtonDsfr } from "@dataesr/react-dsfr";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { makeStyles } from "@mui/styles";
import { MobileDatePicker } from "@mui/x-date-pickers";
import { useModals } from "common/utils/modals";
import { addDaysToDate, isoFormatLocalDate } from "common/utils/time";
import React from "react";
import { PeriodToggle } from "../../../admin/components/PeriodToggle";

const useStyles = makeStyles(theme => ({
  filterGrid: {
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    flexShrink: 0
  }
}));

const controlsTypes = [
  {
    label: "-",
    value: ""
  },
  {
    label: "Mobilic",
    value: "mobilic"
  },
  {
    label: "Pas de LIC",
    value: "sans_lic"
  }
];

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
        <TextField
          label="Type de contrôle"
          variant="filled"
          select
          fullWidth
          value={controlFilters.controlsType}
          size="small"
          onChange={e =>
            setControlFilters(prevFilters => ({
              ...prevFilters,
              controlsType: e.target.value
            }))
          }
        >
          {controlsTypes.map(controlsType => (
            <MenuItem key={controlsType.value} value={controlsType.value}>
              {controlsType.label}
            </MenuItem>
          ))}
        </TextField>
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
                fromDate: isoFormatLocalDate(newFromDate),
                toDate:
                  newFromDate > new Date(prevFilters.toDate)
                    ? isoFormatLocalDate(newFromDate)
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
                toDate: isoFormatLocalDate(newToDate),
                fromDate:
                  newToDate < new Date(prevFilters.fromDate)
                    ? isoFormatLocalDate(newToDate)
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
        <ButtonDsfr
          title="Exporter"
          onClick={() =>
            modals.open("controllerExportC1BAll", { controlFilters })
          }
        >
          Exporter
        </ButtonDsfr>
      </Grid>
    </Grid>
  );
}
