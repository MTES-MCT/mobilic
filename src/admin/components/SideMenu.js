import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Link from "@material-ui/core/Link";
import makeStyles from "@material-ui/core/styles/makeStyles";
import useTheme from "@material-ui/core/styles/useTheme";
import { useHistory, useRouteMatch } from "react-router-dom";

const menuItemStyles = makeStyles(theme => ({
  root: {
    width: "100%",
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    display: "block",
    "&:hover": {
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.background.default
    }
  },
  active: {
    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.main} 5px, ${theme.palette.background.default} 5px, ${theme.palette.background.default})`
  }
}));

function MenuItem({ label, route }) {
  const history = useHistory();
  const classes = menuItemStyles();
  const selected = useRouteMatch(route);
  return (
    <ListItem className="no-margin-no-padding">
      <Link
        className={`${classes.root} ${selected ? classes.active : ""}`}
        variant="body1"
        color="inherit"
        href={route}
        underline="none"
        onClick={e => {
          e.preventDefault();
          history.push(route);
        }}
      >
        {label}
      </Link>
    </ListItem>
  );
}

export function SideMenu({ views }) {
  const theme = useTheme();
  return (
    <List
      disablePadding
      className="side-menu-container"
      style={{ backgroundColor: theme.palette.background.paper }}
    >
      {views.map((view, index) => (
        <MenuItem key={index} {...view} />
      ))}
    </List>
  );
}
