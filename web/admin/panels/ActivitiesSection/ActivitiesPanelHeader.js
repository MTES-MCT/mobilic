import React from "react";
import { LoadingButton } from "common/components/LoadingButton";
import { useAdminStore } from '../../store/store';
import { useLocation } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import { LogHolidayButton } from "../../../common/LogHolidayButton";
import { InactiveEmployeesDropdown} from '../../components/InactiveEmployeesDropdown';
import { ADMIN_ADD_MISSION, ADMIN_ADD_HOLIDAY } from "common/utils/matomoTags";
import { useMatomo } from "@datapunt/matomo-tracker-react";

const useStyles = makeStyles((theme) => ({
    pageHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },
    pageHeaderLeft: {
        display: "flex",
        alignItems: "center",
        gap: theme.spacing(2)
    },
    pageTitle: {
        fontSize: "1.5rem",
        fontWeight: 700,
        margin: 0,
        lineHeight: "2.5rem"
    },
}))


const ActivitiesPanelHeader = ({ setOpenLogHoliday, setOpenNewMission }) => {
  const classes = useStyles();
  const adminStore = useAdminStore();
  const location = useLocation();
  const { trackEvent } = useMatomo();


  return (
    <header className={classes.pageHeader}>
        <div className={classes.pageHeaderLeft}>
            <h1 className={classes.pageTitle}>
                Activités
            </h1>
            <LoadingButton
                priority="secondary"
                size="small"
                style={{ whiteSpace: "nowrap" }}
                onClick={() => {
                    trackEvent(ADMIN_ADD_MISSION);
                    setOpenNewMission(true);
                }}
                >
                Ajouter des activités
            </LoadingButton>
            <LogHolidayButton
                priority="secondary"
                size="small"
                style={{ whiteSpace: "nowrap" }}
                onClick={() => {
                    trackEvent(ADMIN_ADD_HOLIDAY);
                    setOpenLogHoliday(true);
                }}
            />
        </div>
        <InactiveEmployeesDropdown
          employments={adminStore.employments}
          workDays={adminStore.workDays}
          defaultOpen={location.state?.openInactiveDropdown}
        />
    </header>
  );
}       

export default ActivitiesPanelHeader;