import React from "react";
import Typography from "@mui/material/Typography";
import DialogContent from "@mui/material/DialogContent";
import DatePicker from "@mui/lab/DatePicker";
import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import { useApi } from "common/utils/api";
import { makeStyles } from "@mui/styles";
import { LoadingButton } from "common/components/LoadingButton";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { formatApiError } from "common/utils/errors";
import {
  CustomDialogActions,
  CustomDialogTitle
} from "../../common/CustomDialogTitle";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import Grid from "@mui/material/Grid";
import {
  DAY,
  endOfMonthAsDate,
  isoFormatLocalDate,
  startOfDayAsDate,
  startOfMonthAsDate
} from "common/utils/time";
import { HTTP_QUERIES } from "common/utils/apiQueries";
import { DateOrDateTimeRangeSelectionContext } from "common/components/DateOrDateTimeRangeSelectionContext";

const useStyles = makeStyles(theme => ({
  start: {
    marginRight: theme.spacing(4)
  },
  end: {
    marginLeft: theme.spacing(4)
  },
  flexGrow: {
    flexGrow: 1
  },
  grid: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  switchContainer: {
    display: "flex",
    alignItems: "center"
  },
  subTitle: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  }
}));

export default function PDFExport({ open, handleClose }) {
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const { trackLink } = useMatomo();
  const [minDate, setMinDate] = React.useState(null);
  const [maxDate, setMaxDate] = React.useState(startOfDayAsDate(new Date()));
  const [dateRangeError, setDateRangeError] = React.useState(null);

  React.useEffect(() => {
    if (
      maxDate &&
      minDate &&
      maxDate.getTime() - minDate.getTime() > 365 * DAY * 1000
    ) {
      setDateRangeError(
        "La période sélectionnée doit être inférieure à 12 mois !"
      );
    } else setDateRangeError(null);
  }, [minDate, maxDate]);

  const classes = useStyles();

  return (
    <Dialog onClose={handleClose} open={open} maxWidth="md">
      <CustomDialogTitle
        title="Téléchargement du relevé d'heures"
        handleClose={handleClose}
      />
      <DialogContent>
        <Typography gutterBottom>
          Vous pouvez exporter au format PDF votre{" "}
          <strong>relevé d'heures</strong> Mobilic sur la période de votre
          choix.
        </Typography>
        <Grid spacing={4} container className={classes.grid}>
          <DateOrDateTimeRangeSelectionContext
            start={minDate}
            setStart={setMinDate}
            end={maxDate}
            setEnd={setMaxDate}
          >
            <Grid item sm={6} xs={12}>
              <DatePicker
                renderInput={props => (
                  <TextField
                    required
                    variant="outlined"
                    label="Mois de début"
                    helperText={dateRangeError}
                  />
                )}
                value={minDate}
                inputFormat="MMMM yyyy"
                fullWidth
                onChange={e => {
                  setMinDate(e);
                }}
                cancelText={null}
                autoOk
                disableFuture
                animateYearScrolling
                error={!!dateRangeError}
                openTo={"month"}
                views={["year", "month"]}
              />
            </Grid>
            <Grid item sm={6} xs={12}>
              <DatePicker
                renderInput={props => (
                  <TextField
                    required
                    variant="outlined"
                    label="Mois de fin"
                    helperText={dateRangeError}
                    error={!!dateRangeError}
                  />
                )}
                value={maxDate}
                inputFormat="MMMM yyyy"
                fullWidth
                onChange={e => {
                  setMaxDate(e);
                }}
                cancelText={null}
                autoOk
                disableFuture
                animateYearScrolling
                openTo={"month"}
                views={["year", "month"]}
              />
            </Grid>
          </DateOrDateTimeRangeSelectionContext>
        </Grid>
      </DialogContent>
      <CustomDialogActions>
        <LoadingButton
          color="primary"
          variant="contained"
          disabled={!minDate || !maxDate || dateRangeError}
          onClick={async e => {
            const options = {};
            if (minDate)
              options["min_date"] = isoFormatLocalDate(
                startOfMonthAsDate(minDate)
              );
            if (maxDate)
              options["max_date"] = isoFormatLocalDate(
                endOfMonthAsDate(maxDate)
              );
            e.preventDefault();
            trackLink({
              href: `/generate_pdf_export`,
              linkType: "download"
            });
            try {
              await api.downloadFileHttpQuery(HTTP_QUERIES.pdfExport, {
                json: options
              });
            } catch (err) {
              alerts.error(formatApiError(err), "generate_pdf_export", 6000);
            }
          }}
        >
          Télécharger
        </LoadingButton>
      </CustomDialogActions>
    </Dialog>
  );
}
