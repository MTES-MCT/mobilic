import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import { Calendar } from "react-multi-date-picker";
import { addDaysToDate, textualPrettyFormatDay, unixToJSTimestamp } from "common/utils/time";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import Stack from "@mui/material/Stack";
import { capitalizeFirstLetter } from "common/utils/string";
import classNames from "classnames";
import { gregorian_fr } from "common/utils/calendarLocale";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { useCalendarStyles } from "../../../common/styles/calendarStyles";
import { useAccordionSummaryStyles } from "../../../common/styles/accordionStyles";

const controlHistoryDepth =
  Number.parseInt(process.env.REACT_APP_USER_CONTROL_HISTORY_DEPTH, 10) || 28;

const useStyles = makeStyles(theme => ({
  container: {
    width: "100%",
    marginBottom: theme.spacing(1)
  },
  details: {
    display: "block"
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
  const accordionClasses = useAccordionSummaryStyles();
  const calendarClasses = useCalendarStyles();

  if (!controlTime) controlTime = Math.trunc(Date.now() / 1000);

  const maxDate = new Date(unixToJSTimestamp(controlTime));
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
    >
      <AccordionSummary>
        <div className={accordionClasses.summary}>
          <div className={accordionClasses.summaryRow}>
            <div className={accordionClasses.summaryLeft}>
              <Typography className="bold" color="primary" fontSize="0.875rem">
                NATINF {natinf.code}
              </Typography>
              {selectedDays.length > 0 && (
                <Badge small noIcon as="span" className={accordionClasses.errorAlertBadge}>
                  {selectedDays.length}
                </Badge>
              )}
            </div>
            <div className={accordionClasses.summaryIcons}>
              <span
                className={classNames(
                  "fr-icon-arrow-down-s-line",
                  accordionClasses.arrowIcon,
                  expanded && accordionClasses.arrowIconOpen
                )}
                aria-hidden="true"
              />
              {onDelete && (
                <button
                  className={accordionClasses.deleteButton}
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  title="Supprimer l'infraction"
                  aria-label="Supprimer l'infraction"
                >
                  <span className="fr-icon-delete-line" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
          <Typography fontWeight="500" fontSize="0.875rem" style={{ textTransform: "uppercase" }}>
            {natinf.label}
          </Typography>
        </div>
      </AccordionSummary>
      <AccordionDetails className={classes.details}>
        {expanded && (
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
              headerOrder={["LEFT_BUTTON", "MONTH_YEAR", "RIGHT_BUTTON"]}
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
        )}
      </AccordionDetails>
    </Accordion>
  );
}
