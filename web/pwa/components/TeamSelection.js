import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Dialog from "@material-ui/core/Dialog";
import Slide from "@material-ui/core/Slide";
import AppBar from "@material-ui/core/AppBar";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import Divider from "@material-ui/core/Divider";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Checkbox from "@material-ui/core/Checkbox";
import {
  formatPersonName
} from "common/utils/coworkers";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { Box } from "@material-ui/core";
import { formatTimeOfDay } from "common/utils/time";
import {FunnelModal, useStyles as useFunnelModalStyles} from "./FunnelModal";
import Container from "@material-ui/core/Container";
import makeStyles from "@material-ui/core/styles/makeStyles";

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
    backgroundColor: theme.palette.primary.light,
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
  const coworkers = store.coworkers();

  // The component maintains a separate "updatedCoworkers" state,
  // so that pending changes to coworkers and current team can be either :
  // - discarded, i.e. not committed to main "coworkers" state (when hitting Back button)
  // - committed to main state (when hitting Ok button)
  // We sync the secondary state with the main one whenever the modal is opened/closed or the main state changes
  React.useEffect(() => {
    setUpdatedCoworkers(coworkers.map(cw => ({ ...cw })));
  }, [open, coworkers]);

  const pushNewCoworker = (firstName, lastName) => () => {
    setUpdatedCoworkers([
      ...updatedCoworkers,
      {
        firstName: firstName,
        lastName: lastName,
        enroll: true
      }
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

  const removeCoworker = id => () => {
    const newCoworkers = updatedCoworkers.slice();
    newCoworkers.splice(id, 1);
    setUpdatedCoworkers(newCoworkers);
  };

  const [newTeamMemberName, setNewTeamMemberName] = React.useState("");
  const [newTeamMemberFirstName, setNewTeamMemberFirstName] = React.useState(
    ""
  );

  function handleTeamMemberSubmit(e) {
    e.preventDefault();
    pushNewCoworker(newTeamMemberFirstName, newTeamMemberName)();
    setNewTeamMemberName("");
    setNewTeamMemberFirstName("");
  }

  const isTeamMateChecked = (coworker) => coworker.enroll === true || (useCurrentEnrollment && coworker.enroll === undefined && !!coworker.joinedCurrentMissionAt);

  return (
    <FunnelModal
      open={open}
      handleBack={handleClose}
    >
      <Container className="flex-column scrollable">
        <Typography className={funnelModalClasses.title} variant="h5">Quels sont vos coéquipiers&nbsp;?</Typography>
        <Box pt={1} className="scrollable">
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
                      ? coworker.joinedCurrentMissionAt
                        ? `ajouté à ${formatTimeOfDay(coworker.joinedCurrentMissionAt)}`
                        : coworker.leftCurrentMissionAt
                          ? `retiré à ${formatTimeOfDay(coworker.leftCurrentMissionAt)}`
                          : ""
                      : ""
                  }
                />
              </ListItem>
            )}
          </List>
        </Box>
        <Box my={1} />
        <Box className="cta-container" mb={4}>
          <Button
            variant="contained"
            color="primary"
            onClick={async () => handleContinue(updatedCoworkers.filter(cw => cw.enroll !== undefined))}
          >
            Continuer
          </Button>
        </Box>
      </Container>
    </FunnelModal>
  );
}
