import React from "react";
import { makeStyles } from "@mui/styles";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import SvgIcon from "@mui/material/SvgIcon";
import { ReactComponent as ExcelIcon } from "common/assets/images/excel.svg";
import { ReactComponent as TachoIcon } from "common/assets/images/tacho.svg";
import { MobileDatePicker } from "@mui/x-date-pickers";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { ADMIN_ACTIONS } from "../../store/reducers/root";
import {
  getUsersToSelectFromTeamSelection,
  unselectAndGetAllTeams,
} from "../../store/reducers/team";
import { useAdminStore, useAdminCompanies } from "../../store/store";
import { useModals } from "common/utils/modals";
import {
  ACTIVITY_FILTER_MAX_DATE,
  ACTIVITY_FILTER_MIN_DATE,
  ADMIN_EXPORT_EXCEL,
  ADMIN_EXPORT_C1B,
} from "common/utils/matomoTags";
import { EmployeeFilter } from "../../components/EmployeeFilter";
import { TeamFilter } from "../../components/TeamFilter";
import { PeriodToggle } from "../../components/PeriodToggle";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import { useGetUsersSinceDate } from "../../../common/hooks/useGetUsersSinceDate";
import { isoFormatLocalDate, startOfDayAsDate } from "common/utils/time";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { addDays } from "date-fns";

const useStyles = makeStyles((theme) => ({
  filterGrid: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "nowrap",
    gap: theme.spacing(2),
    flexShrink: 0,
  },
  datePickerSection: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
  },
}));

