import React from "react";
import { Link } from "../../common/LinkButton";
import { makeStyles } from "@mui/styles";
import Notice from "../../common/Notice";
import { OuterContainer } from "./OuterContainer";

const useStyles = makeStyles(() => ({
  loginLink: {
    whiteSpace: "nowrap",
  },
}));

export function LoginBanner() {
  const classes = useStyles();

  return (
    <OuterContainer>
      <Notice
        size="small"
        description={
          <Link variant="login" to="/login-selection">
            <span className={classes.loginLink}>Se connecter à mon espace</span>
          </Link>
        }
      />
    </OuterContainer>
  );
}
