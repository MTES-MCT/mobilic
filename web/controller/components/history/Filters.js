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
  { value: "other", label: "Autre" }
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
  onClickExport
}) {
  const classes = useStyles();

  const today = new Date();
  const oneYearAgo = addDaysToDate(new Date(), -365);
  const [period, setPeriod] = React.useState("day");

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
            options={[
              { value: "mobilic", label: "Mobilic" },
              { value: "other", label: "Autre" }
            ]}
            selected={controlFilters.type}
            onChange={e =>
              setControlFilters(prevFilters => ({
                ...prevFilters,
                type: e.target.value
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
          onChange={val => {
            setControlFilters(prevFilters => ({
              ...prevFilters,
              fromDate: isoFormatLocalDate(val)
            }));
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
          onChange={val => {
            setControlFilters(prevFilters => ({
              ...prevFilters,
              toDate: isoFormatLocalDate(val)
            }));
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
