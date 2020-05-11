import React from "react";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import Button from "@material-ui/core/Button";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { formatPersonName } from "common/utils/coworkers";
import withStyles from "@material-ui/core/styles/withStyles";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { useApi } from "common/utils/api";

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  const red = parseInt(result[1], 16);
  const green = parseInt(result[2], 16);
  const blue = parseInt(result[3], 16);
  return { red, green, blue };
}

function alterColorShade(hex, ratio) {
  const rgb = hexToRgb(hex);
  const modifiedRed = Math.min(rgb.red * ratio, 255);
  const modifiedGreen = Math.min(rgb.green * ratio, 255);
  const modifiedBlue = Math.min(rgb.blue * ratio, 255);
  return `rgb(${modifiedRed}, ${modifiedGreen}, ${modifiedBlue})`;
}

const OutlinedColorButton = withStyles(theme => ({
  root: props => ({
    color: theme.palette.getContrastText(props.backgroundColor),
    borderColor: theme.palette.getContrastText(props.backgroundColor),
    backgroundColor: props.backgroundColor,
    "&:hover": {
      backgroundColor: alterColorShade(props.backgroundColor, 1.2)
    }
  })
}))(Button);

export function AccountButton({ backgroundColor }) {
  const store = useStoreSyncedWithLocalStorage();
  const api = useApi();
  const ButtonComponent = backgroundColor ? OutlinedColorButton : Button;

  const [menuAnchor, setMenuAnchor] = React.useState(null);

  return [
    <ButtonComponent
      key={0}
      style={{ textTransform: "capitalize" }}
      startIcon={<AccountCircleIcon />}
      variant="outlined"
      color="primary"
      backgroundColor={backgroundColor}
      disableElevation
      onClick={e => setMenuAnchor(e.currentTarget)}
    >
      {formatPersonName(store.userInfo())}
    </ButtonComponent>,
    <Menu
      key={1}
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
  ];
}
