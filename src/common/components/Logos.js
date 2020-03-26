import React from "react";
import { ReactComponent as MarianneIcon } from "../assets/images/marianne.svg";
import { ReactComponent as BetaGouvTextIcon } from "../assets/images/betagouvfr.svg";
import SvgIcon from "@material-ui/core/SvgIcon";
import Typography from "@material-ui/core/Typography";
import { Header } from "./Header";
import Box from "@material-ui/core/Box";

export function LogosHeader() {
  return (
    <Header>
      <Logos />
    </Header>
  );
}

export function Logos() {
  return (
    <Box className="flexbox-flex-start">
      <Box mr={2}>
        <SvgIcon
          viewBox="0 0 1538 906"
          className="marianne-logo"
          component={MarianneIcon}
        />
      </Box>
      <Typography className="project-name">mobilic</Typography>
      <SvgIcon
        viewBox="0 0 117 40"
        className="betagouv-text"
        component={BetaGouvTextIcon}
      />
    </Box>
  );
}
