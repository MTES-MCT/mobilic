import React from "react";
import MobilicLogoWithText from "common/assets/images/mobilic-logo-with-text.svg";
import Box from "@mui/material/Box";
import { LinkButton } from "./LinkButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { getFallbackRoute } from "./routes";
import { MarianneIcon } from "common/utils/icons";

export function Logos({ leaveSpaceForMenu = true, isMobile = false }) {
  const store = useStoreSyncedWithLocalStorage();
  const shouldDisplayBothLogosAndMenu = useMediaQuery("(min-width:350px)");
  const shouldDisplayBothLogosWithoutMenu = useMediaQuery("(min-width:300px)");
  return (
    <Box className="flex-row-flex-start">
      {(leaveSpaceForMenu
        ? shouldDisplayBothLogosAndMenu
        : shouldDisplayBothLogosWithoutMenu) && (
        <Box mr={isMobile ? 4 : 2}>
          <MarianneIcon style={{ fontSize: 75 }} />
        </Box>
      )}
      <LinkButton
        to={getFallbackRoute({
          userInfo: store.userInfo(),
          controllerInfo: store.controllerInfo(),
          companies: store.companies()
        })}
      >
        <img alt="Mobilic" height={54} width={96} src={MobilicLogoWithText} />
      </LinkButton>
    </Box>
  );
}