const ActivitiesPanelFilters = (props) => {
  const {
    teams,
    users,
    period,
    setPeriod,
    minDate,
    setMinDate,
    maxDate,
    setMaxDate,
    dateRangeError,
    companies,
  } = props;

  const [exportMenuAnchorEl, setExportMenuAnchorEl] = React.useState(null);

  const classes = useStyles();
  const adminStore = useAdminStore();
  const modals = useModals();
  const { trackEvent } = useMatomo();
  const { getUsersSinceDate } = useGetUsersSinceDate();
  const [, company] = useAdminCompanies();

  const dsfrTextFieldSlotProps = (id, label) => ({
    id,
    label,
    variant: "standard",
    required: true,
    error: !!dateRangeError,
    helperText: dateRangeError,
    sx: {
      "& .MuiFormLabel-asterisk": {
        display: "none",
      },
    },
    InputProps: {
      disableUnderline: true,
      sx: {
        padding: 0,
        "&.MuiInputBase-formControl": {
          marginTop: 0,
        },
        "& .MuiInputBase-input": {
          fontFamily: "inherit",
        },
      },
    },
    inputProps: {
      className: "fr-input",
    },
    InputLabelProps: {
      shrink: true,
      className: "fr-sr-only",
    },
    FormHelperTextProps: {
      className: "fr-error-text",
      sx: {
        position: "absolute",
        bottom: "-22px",
        left: 0,
        color: "error.main",
        fontSize: "0.75rem",
        margin: 0,
        whiteSpace: "nowrap",
      },
    },
  });

  const renderPickersDay = (pickersDayProps) => {
    const { key, ...safeProps } = pickersDayProps;
    return <PickersDay {...safeProps} />;
  };

  const today = new Date();
  // 1-year limit to avoid performance issues
  const maxAllowedEndDate = minDate ? addDays(new Date(minDate), 365) : today;

  const handleTeamFilterChange = (newTeams) => {
    const usersToSelect = getUsersToSelectFromTeamSelection(newTeams, users);
    adminStore.dispatch({
      type: ADMIN_ACTIONS.updateActivitiesFilters,
      payload: { teams: newTeams, users: usersToSelect },
    });
  };

  const handleUserFilterChange = (newUsers) => {
    const unselectedTeams = unselectAndGetAllTeams(teams);
    adminStore.dispatch({
      type: ADMIN_ACTIONS.updateActivitiesFilters,
      payload: { teams: unselectedTeams, users: newUsers },
    });
  };

  return (
    <div
      role="toolbar"
      aria-label="Filtres des activités"
      className={classes.filterGrid}
    >
      {teams?.length > 0 && (
        <div>
          <TeamFilter teams={teams} setTeams={handleTeamFilterChange} />
        </div>
      )}
      <div>
        <EmployeeFilter users={users} setUsers={handleUserFilterChange} />
      </div>
      <div>
        <PeriodToggle period={period} setPeriod={setPeriod} />
      </div>
      <div
        className={`${classes.datePickerSection} fr-input-group${
          dateRangeError ? " fr-input-group--error" : ""
        }`}
        style={{'margin': 0}}
      >
        Du
        <MobileDatePicker
          value={new Date(minDate)}
          inputFormat="d MMMM yyyy"
          fullWidth
          disableCloseOnSelect={false}
          disableMaskedInput={true}
          onAccept={(val) => {
            trackEvent(ACTIVITY_FILTER_MIN_DATE);
            setMinDate(isoFormatLocalDate(val));
          }}
          cancelText={null}
          maxDate={today}
          slotProps={{
            textField: dsfrTextFieldSlotProps("activities-min-date", "Début"),
          }}
          // renderDay is needed to fix issue caused by key being passed with props
          renderDay={renderPickersDay}
        />
      </div>
      <div
        className={`${classes.datePickerSection} fr-input-group${
          dateRangeError ? " fr-input-group--error" : ""
        }`}
        style={{'margin': 0}}
      >
        au
        <MobileDatePicker
          value={new Date(maxDate)}
          inputFormat="d MMMM yyyy"
          fullWidth
          disableCloseOnSelect={false}
          disableMaskedInput={true}
          onAccept={(val) => {
            trackEvent(ACTIVITY_FILTER_MAX_DATE);
            setMaxDate(isoFormatLocalDate(val));
          }}
          cancelText={null}
          maxDate={maxAllowedEndDate > today ? today : maxAllowedEndDate}
          slotProps={{
            textField: dsfrTextFieldSlotProps("activities-max-date", "Fin"),
          }}
          // renderDay is needed to fix issue caused by key being passed with props
          renderDay={renderPickersDay}
        />
      </div>
      <div>
        <Button
          onClick={(e) => setExportMenuAnchorEl(e.currentTarget)}
          size="medium"
        >
          Exporter
        </Button>
        <Menu
          keepMounted
          open={Boolean(exportMenuAnchorEl)}
          onClose={() => setExportMenuAnchorEl(null)}
          anchorEl={exportMenuAnchorEl}
        >
          <MenuItem
            onClick={() => {
              setExportMenuAnchorEl(null);
              trackEvent(ADMIN_EXPORT_EXCEL);
              modals.open("dataExport", {
                companies,
                initialUsers: adminStore.exportFilters.users,
                initialTeams: adminStore.exportFilters.teams,
                defaultCompany: company,
                defaultMinDate: minDate ? new Date(minDate) : null,
                defaultMaxDate: maxDate
                  ? new Date(maxDate)
                  : startOfDayAsDate(new Date()),
                getUsersSinceDate,
              });
            }}
          >
            <ListItemIcon>
              <SvgIcon viewBox="0 0 64 64" component={ExcelIcon} />
            </ListItemIcon>
            <span>Export Excel</span>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setExportMenuAnchorEl(null);
              trackEvent(ADMIN_EXPORT_C1B);
              modals.open("tachographExport", {
                companies,
                initialUsers: adminStore.exportFilters.users,
                initialTeams: adminStore.exportFilters.teams,
                defaultCompany: company,
                defaultMinDate: minDate ? new Date(minDate) : null,
                defaultMaxDate: maxDate
                  ? new Date(maxDate)
                  : startOfDayAsDate(new Date()),
                getUsersSinceDate,
              });
            }}
          >
            <ListItemIcon>
              <SvgIcon viewBox="0 0 640 512" component={TachoIcon} />
            </ListItemIcon>
            <span>Export C1B</span>
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
};

export default ActivitiesPanelFilters;
