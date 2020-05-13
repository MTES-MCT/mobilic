import React from "react";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import Button from "@material-ui/core/Button";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { formatPersonName } from "common/utils/coworkers";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { useApi } from "common/utils/api";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Box from "@material-ui/core/Box";

const useStyles = makeStyles(theme => ({
  container: {
    width: "100%",
    textAlign: "right"
  },
  button: {
    color: darkBackground =>
      darkBackground
        ? theme.palette.primary.contrastText
        : theme.palette.primary.main,
    borderColor: darkBackground =>
      darkBackground
        ? theme.palette.primary.contrastText
        : theme.palette.primary.main
  }
}));

export function AccountButton(props) {
  const store = useStoreSyncedWithLocalStorage();
  const api = useApi();

  const [menuAnchor, setMenuAnchor] = React.useState(null);

  const classes = useStyles(props.darkBackground || false);

  const mergedProps = {
    ...props,
    className: `${classes.container} ${props.className}`
  };

  return (
    <Box {...mergedProps}>
      <Button
        style={{ textTransform: "capitalize" }}
        startIcon={<AccountCircleIcon />}
        variant="outlined"
        className={classes.button}
        disableElevation
        onClick={e => setMenuAnchor(e.currentTarget)}
      >
        {formatPersonName(store.userInfo())}
      </Button>
      <Menu
        anchorEl={menuAnchor}
        keepMounted
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            api.logout();
            setMenuAnchor(null);
          }}
        >
          Me déconnecter
        </MenuItem>
      </Menu>
    </Box>
  );
}
