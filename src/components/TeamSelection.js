import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Dialog from '@material-ui/core/Dialog';
import Slide from "@material-ui/core/Slide";
import AppBar from "@material-ui/core/AppBar";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import Divider from "@material-ui/core/Divider";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Checkbox from "@material-ui/core/Checkbox";


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});


export function TeamSelectionModal ({ open, handleBack, handleContinue, coworkers, setCoworkers }) {
    const [updatedCoworkers, setUpdatedCoworkers] = React.useState([]);

    React.useEffect(() => setUpdatedCoworkers(coworkers), [open]);

    const pushNewCoworker = (firstName, lastName) =>  () => {
      setUpdatedCoworkers([
          ...updatedCoworkers,
          {
              firstName: firstName,
              lastName: lastName,
              isInCurrentTeam: true
          }
      ])
  };

  const toggleAddCoworkerToTeam = (id) => () => {
      const newCoworkers = updatedCoworkers.slice();
      updatedCoworkers[id].isInCurrentTeam = !updatedCoworkers[id].isInCurrentTeam;
      setUpdatedCoworkers(newCoworkers);
  };

  const removeCoworker = (id) => () => {
    const newCoworkers = updatedCoworkers.slice();
    newCoworkers.splice(id, 1);
    setUpdatedCoworkers(newCoworkers);
  };

    const [newTeamMemberName, setNewTeamMemberName] = React.useState("");
    const [newTeamMemberFirstName, setNewTeamMemberFirstName] = React.useState("");

    function handleTeamMemberSubmit (e) {
        e.preventDefault();
        pushNewCoworker(newTeamMemberFirstName, newTeamMemberName)();
        setNewTeamMemberName("");
        setNewTeamMemberFirstName("");
    }

    return (
        <Dialog fullScreen open={open} onClose={() => {}} TransitionComponent={Transition}>
        <div style={{position: "sticky", top: 0, zIndex: 1000}}>
            <AppBar style={{position: "relative"}}>
              <Toolbar className="team-modal-header">
                <IconButton edge="start" color="inherit" onClick={handleBack} >
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" >
                  Mon équipe
                </Typography>
                <Button
                    autoFocus
                    color="inherit"
                    onClick={() => {
                        setCoworkers(updatedCoworkers);
                        handleContinue();
                    }}
                >
                  OK
                </Button>
              </Toolbar>
            </AppBar>
            <form
                className="new-team-member-form"
                onSubmit={handleTeamMemberSubmit}
            >
              <TextField
                  label="Prénom"
                  className="new-team-member-text-field"
                  variant="outlined"
                  value={newTeamMemberFirstName}
                  onChange={(e) => setNewTeamMemberFirstName(e.target.value)}
              />
              <div style={{width: "2vw"}} />
              <TextField
                  label="Nom"
                  variant="outlined"
                  className="new-team-member-text-field"
                  value={newTeamMemberName}
                  onChange={(e) => setNewTeamMemberName(e.target.value)}
              />
              <IconButton
                  disabled={!newTeamMemberName || !newTeamMemberFirstName}
                  type="submit"
              >
                  <AddIcon />
              </IconButton>
            </form>
        </div>
        <List clasName="coworkers-list">
            {updatedCoworkers.map((member, index) => [
                <Divider key={2 * index} />,
                <ListItem key={2 * index + 1}>
                  <Checkbox checked={member.isInCurrentTeam} onChange={toggleAddCoworkerToTeam(index)} />
                  <ListItemText className="coworker-name"
                    primary={`${member.firstName} ${member.lastName}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={removeCoworker(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
            ])}
        </List>
      </Dialog>
    )
}
