import React from "react";
import MobilicLogoWithText from "common/assets/images/mobilic-logo-with-text.svg";
import Box from "@mui/material/Box";
import { LinkButton } from "./LinkButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
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
    <Box className="flex-row-flex-start">
      {(leaveSpaceForMenu
        ? shouldDisplayBothLogosAndMenu
        : shouldDisplayBothLogosWithoutMenu) && (
        <Box mr={2}>
          <MarianneIcon
            style={{ fontSize: shouldDisplayFullSizeLogo ? 60 : 40 }}
          />
        </Box>
      )}
      <LinkButton
        style={{ borderRadius: 0, textTransform: "none" }}
        to={getFallbackRoute({
          userInfo: store.userInfo(),
          controllerInfo: store.controllerInfo(),
          companies: store.companies()
        })}
      >
        <img alt="Mobilic" height={45} width={128} src={MobilicLogoWithText} />
      </LinkButton>
    </Box>
  );
}
