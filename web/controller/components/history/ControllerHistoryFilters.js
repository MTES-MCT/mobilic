import React from "react";
import { makeStyles } from "@mui/styles";
import {
  Button as ButtonDsfr,
  Select as SelectDsfr
} from "@dataesr/react-dsfr";
import Grid from "@mui/material/Grid";
import MobileDatePicker from "@mui/lab/MobileDatePicker";
import TextField from "@mui/material/TextField";
import { PeriodToggle } from "../../../admin/components/PeriodToggle";
import { addDaysToDate, isoFormatLocalDate } from "common/utils/time";

export const CONTROL_TYPES = [
  { value: "mobilic", label: "Mobilic" },
  { value: "lic_papier", label: "LIC Papier" },
  { value: "sans_lic", label: "Pas de LIC" }
];

const useStyles = makeStyles(theme => ({
  filterGrid: {
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    alignItems: "end",
    flexShrink: 0
  }
}));

export function ControllerHistoryFilters({
  controlFilters,
  setControlFilters,
  period,
  setPeriod,
  onClickExport
}) {
  const classes = useStyles();

  const today = new Date();
  const oneYearAgo = addDaysToDate(new Date(), -365);

  return (
    <Grid
      spacing={2}
      container
      alignItems="center"
      justifyContent="space-between"
      className={classes.filterGrid}
      sx={{ justifyContent: { xs: "left", md: "center" } }}
    >
      <Grid item>
        <div className="fr-select-group">
          <label className="fr-label" htmlFor="select-type">
            Type de contrôle
          </label>
          <SelectDsfr
            id="select-type"
            options={CONTROL_TYPES}
            selected={controlFilters.controlsType}
            onChange={e =>
              setControlFilters(prevFilters => ({
                ...prevFilters,
                controlsType: e.target.value
              }))
            }
          />
        </div>
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
          cancelText={null}
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
          cancelText={null}
          maxDate={today}
          renderInput={props => (
            <TextField {...props} required variant="outlined" size="small" />
          )}
        />
      </Grid>
      <Grid item>
        <ButtonDsfr title="Exporter" onClick={onClickExport}>
          Exporter
        </ButtonDsfr>
      </Grid>
    </Grid>
  );
}