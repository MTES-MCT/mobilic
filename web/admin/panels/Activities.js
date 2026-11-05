import React, { useState, useEffect, useRef } from "react";
import Paper from "@mui/material/Paper";
import { makeStyles } from "@mui/styles";
import { WorkTimeTable } from "../components/WorkTimeTable";
import { useAdminStore } from "../store/store";
import { ADMIN_ACTIONS } from "../store/reducers/root";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import { useLoadAdminPanelData } from "../hooks/useLoadAdminPanelData";
import {
  ACTIVITY_FILTER_EMPLOYEE,
} from "common/utils/matomoTags";
import { usePageTitle } from "../../common/UsePageTitle";
import { fr } from "@codegouvfr/react-dsfr";
import ActivitiesPanelHeader from "./ActivitiesSection/ActivitiesPanelHeader";
import ActivitiesPanelFilters from "./ActivitiesSection/ActivitiesPanelFilters";
import { useActivitiesData } from "./ActivitiesSection/useActivitiesData";
import { useActivitiesWorkTimeEntries } from "./ActivitiesSection/useActivitiesWorkTimeEntries";
import LogHolidayDrawer from "./ActivitiesSection/LogHolidayDrawer";
import NewMissionDrawer from "./ActivitiesSection/NewMissionDrawer";
import useLoadMoreWorkDays from "./ActivitiesSection/useLoadMoreWorkDays";

const useStyles = makeStyles((theme) => ({
  container: {
    height: "100%",
    flexGrow: 1,
    border: "none"
  },
  workTimeTable: {
    overflowY: "hidden",
    flexGrow: 1,
    paddingTop: theme.spacing(1),
    "& .ReactVirtualized__Table__headerRow": {
      backgroundColor: fr.colors.decisions.background.contrastRaised.grey.default,
      borderTop: "none",
      borderBottom: `2px solid ${fr.colors.decisions.border.plain.grey.default}`
    }
  },
  workTimeTableContainer: {
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
    marginTop: theme.spacing(1)
  }
}));

function ActivitiesPanel() {
  usePageTitle("Activités - Mobilic");
  const adminStore = useAdminStore();
  const { trackEvent } = useMatomo();
  const { users, teams } = adminStore.activitiesFilters;
  const [period, setPeriod] = useState(
    adminStore.activitiesFilters.period
  );
  const [openNewMission, setOpenNewMission] = useState(false);
  const [openLogHoliday, setOpenLogHoliday] = useState(false);

  const { minDate, setMinDate, maxDate, setMaxDate, dateRangeError, loading, refreshCurrentWorkDays, company, companies, appliedDateRange } = useActivitiesData()
  const { isLoadingMoreWorkDays, loadMoreWorkDays} = useLoadMoreWorkDays({minDate, maxDate})


  useLoadAdminPanelData();

  useEffect(() => {
    adminStore.dispatch({
      type: ADMIN_ACTIONS.updateActivitiesFilters,
      payload: { period }
    });
  }, [period]);

  useEffect(() => {
    trackEvent(ACTIVITY_FILTER_EMPLOYEE);
  }, [users]);

  const {
    missionsById,
    workTimeEntries,
    handleShowDeletedMissions
  } = useActivitiesWorkTimeEntries({
    period,
    appliedDateRange,
  });

  const ref = useRef(null);

  const classes = useStyles();
  return (
    <Paper
      className={`scrollable ${classes.container}`}
      variant="outlined"
      ref={ref}
    >
      <ActivitiesPanelHeader
        setOpenLogHoliday={setOpenLogHoliday}
        setOpenNewMission={setOpenNewMission}
      />
      <ActivitiesPanelFilters
        teams={teams}
        users={users}
        period={period}
        setPeriod={setPeriod}
        minDate={minDate}
        setMinDate={setMinDate}
        maxDate={maxDate}
        setMaxDate={setMaxDate}
        dateRangeError={dateRangeError}
        companies={companies}
      />
      <div
        className={`flex-column ${classes.workTimeTableContainer}`}
        style={{ maxHeight: ref.current ? ref.current.clientHeight : 0 }}
      >
        <WorkTimeTable
          className={classes.workTimeTable}
          period={period}
          workTimeEntries={workTimeEntries}
          missionsById={missionsById}
          showExpenditures={adminStore.settings.requireExpenditures}
          showMissionName={adminStore.settings.requireMissionName}
          loading={loading}
          onDeletedStatusSelected={handleShowDeletedMissions}
          onLoadMore={loadMoreWorkDays}
          isLoadingMore={isLoadingMoreWorkDays}
        />
        <LogHolidayDrawer
          open={openLogHoliday}
          onClose={() => setOpenLogHoliday(false)}
          users={users}
          company={company}
          refreshCurrentWorkDays={refreshCurrentWorkDays}
        />
        <NewMissionDrawer
          open={openNewMission}
          onClose={() => setOpenNewMission(false)}
        />
      </div>
    </Paper>
  );
}

export default ActivitiesPanel;
