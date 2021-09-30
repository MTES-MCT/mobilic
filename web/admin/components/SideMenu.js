import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Link from "@material-ui/core/Link";
import Badge from "@material-ui/core/Badge";
import makeStyles from "@material-ui/core/styles/makeStyles";
import useTheme from "@material-ui/core/styles/useTheme";
import { useHistory, useRouteMatch } from "react-router-dom";
import { useAdminStore } from "../utils/store";
import { getBadgeRoutes } from "../../common/routes";

const menuItemStyles = makeStyles(theme => ({
  root: {
    width: "100%",
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(6),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    display: "block",
    "&:hover": {
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.background.default
    }
  },
  customBadge: {
    right: theme.spacing(-2)
  },
  active: {
    background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.main} 5px, ${theme.palette.background.default} 5px, ${theme.palette.background.default})`
  }
}));

function MenuItem({ label, path }) {
  const history = useHistory();
  const classes = menuItemStyles();
  const selected = useRouteMatch(path);
  const badgeContent = getBadgeRoutes(useAdminStore()).find(
    br => br.path === path
  )?.badgeContent;
  return (
    <ListItem className="no-margin-no-padding">
      <Link
        className={`${classes.root} ${selected ? classes.active : ""}`}
        variant="body1"
        color="inherit"
        href={path}
        underline="none"
        onClick={e => {
          e.preventDefault();
          history.push(path);
        }}
      >
        <Badge
          invisible={!badgeContent}
          badgeContent={badgeContent}
          color="error"
          classes={{ badge: classes.customBadge }}
        >
          {label}
        </Badge>
      </Link>
    </ListItem>
  );
}

export function SideMenu({ views }) {
  const theme = useTheme();

  return (
    <List
      disablePadding
      className={`side-menu-container`}
      style={{ backgroundColor: theme.palette.background.paper }}
    >
      {views.map((view, index) => (
        <MenuItem key={index} {...view} />
      ))}
    </List>
  );
}
