import React from "react";
import Box from "@material-ui/core/Box";
import { ReactComponent as MarianneIcon } from "../assets/marianne.svg";
import { ReactComponent as BetaGouvTextIcon } from "../assets/betagouvfr.svg";
import SvgIcon from "@material-ui/core/SvgIcon";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import useTheme from "@material-ui/core/styles/useTheme";

export function LogosHeader() {
  const theme = useTheme();
  return (
    <Box
      className="header-container"
      style={{ backgroundColor: theme.palette.background.default }}
    >
      <Box my={1} className="logos">
        <SvgIcon
          viewBox="0 0 1538 906"
          className="marianne-logo"
          component={MarianneIcon}
        />
        <Typography>mobilic</Typography>
        <SvgIcon
          viewBox="0 0 117 40"
          className="betagouv-text"
          component={BetaGouvTextIcon}
        />
      </Box>
      <Divider className="full-width-divider" />
    </Box>
  );
}
