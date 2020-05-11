import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import {
  formatLatestEnrollmentInfo,
  formatPersonName
} from "common/utils/coworkers";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { Box } from "@material-ui/core";
import {FunnelModal, useStyles as useFunnelModalStyles} from "./FunnelModal";
import Container from "@material-ui/core/Container";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {useModals} from "common/utils/modals";
import {MainCtaButton} from "./MainCtaButton";

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
    backgroundColor: theme.palette.primary.lighter,
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
  useCurrentEnrollment,
  handleClose,
  handleContinue
}) {
  const funnelModalClasses = useFunnelModalStyles();
  const classes = useStyles();
  const [updatedCoworkers, setUpdatedCoworkers] = React.useState([]);

  const store = useStoreSyncedWithLocalStorage();
  const modals = useModals();
  const coworkers = store.coworkers();

  // The component maintains a separate "updatedCoworkers" state,
  // so that pending changes to coworkers and current team can be either :
  // - discarded, i.e. not committed to main "coworkers" state (when hitting Back button)
  // - committed to main state (when hitting Ok button)
  // We sync the secondary state with the main one whenever the modal is opened/closed or the main state changes
  React.useEffect(() => {
    setUpdatedCoworkers(coworkers.map(cw => ({ ...cw })));
  }, [open, coworkers]);

  const pushNewCoworker = (firstName, lastName) => {
    setUpdatedCoworkers([
      {
        firstName: firstName,
        lastName: lastName,
        enroll: true
      },
      ...updatedCoworkers
    ]);
  };

  const toggleAddCoworkerToTeam = id => () => {
    const newCoworkers = updatedCoworkers.slice();
    const coworker = newCoworkers[id];
    if (useCurrentEnrollment) {
      if (coworker.enroll !== undefined) coworker.enroll = undefined;
      else {
        coworker.enroll = !coworker.joinedCurrentMissionAt;
      }
    } else {
      coworker.enroll = coworker.enroll ? undefined : true;
    }
    setUpdatedCoworkers(newCoworkers);
  };

  const isTeamMateChecked = (coworker) => coworker.enroll === true || (useCurrentEnrollment && coworker.enroll === undefined && !!coworker.joinedCurrentMissionAt);

  return (
    <FunnelModal
      open={open}
      handleBack={handleClose}
    >
      <Container className="flex-column-space-between scrollable" style={{flexGrow: 1}}>
        <Container className="flex-column scrollable" disableGutters>
          <Typography className={funnelModalClasses.title} variant="h5">Qui sont vos coéquipiers&nbsp;?</Typography>
          <Button
            className={classes.addTeamMate}
            color="primary"
            onClick={() => modals.open("newTeamMate", {handleSubmit: pushNewCoworker})}
          >
            Ajouter un coéquipier
          </Button>
            <List dense className="scrollable">
              {updatedCoworkers.map((coworker, index) =>
                <ListItem
                  disableGutters
                  className={`${classes.teamMate} ${isTeamMateChecked(coworker) && classes.selected}`}
                  key={index}
                  onClick={toggleAddCoworkerToTeam(index)}
                >
                  <Checkbox
                    checked={isTeamMateChecked(coworker)}
                    color="default"
                  />
                  <ListItemText
                    primaryTypographyProps={{ noWrap: true, display: "block" }}
                    primary={formatPersonName(coworker)}
                    secondaryTypographyProps={{ noWrap: true, display: "block" }}
                    secondary={
                      useCurrentEnrollment
                        ? formatLatestEnrollmentInfo(coworker)
                        : ""
                    }
                  />
                </ListItem>
              )}
            </List>
        </Container>
        <Box className="cta-container" mt={2} mb={4}>
          <MainCtaButton
            onClick={async () => handleContinue(updatedCoworkers.filter(cw => cw.enroll !== undefined))}
          >
            Continuer
          </MainCtaButton>
        </Box>
      </Container>
    </FunnelModal>
  );
}
