import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import Checkbox from "@material-ui/core/Checkbox";
import { Box } from "@material-ui/core";
import { FunnelModal, useStyles as useFunnelModalStyles } from "./FunnelModal";
import Container from "@material-ui/core/Container";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { MainCtaButton } from "./MainCtaButton";
import { EXPENDITURES } from "common/utils/expenditures";
import TextField from "@material-ui/core/TextField/TextField";

const useStyles = makeStyles(theme => ({
  expenditure: {
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
  expenditureText: {
    textTransform: "capitalize"
  },
  commentInput: {
    marginTop: theme.spacing(2)
  }
}));

export function EndMissionModal({ open, handleClose, handleMissionEnd }) {
  const [expenditures, setExpenditures] = React.useState({});
  const [comment, setComment] = React.useState("");

  const funnelModalClasses = useFunnelModalStyles();
  const classes = useStyles();

  return (
    <FunnelModal open={open} handleBack={handleClose}>
      <Container className="flex-column-space-between" style={{ flexGrow: 1 }}>
        <Container className="flex-column scrollable" disableGutters>
          <Typography className={funnelModalClasses.title} variant="h5">
            Avez-vous eu des frais lors de cette mission&nbsp;?
          </Typography>
          <List className="scrollable">
            {Object.entries(EXPENDITURES).map(([expenditure, { label }]) => (
              <ListItem
                disableGutters
                className={`${classes.expenditure} ${expenditures[
                  expenditure
                ] && classes.selected}`}
                key={expenditure}
                onClick={() => {
                  setExpenditures({
                    ...expenditures,
                    [expenditure]: expenditures[expenditure] ? 0 : 1
                  });
                }}
              >
                <Checkbox
                  checked={!!expenditures[expenditure]}
                  color="default"
                />
                <ListItemText
                  primaryTypographyProps={{
                    noWrap: true,
                    display: "block",
                    className: classes.expenditureText
                  }}
                  primary={label}
                />
              </ListItem>
            ))}
          </List>
          <Typography className={funnelModalClasses.title} variant="h5">
            Avez-vous un commentaire&nbsp;? (optionnel)
          </Typography>
          <TextField
            className={classes.commentInput}
            fullWidth
            label="Commentaire"
            variant="filled"
            multiline
            rows={4}
            rowsMax="10"
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
        </Container>
        <Box className="cta-container" mt={2} mb={4}>
          <MainCtaButton
            onClick={() => {
              handleMissionEnd(expenditures, comment);
              handleClose();
            }}
          >
            Suivant
          </MainCtaButton>
        </Box>
      </Container>
    </FunnelModal>
  );
}
