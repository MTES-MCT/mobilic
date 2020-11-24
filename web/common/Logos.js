import React from "react";
import { ReactComponent as MarianneIcon } from "common/assets/images/marianne.svg";
import { ReactComponent as BetaGouvTextIcon } from "common/assets/images/betagouvfr.svg";
import SvgIcon from "@material-ui/core/SvgIcon";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { LinkButton } from "./LinkButton";
import useMediaQuery from "@material-ui/core/useMediaQuery";

export function Logos() {
  const shouldDisplayBothLogos = useMediaQuery("(min-width:350px)");
  const shouldDisplayFullSizeLogo = useMediaQuery(theme =>
    theme.breakpoints.up("sm")
  );
  return (
    <LinkButton style={{ borderRadius: 0, textTransform: "none" }} href="/">
      <Box className="flex-row-flex-start">
        {shouldDisplayBothLogos && (
          <Box mr={2}>
            <SvgIcon
              style={{ fontSize: shouldDisplayFullSizeLogo ? 70 : 50 }}
              viewBox="40 40 210 200"
              className="marianne-logo"
              component={MarianneIcon}
            />
          </Box>
        )}
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
