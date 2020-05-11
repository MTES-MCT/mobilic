import React from "react";
import Checkbox from "@material-ui/core/Checkbox";
import { EXPENDITURES } from "common/utils/expenditures";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText/ListItemText";
import List from "@material-ui/core/List";
import makeStyles from "@material-ui/core/styles/makeStyles";

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
  }
}));

export function Expenditures({ expenditures, setExpenditures }) {
  const classes = useStyles();
  return (
    <List>
      {Object.entries(EXPENDITURES).map(([expenditure, { label }]) => (
        <ListItem
          disableGutters
          className={`${classes.expenditure} ${expenditures[expenditure] &&
            classes.selected}`}
          key={expenditure}
          onClick={() => {
            setExpenditures({
              ...expenditures,
              [expenditure]: expenditures[expenditure] ? 0 : 1
            });
          }}
        >
          <Checkbox checked={!!expenditures[expenditure]} color="default" />
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
  );
}
