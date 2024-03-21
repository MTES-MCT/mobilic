import React from "react";
import { useHistory } from "react-router-dom";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

export function RegistrationLink() {
  const history = useHistory();

  return (
    <Typography my={2}>
      Pas encore de compte ?{" "}
      <Link
        href="/signup"
        onClick={e => {
          e.preventDefault();
          history.push("/signup");
        }}
      >
        {" "}
        Je m'inscris
      </Link>
    </Typography>
  );
}
