import React from "react";
import { ReactComponent as MarianneIcon } from "../assets/marianne.svg";
import { ReactComponent as BetaGouvTextIcon } from "../assets/betagouvfr.svg";
import SvgIcon from "@material-ui/core/SvgIcon";
import Typography from "@material-ui/core/Typography";
import { Header } from "./Header";
import Box from "@material-ui/core/Box";

export function LogosHeader() {
  return (
    <Header my={1} className="flexbox-flex-start">
      <Box mr={2}>
        <SvgIcon
          viewBox="0 0 1538 906"
          className="marianne-logo"
          component={MarianneIcon}
        />
      </Box>
      <Typography>mobilic</Typography>
      <SvgIcon
        viewBox="0 0 117 40"
        className="betagouv-text"
        component={BetaGouvTextIcon}
      />
    </Header>
  );
}
