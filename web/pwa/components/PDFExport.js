import React from "react";
import Typography from "@mui/material/Typography";
import DialogContent from "@mui/material/DialogContent";
import { MobileDatePicker } from "@mui/x-date-pickers";
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
  isDateInCurrentMonth,
  isoFormatLocalDate,
  startOfDayAsDate,
  startOfMonthAsDate
} from "common/utils/time";
import { HTTP_QUERIES } from "common/utils/apiQueries";
import { DateOrDateTimeRangeSelectionContext } from "common/components/DateOrDateTimeRangeSelectionContext";
import { startOfMonth, subMonths } from "date-fns";
import { MAX_NB_MONTHS_HISTORY } from "common/utils/mission";

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

export default function PDFExport({
  open,
  handleClose,
  initialMinDate,
  initialMaxDate
}) {
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const { trackLink } = useMatomo();
  const [minDate, setMinDate] = React.useState(initialMinDate);
  const [maxDate, setMaxDate] = React.useState(
    startOfDayAsDate(initialMaxDate)
  );
  const [dateRangeError, setDateRangeError] = React.useState(null);

  const today = new Date();
  const firstHistoryDate = startOfMonth(
    subMonths(new Date(), MAX_NB_MONTHS_HISTORY)
  );

  React.useEffect(() => {
    if (
      maxDate &&
      minDate &&
      maxDate.getTime() - minDate.getTime() >= 365 * DAY * 1000
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
          <strong>relevé d'heures</strong> Mobilic sur les 3 dernières années.
          Chaque export peut contenir 12 mois maximum.
        </Typography>
        <Grid spacing={4} container className={classes.grid}>
          <DateOrDateTimeRangeSelectionContext
            start={minDate}
            setStart={setMinDate}
            end={maxDate}
            setEnd={setMaxDate}
          >
            <Grid item sm={6} xs={12}>
              <MobileDatePicker
                label="Mois de début"
                value={minDate}
                inputFormat="MMMM yyyy"
                fullWidth
                onChange={setMinDate}
                openTo={"month"}
                views={["year", "month"]}
                cancelText={null}
                disableCloseOnSelect={false}
                disableMaskedInput={true}
                maxDate={today}
                minDate={firstHistoryDate}
                renderInput={props => (
                  <TextField
                    {...props}
                    required
                    variant="outlined"
                    error={!!dateRangeError}
                    helperText={dateRangeError}
                  />
                )}
              />
            </Grid>
            <Grid item sm={6} xs={12}>
              <MobileDatePicker
                label="Mois de fin"
                value={maxDate}
                inputFormat="MMMM yyyy"
                fullWidth
                onChange={setMaxDate}
                openTo={"month"}
                views={["year", "month"]}
                cancelText={null}
                disableCloseOnSelect={false}
                disableMaskedInput={true}
                maxDate={today}
                minDate={firstHistoryDate}
                renderInput={props => (
                  <TextField
                    {...props}
                    required
                    variant="outlined"
                    helperText={dateRangeError}
                    error={!!dateRangeError}
                  />
                )}
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
            if (maxDate) {
              options["max_date"] = isoFormatLocalDate(
                isDateInCurrentMonth(maxDate)
                  ? new Date()
                  : endOfMonthAsDate(maxDate)
              );
            }
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
          loadingLabel={"Veuillez patienter pendant le téléchargement"}
        >
          Télécharger
        </LoadingButton>
      </CustomDialogActions>
    </Dialog>
  );
}
