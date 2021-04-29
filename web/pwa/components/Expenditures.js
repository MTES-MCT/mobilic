import React from "react";
import Checkbox from "@material-ui/core/Checkbox";
import { EXPENDITURES } from "common/utils/expenditures";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText/ListItemText";
import List from "@material-ui/core/List";
import makeStyles from "@material-ui/core/styles/makeStyles";
import RemoveIcon from "@material-ui/icons/Remove";
import AddIcon from "@material-ui/icons/Add";
import IconButton from "@material-ui/core/IconButton";

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

export function Expenditures({
  expenditures,
  setExpenditures,
  allowMultiple = false,
  maxCount = null
}) {
  const classes = useStyles();
  return (
    <List>
      {Object.entries(EXPENDITURES).map(([expenditure, { label, plural }]) => {
        const expCount = expenditures[expenditure] || 0;
        return (
          <ListItem
            disableGutters
            className={`${classes.expenditure} ${expCount > 0 &&
              classes.selected}`}
            key={expenditure}
            onClick={
              allowMultiple
                ? null
                : () => {
                    setExpenditures({
                      ...expenditures,
                      [expenditure]: expCount > 0 ? 0 : 1
                    });
                  }
            }
          >
            {allowMultiple ? (
              <IconButton>
                <RemoveIcon
                  onClick={() =>
                    setExpenditures({
                      ...expenditures,
                      [expenditure]: expCount > 0 ? expCount - 1 : 0
                    })
                  }
                />
              </IconButton>
            ) : (
              <Checkbox checked={!!expenditures[expenditure]} color="default" />
            )}
            <ListItemText
              primaryTypographyProps={{
                noWrap: true,
                display: "block",
                className: classes.expenditureText
              }}
              primary={
                allowMultiple
                  ? `${expCount} ${expCount > 1 ? plural : label}`
                  : label
              }
            />
            {allowMultiple && (
              <IconButton>
                <AddIcon
                  onClick={() =>
                    setExpenditures({
                      ...expenditures,
                      [expenditure]:
                        maxCount && expCount === maxCount
                          ? expCount
                          : expCount + 1
                    })
                  }
                />
              </IconButton>
            )}
          </ListItem>
        );
      })}
    </List>
  );
}
