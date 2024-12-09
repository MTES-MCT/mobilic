import React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link } from "../../../common/LinkButton";

export function ControllerControlNbCard({
  label,
  buttonLabel,
  nbElem,
  onClick
}) {
  return (
    <Stack direction="column">
      <Typography>{label}</Typography>
      <Typography>{nbElem}</Typography>
      <Link
        to="#"
        color="primary"
        variant="body1"
        onClick={e => {
          e.preventDefault();
          onClick();
        }}
      >
        {buttonLabel}
      </Link>
    </Stack>
  );
}
