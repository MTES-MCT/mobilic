import React from "react";
import values from "lodash/values";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import Checkbox from "@material-ui/core/Checkbox";
import {
  computeLatestEnrollmentStatuses,
  formatLatestEnrollmentStatus,
  formatPersonName
} from "common/utils/coworkers";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { Box } from "@material-ui/core";
import { FunnelModal, useStyles as useFunnelModalStyles } from "./FunnelModal";
import Container from "@material-ui/core/Container";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { MainCtaButton } from "./MainCtaButton";

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

export function TeamSelectionModal({
  open,
  mission,
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

  const store = useStoreSyncedWithLocalStorage();
  const coworkers = values(store.getEntity("coworkers"));

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
