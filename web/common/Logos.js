import React from "react";
import { ReactComponent as MarianneIcon } from "common/assets/images/marianne.svg";
import { ReactComponent as BetaGouvTextIcon } from "common/assets/images/betagouvfr.svg";
import SvgIcon from "@material-ui/core/SvgIcon";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { LinkButton } from "./LinkButton";

export function Logos() {
  return (
    <LinkButton style={{ borderRadius: 0, textTransform: "none" }} href="/">
      <Box className="flex-row-flex-start">
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
    </LinkButton>
  );
}
