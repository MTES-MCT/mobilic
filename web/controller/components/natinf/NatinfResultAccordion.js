import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { makeStyles } from "@mui/styles";
import { alertNumberBase } from "../../../common/styles/alertNumber";
import { fr } from "@codegouvfr/react-dsfr";
import { Calendar } from "react-multi-date-picker";
import { addDaysToDate, textualPrettyFormatDay, unixToJSTimestamp } from "common/utils/time";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import Stack from "@mui/material/Stack";
import { capitalizeFirstLetter } from "common/utils/string";
import classNames from "classnames";
import { gregorian_fr } from "common/utils/calendarLocale";
import { useCalendarStyles } from "../../../common/styles/calendarStyles";
import { WarningBadge } from "../../../common/WarningBadge";
import { AccordionActions } from "../../../common/AccordionActions";

const controlHistoryDepth =
  Number.parseInt(process.env.REACT_APP_USER_CONTROL_HISTORY_DEPTH, 10) || 28;

const useStyles = makeStyles(theme => ({
  container: {
    width: "100%",
    marginBottom: theme.spacing(1)
  },
  details: {
    display: "block"
  },
  alertNumber: {
    ...alertNumberBase(theme),
    backgroundColor: fr.colors.decisions.background.flat.error.default
  }
}));

export function NatinfResultAccordion({
  natinf,
  selectedDays = [],
  onDaySelect,
  onDayRemove,
  controlTime,
  expanded,
  onChange,
  onDelete
}) {
  const classes = useStyles();
  const calendarClasses = useCalendarStyles();

  const effectiveControlTime = controlTime || Math.trunc(Date.now() / 1000);

  const maxDate = new Date(unixToJSTimestamp(effectiveControlTime));
  const minDate = addDaysToDate(new Date(maxDate), -controlHistoryDepth);

  const handleDateChange = values => {
    const newDays = values.map(dateObj => {
      const date = dateObj.toDate ? dateObj.toDate() : new Date(dateObj);
      date.setHours(0, 0, 0, 0);
      return Math.trunc(date.getTime() / 1000);
    });
    newDays.filter(ts => !selectedDays.includes(ts)).forEach(day => onDaySelect(natinf, day));
    selectedDays.filter(ts => !newDays.includes(ts)).forEach(day => onDayRemove(natinf.code, day));
  };

  const handleTagRemove = (day) => {
    onDayRemove(natinf.code, day);
  };

  const selectedDates = React.useMemo(
    () => selectedDays.map(ts => new Date(unixToJSTimestamp(ts))),
    [selectedDays]
  );

  return (
    <Accordion
      expanded={expanded}
      onChange={onChange}
      variant="outlined"
      className={classes.container}
      TransitionProps={{ unmountOnExit: true }}
    >
      <AccordionSummary>
        <Grid container spacing={1} alignItems="center" justifyContent="space-between" wrap="nowrap">
          <Grid item xs>
            <Typography className="bold" color="primary" fontSize="0.875rem">
              NATINF {natinf.code}
            </Typography>
            <Typography fontWeight="500" fontSize="0.875rem" style={{ textTransform: "uppercase" }}>
              {natinf.label}
            </Typography>
          </Grid>
          {selectedDays.length > 0 && (
            <Grid item>
              <WarningBadge className={classes.alertNumber}>
                {selectedDays.length}
              </WarningBadge>
            </Grid>
          )}
          <AccordionActions open={expanded} onDelete={onDelete} />
        </Grid>
      </AccordionSummary>
      <AccordionDetails className={classes.details}>
        <Stack direction="column" gap={2}>
          <Typography component="div" style={{ marginBottom: 0 }}>
            Sélectionnez la ou les journées concernées&nbsp;:
          </Typography>
          <Calendar
            className={classNames(calendarClasses.calendar, "custom-calendar")}
            value={selectedDates}
            onChange={handleDateChange}
            multiple
            sort
            minDate={minDate}
            maxDate={maxDate}
            currentDate={maxDate}
            highlightToday={false}
            weekStartDayIndex={1}
            headerOrder={["MONTH_YEAR", "LEFT_BUTTON", "RIGHT_BUTTON"]}
            monthYearSeparator=" "
            locale={gregorian_fr}
          />
          {selectedDays.length > 0 && (
            <ul
              className="fr-tag-group"
              style={{ listStyleType: "none", paddingInlineStart: "0" }}
            >
              {selectedDays
                .slice()
                .sort((a, b) => a - b)
                .map(day => (
                  <li key={day}>
                    <Tag
                      dismissible
                      nativeButtonProps={{
                        onClick: () => handleTagRemove(day),
                        "aria-label": `Retirer ${capitalizeFirstLetter(textualPrettyFormatDay(day, true))}`
                      }}
                    >
                      {capitalizeFirstLetter(textualPrettyFormatDay(day, true))}
                    </Tag>
                  </li>
                ))}
            </ul>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
