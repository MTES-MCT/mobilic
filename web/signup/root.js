import React from "react";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { AccountCreation } from "./AccountCreation";
import {
  Switch,
  Route,
  Redirect,
  useRouteMatch,
  useLocation
} from "react-router-dom";
import { Complete } from "./Complete";
import { loadEmployeeInvite } from "../common/loadEmployeeInvite";
import { useApi } from "common/utils/api";
import { EmailSelection } from "./EmailSelection";
import { Header } from "../common/Header";
import { CompanySignup } from "./company/CompanySignup";
import { Main } from "../common/semantics/Main";

export default function Signup() {
  const store = useStoreSyncedWithLocalStorage();
  const api = useApi();
  const employeeInvite = store.employeeInvite();

  const location = useLocation();

  React.useEffect(() => {
    const queryString = new URLSearchParams(location.search);
    if (!employeeInvite) {
      const token = queryString.get("token");
      if (token) {
        loadEmployeeInvite(token, store, api, () => {});
      }
    }
  }, [location]);

  const path = useRouteMatch().path;

  const userId = store.userId();
  const userInfo = store.userInfo();

  function defaultRoute() {
    if (userId && userInfo.hasConfirmedEmail) {
      return "/signup/company?onboarding=true";
    }
    if (userId && !userInfo.hasConfirmedEmail) {
      return "/signup/user_login";
    }
    if (!userId) {
      return "/signup/role_selection";
    }
  }

  return (
    <>
      <Header />
      <Main>
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
          {userId && !userInfo.hasConfirmedEmail && (
            <Route key="user_login" path={`${path}/user_login`}>
              <EmailSelection />
            </Route>
          )}
          {userId && (
            <Route key="company" path={`${path}/company`}>
              <CompanySignup />
            </Route>
          )}
          {userId && (
            <Route key="completion" path={`${path}/complete`}>
              <Complete type="user" />
            </Route>
          )}
          {userId && (
            <Route key="company_completion" path={`${path}/company_complete`}>
              <Complete type="company" />
            </Route>
          )}
          <Route path="*" render={() => <Redirect to={defaultRoute()} />} />
        </Switch>
      </Main>
    </>
  );
}
