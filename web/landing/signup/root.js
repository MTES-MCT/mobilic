import React from "react";
import Container from "@material-ui/core/Container";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { RoleSelection } from "./RoleSelection";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { AccountCreation } from "./AccountCreation";
import {
  Switch,
  Route,
  Redirect,
  useRouteMatch,
  useLocation
} from "react-router-dom";
import { Header } from "../../common/Header";
import { CompanySignup } from "./CompanySignup";
import { Complete } from "./Complete";
import { loadEmployeeInvite } from "../../common/loadEmployeeInvite";
import { useApi } from "common/utils/api";
import { EmailSelection } from "./EmailSelection";

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(7),
    margin: "auto",
    flexGrow: 1
  }
}));

export default function Signup() {
  // const [autorisationCode, setAutorisationCode] = React.useState(null);

  const store = useStoreSyncedWithLocalStorage();
  const api = useApi();
  const employeeInvite = store.employeeInvite();

  const location = useLocation();

  React.useEffect(() => {
    const queryString = new URLSearchParams(location.search);
    const autorisationCode = queryString.get("autorisation_code");
    if (autorisationCode) {
      // setAutorisationCode(autorisationCode);
      store.setIsSigningUp();
    }
    if (!employeeInvite) {
      const token = queryString.get("token");
      if (token) {
        loadEmployeeInvite(token, store, api, () => {});
      }
    }
  }, [location]);

  const classes = useStyles();

  const path = useRouteMatch().path;

  const userId = store.userId();
  const userInfo = store.userInfo();

  return (
    <>
      <Header />
      <Container className={classes.container} maxWidth="md">
        <Switch>
          {!userId && (
            <Route key="user" path={`${path}/user`}>
              <AccountCreation
                isAdmin={false}
                employeeInvite={employeeInvite}
              />
            </Route>
          )}
          {!userId && (
            <Route key="admin" path={`${path}/admin`}>
              <AccountCreation isAdmin={true} />
            </Route>
          )}
          {userId && !userInfo.email && (
            <Route key="user_login" path={`${path}/user_login`}>
              <EmailSelection />
            </Route>
          )}
          {userId && userInfo.email && (
            <Route key="company" path={`${path}/company`}>
              <CompanySignup />
            </Route>
          )}
          {userId && userInfo.email && (
            <Route key="completion" path={`${path}/complete`}>
              <Complete />
            </Route>
          )}
          {!userId && (
            <Route exact key="role" path={`${path}`}>
              <RoleSelection />
            </Route>
          )}
          <Redirect push key="default" from="*" to={`${path}`} />
        </Switch>
      </Container>
    </>
  );
}
