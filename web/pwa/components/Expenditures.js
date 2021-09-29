import React from "react";
import Checkbox from "@material-ui/core/Checkbox";
import { EXPENDITURES } from "common/utils/expenditures";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText/ListItemText";
import List from "@material-ui/core/List";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { formatDay } from "common/utils/time";
import Box from "@material-ui/core/Box";
import { Collapse } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  expenditure: {
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: theme.spacing(0.25),
    marginBottom: theme.spacing(0.25),
    backgroundColor: theme.palette.background.default,
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    width: "100%"
  },
  selected: {
    backgroundColor: theme.palette.primary.lighter
  },
  singleExpenditure: {
    paddingTop: 0,
    paddingBottom: 0,
    marginTop: theme.spacing(0.25),
    marginBottom: theme.spacing(0.25),
    display: "block"
  },
  daysList: {
    paddingTop: 0,
    paddingLeft: theme.spacing(4)
  },
  expenditureText: {
    textTransform: "capitalize"
  }
}));

export function Expenditures({
  expenditures,
  setExpenditures,
  listPossibleSpendingDays
}) {
  const classes = useStyles();
  return (
    <List>
      {Object.entries(EXPENDITURES).map(([expenditure, { label }]) => {
        const expCount = expenditures[expenditure]?.length || 0;
        return (
          <ListItem
            disableGutters
            key={expenditure}
            className={classes.singleExpenditure}
          >
            <Box
              className={`${classes.expenditure} ${expCount > 0 &&
                classes.selected}`}
              onClick={() => {
                setExpenditures({
                  ...expenditures,
                  [expenditure]: expCount > 0 ? [] : listPossibleSpendingDays
                });
              }}
            >
              <Checkbox checked={expCount > 0} color="default" />
              <ListItemText
                primaryTypographyProps={{
                  noWrap: true,
                  display: "block",
                  className: classes.expenditureText
                }}
                primary={label}
              />
            </Box>
            <Collapse in={listPossibleSpendingDays.length > 1 && expCount > 0}>
              <List className={classes.daysList}>
                {listPossibleSpendingDays.map(spendingDay => {
                  const isDaySelected = !!expenditures[expenditure]?.includes(
                    spendingDay
                  );
                  return (
                    <ListItem
                      disableGutters
                      className={`${classes.expenditure} ${isDaySelected &&
                        classes.selected}`}
                      key={spendingDay}
                      onClick={() => {
                        setExpenditures({
                          ...expenditures,
                          [expenditure]: isDaySelected
                            ? expenditures[expenditure].filter(
                                day => day !== spendingDay
                              )
                            : [...expenditures[expenditure], spendingDay]
                        });
                      }}
                    >
                      <Checkbox checked={isDaySelected} color="default" />
                      <ListItemText
                        primaryTypographyProps={{
                          noWrap: true,
                          display: "block",
                          className: classes.expenditureText
                        }}
                        primary={formatDay(spendingDay / 1000, true)}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Collapse>
          </ListItem>
        );
      })}
    </List>
  );
}
