import React from "react";
import { ReactComponent as BetaGouvTextIcon } from "common/assets/images/betagouvfr.svg";
import SvgIcon from "@material-ui/core/SvgIcon";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import { LinkButton } from "./LinkButton";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { getFallbackRoute } from "./routes";
import { MarianneIcon } from "common/utils/icons";

export function Logos({ leaveSpaceForMenu = true }) {
  const store = useStoreSyncedWithLocalStorage();
  const shouldDisplayBothLogosAndMenu = useMediaQuery("(min-width:350px)");
  const shouldDisplayBothLogosWithoutMenu = useMediaQuery("(min-width:300px)");
  const shouldDisplayFullSizeLogo = useMediaQuery(theme =>
    theme.breakpoints.up("sm")
  );
  return (
    <LinkButton
      style={{ borderRadius: 0, textTransform: "none" }}
      to={getFallbackRoute({
        userInfo: store.userInfo(),
        companies: store.companies()
      })}
    >
      <Box className="flex-row-flex-start">
        {(leaveSpaceForMenu
          ? shouldDisplayBothLogosAndMenu
          : shouldDisplayBothLogosWithoutMenu) && (
          <Box mr={2}>
            <MarianneIcon
              style={{ fontSize: shouldDisplayFullSizeLogo ? 60 : 40 }}
              className="marianne-logo"
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
