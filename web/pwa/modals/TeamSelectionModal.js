import React from "react";
import values from "lodash/values";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import {
  computeLatestEnrollmentStatuses,
  formatLatestEnrollmentStatus,
  formatPersonName
} from "common/utils/coworkers";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { makeStyles } from "@mui/styles";
import { MainCtaButton } from "../components/MainCtaButton";
import {
  FunnelModal,
  useStyles as useFunnelModalStyles
} from "../components/FunnelModal";

const useStyles = makeStyles(theme => ({
  teamMate: {
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
    backgroundColor: theme.palette.background.default,
    borderRadius: 4
  },
  selected: {
    backgroundColor: theme.palette.primary.lighter
  },
  addTeamMate: {
    marginTop: theme.spacing(1),
    textTransform: "none",
    alignSelf: "flex-start",
    textDecoration: "underline"
  }
}));

export default function TeamSelectionModal({
  open,
  mission,
  companyId = null,
  handleClose,
  closeOnContinue = false,
  handleContinue
}) {
  const funnelModalClasses = useFunnelModalStyles();
  const classes = useStyles();
  const [updatedCoworkers, setUpdatedCoworkers] = React.useState([]);

  const missionLatestEnrollmentStatuses = mission
    ? computeLatestEnrollmentStatuses(mission.teamChanges)
    : [];

  const restrictToCompanyId = mission
    ? mission.company
      ? mission.company.id
      : mission.companyId
    : companyId;

  const store = useStoreSyncedWithLocalStorage();
  let coworkers = values(store.getEntity("coworkers"));
  if (restrictToCompanyId) {
    coworkers = coworkers.filter(u =>
      u.companyIds.includes(restrictToCompanyId)
    );
  }

  const updatedCoworkersWithMissionEnrollmentStatuses = updatedCoworkers.map(
    coworker => {
      const coworkerEnrollmentStatus = values(
        missionLatestEnrollmentStatuses
      ).find(status => status.userId === coworker.id);
      return { ...coworker, latestEnrollmentStatus: coworkerEnrollmentStatus };
    }
  );

  // The component maintains a separate "updatedCoworkers" state,
  // so that pending changes to coworkers and current team can be either :
  // - discarded, i.e. not committed to main "coworkers" state (when hitting Back button)
  // - committed to main state (when hitting Ok button)
  // We sync the secondary state with the main one whenever the modal is opened/closed or the main state changes
  React.useEffect(() => {
    if (open) {
      // TODO : call the API to get the up-to-date list of enrollable coworkers
      setUpdatedCoworkers(coworkers.map(cw => ({ ...cw })));
    }
  }, [open]);

  const toggleAddCoworkerToTeam = (augmentedCoworker, index) => () => {
    const newCoworkers = updatedCoworkers.slice();
    const coworker = newCoworkers[index];
    if (coworker.enroll !== undefined) coworker.enroll = !coworker.enroll;
    else
      coworker.enroll = augmentedCoworker.latestEnrollmentStatus
        ? !augmentedCoworker.latestEnrollmentStatus.isEnrollment
        : true;
    setUpdatedCoworkers(newCoworkers);
  };

  const isTeamMateChecked = coworker => {
    // If the user explictly checked or unchecked the corresponding list item
    if (coworker.enroll === true || coworker.enroll === false)
      return coworker.enroll;
    // Otherwise return the enrollment status in the mission
    return (
      coworker.latestEnrollmentStatus &&
      coworker.latestEnrollmentStatus.isEnrollment
    );
  };

  return (
    <FunnelModal open={open} handleBack={handleClose}>
      <Container
        className="flex-column-space-between scrollable"
        style={{ flexGrow: 1 }}
      >
        <Container className="flex-column scrollable" disableGutters>
          <Typography className={funnelModalClasses.title} variant="h5">
            Qui sont vos coéquipiers&nbsp;?
          </Typography>
          <List dense className="scrollable">
            {updatedCoworkersWithMissionEnrollmentStatuses.map(
              (coworker, index) => (
                <ListItem
                  disableGutters
                  className={`${classes.teamMate} ${isTeamMateChecked(
                    coworker
                  ) && classes.selected}`}
                  key={index}
                  onClick={toggleAddCoworkerToTeam(coworker, index)}
                >
                  <Checkbox
                    checked={isTeamMateChecked(coworker) || false}
                    color="default"
                  />
                  <ListItemText
                    primaryTypographyProps={{ noWrap: true, display: "block" }}
                    primary={formatPersonName(coworker)}
                    secondaryTypographyProps={{
                      noWrap: true,
                      display: "block"
                    }}
                    secondary={
                      coworker.latestEnrollmentStatus
                        ? formatLatestEnrollmentStatus(
                            coworker.latestEnrollmentStatus
                          )
                        : ""
                    }
                  />
                </ListItem>
              )
            )}
          </List>
        </Container>
        <Box className="cta-container" mt={2} mb={4}>
          <MainCtaButton
            onClick={async () => {
              handleContinue(
                updatedCoworkersWithMissionEnrollmentStatuses.filter(
                  cw =>
                    (!cw.latestEnrollmentStatus && cw.enroll) ||
                    (cw.latestEnrollmentStatus &&
                      cw.enroll !== undefined &&
                      cw.enroll !== cw.latestEnrollmentStatus.isEnrollment)
                )
              );
              if (closeOnContinue) handleClose();
            }}
          >
            Continuer
          </MainCtaButton>
        </Box>
      </Container>
    </FunnelModal>
  );
}
