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
import { isoFormatLocalDate } from "common/utils/time";

const CONTROL_TYPES = [
  { value: "mobilic", label: "Mobilic" },
  { value: "other", label: "Autre" }
];
const useStyles = makeStyles(theme => ({
  filterGrid: {
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    alignItems: "end",
    justifyContent: "center",
    flexShrink: 0
  }
}));

export function ControllerHistoryFilters() {
  const classes = useStyles();

  const today = new Date();
  const [fromDate, setFromDate] = React.useState(new Date());
  const [toDate, setToDate] = React.useState(new Date());
  const [controlType, setControlType] = React.useState(CONTROL_TYPES[0].value);
  const [period, setPeriod] = React.useState("day");

  return (
    <Grid
      spacing={2}
      container
      alignItems="center"
      justifyContent="space-between"
      className={classes.filterGrid}
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
            selected={controlType}
            onChange={e => setControlType(e.target.value)}
          />
        </div>
      </Grid>
      <Grid item>
        <PeriodToggle period={period} setPeriod={setPeriod} />
      </Grid>
      <Grid item>
        <MobileDatePicker
          label="Début"
          value={fromDate}
          inputFormat="d MMMM yyyy"
          fullWidth
          disableCloseOnSelect={false}
          disableMaskedInput={true}
          onChange={val => {
            setFromDate(isoFormatLocalDate(val));
          }}
          cancelText={null}
          maxDate={today}
          renderInput={props => (
            <TextField {...props} required variant="outlined" size="small" />
          )}
        />
      </Grid>
      <Grid item>
        <MobileDatePicker
          label="Fin"
          value={toDate}
          inputFormat="d MMMM yyyy"
          fullWidth
          disableCloseOnSelect={false}
          disableMaskedInput={true}
          onChange={val => {
            setToDate(isoFormatLocalDate(val));
          }}
          cancelText={null}
          maxDate={today}
          renderInput={props => (
            <TextField {...props} required variant="outlined" size="small" />
          )}
        />
      </Grid>
      <Grid item>
        <ButtonDsfr title="Exporter">Exporter</ButtonDsfr>
      </Grid>
    </Grid>
  );
}
