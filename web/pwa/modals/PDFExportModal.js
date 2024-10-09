import React from "react";
import Typography from "@mui/material/Typography";
import { MobileDatePicker } from "@mui/x-date-pickers";
import TextField from "@mui/material/TextField";
import { useApi } from "common/utils/api";
import { LoadingButton } from "common/components/LoadingButton";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { formatApiError } from "common/utils/errors";

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
import Modal, { modalStyles } from "../../common/Modal";

export default function PDFExportModal({
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

  const classes = modalStyles();

  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title="Téléchargement du relevé d'heures"
      size="sm"
      content={
        <>
          <Typography gutterBottom>
            Vous pouvez exporter au format PDF votre{" "}
            <strong>relevé d'heures</strong> Mobilic sur les 3 dernières années.
            Chaque export peut contenir 12 mois maximum.
          </Typography>
          <Grid spacing={4} container className={classes.subtitle}>
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
        </>
      }
      actions={
        <LoadingButton
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
      }
    />
  );
}
