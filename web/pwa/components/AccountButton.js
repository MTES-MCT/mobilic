import React from "react";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import Button from "@material-ui/core/Button";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { formatPersonName } from "common/utils/coworkers";
import withStyles from "@material-ui/core/styles/withStyles";

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
  const ButtonComponent = backgroundColor ? OutlinedColorButton : Button;
  return (
    <ButtonComponent
      startIcon={<AccountCircleIcon />}
      variant="outlined"
      color="primary"
      backgroundColor={backgroundColor}
      disableElevation
    >
      {formatPersonName(store.userInfo())}
    </ButtonComponent>
  );
}
