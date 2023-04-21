import React from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { CONTROLLER_ROUTE_PREFIX } from "../../../common/routes";

export function ControllerControlNoLicTopMenu() {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ p: 2 }}
      justifyContent="space-between"
      alignItems="center"
    >
      <div>
        <Link
          className={classNames(
            "fr-link",
            "fr-fi-arrow-left-line",
            "fr-link--icon-left"
          )}
          to={CONTROLLER_ROUTE_PREFIX + "/home"}
        >
          Fermer
        </Link>
      </div>
      <Button
        color="primary"
        variant="outlined"
        size="small"
        onClick={() => {}}
      >
        Exporter le contrôle
      </Button>
    </Stack>
  );
}
