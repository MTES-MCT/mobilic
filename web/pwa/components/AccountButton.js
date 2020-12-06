import React from "react";
import omit from "lodash/omit";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import Button from "@material-ui/core/Button";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { formatPersonName } from "common/utils/coworkers";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Box from "@material-ui/core/Box";
import { NavigationMenu } from "../../common/Header";

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

  const [openNavDrawer, setOpenNavDrawer] = React.useState(false);

  const classes = useStyles(props.darkBackground || false);

  const mergedProps = {
    ...omit(props, ["darkBackground"]),
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
        onClick={e => setOpenNavDrawer(!openNavDrawer)}
      >
        {formatPersonName(store.userInfo())}
      </Button>
      <NavigationMenu open={openNavDrawer} setOpen={setOpenNavDrawer} />
    </Box>
  );
}
