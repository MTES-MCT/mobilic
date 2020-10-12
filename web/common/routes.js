import React from "react";
import App from "common/components/App";
import { AppScreen } from "../pwa/utils/navigation";
import { Admin } from "../admin/Admin";
import { Landing } from "../landing/landing";
import Signup from "../landing/signup/root";
import Login from "../landing/login";
import { Home } from "../home/AccountInfo";
import { Invite } from "../landing/invite";
import { RedeemInvite } from "../home/RedeemInvite";
import { FranceConnectCallback } from "../landing/signup/FranceConnectCallback";
import OAuth from "../landing/oauth/root";
import { Logout } from "../landing/logout";
import { ActivateEmail } from "../landing/signup/ActivateEmail";
import { RequestResetPassword, ResetPassword } from "../landing/ResetPassword";

export const ROUTES = [
  {
    path: "/fc-callback",
    label: "Callback France Connect",
    accessible: ({ userInfo }) => !userInfo.id,
    component: <FranceConnectCallback />,
    menuItemFilter: () => false
  },
  {
    path: "/app",
    label: "Saisie de temps",
    accessible: ({ userInfo, companyInfo }) =>
      userInfo.hasActivatedEmail && userInfo.id && companyInfo.id,
    component: <App ScreenComponent={AppScreen} />
  },
  {
    path: "/admin",
    label: "Gestion entreprise",
    accessible: ({ userInfo, companyInfo }) =>
      userInfo.hasActivatedEmail && userInfo.id && companyInfo.admin,
    component: <Admin />
  },
  {
    path: "/home",
    label: "Mes informations",
    accessible: ({ userInfo }) => !!userInfo.id,
    component: <Home />
  },
  {
    path: "/signup",
    label: "Inscription",
    accessible: ({ userInfo, isSigningUp }) =>
      !userInfo.id || !userInfo.hasConfirmedEmail || isSigningUp,
    component: <Signup />
  },
  {
    path: "/login",
    label: "Connexion",
    accessible: () => true,
    component: <Login />,
    menuItemFilter: ({ userInfo }) => !userInfo.id
  },
  {
    path: "/invite",
    label: "Invitation",
    accessible: () => true,
    component: <Invite />,
    menuItemFilter: () => false
  },
  {
    path: "/redeem_invite",
    label: "Redeem invite",
    accessible: () => true,
    component: <RedeemInvite />,
    menuItemFilter: () => false
  },
  {
    path: "/activate_email",
    label: "Activate email",
    accessible: () => true,
    component: <ActivateEmail />,
    menuItemFilter: () => false
  },
  {
    path: "/oauth/authorize",
    label: "OAuth",
    accessible: () => true,
    component: <OAuth />,
    menuItemFilter: () => false
  },
  {
    path: "/logout",
    label: "Logout",
    accessible: () => true,
    component: <Logout />,
    menuItemFilter: () => false
  },
  {
    path: "/",
    label: "Landing",
    accessible: ({ userInfo }) => !userInfo.id,
    exact: true,
    component: <Landing />,
    menuItemFilter: () => false
  },
  {
    path: "/reset_password",
    label: "Reset password",
    accessible: () => true,
    component: <ResetPassword />,
    menuItemFilter: () => false
  },
  {
    path: "/request_reset_password",
    label: "Reset password",
    accessible: ({ userInfo }) => !userInfo.id,
    component: <RequestResetPassword />,
    menuItemFilter: () => false
  }
];

export function getFallbackRoute({ userInfo, companyInfo }) {
  if (
    userInfo.id &&
    userInfo.hasConfirmedEmail &&
    userInfo.hasActivatedEmail &&
    companyInfo.admin
  ) {
    return "/admin";
  }
  if (
    userInfo.id &&
    userInfo.hasConfirmedEmail &&
    userInfo.hasActivatedEmail &&
    companyInfo.id
  ) {
    return "/app";
  }
  if (userInfo.id && userInfo.hasConfirmedEmail) {
    return "/home";
  }
  if (userInfo.id && !userInfo.hasConfirmedEmail) {
    return "/signup/user_login";
  }
  return "/";
}

export function getAccessibleRoutes(storeData) {
  return ROUTES.filter(r => r.accessible(storeData));
}
