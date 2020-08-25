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
    accessible: ({ userInfo, companyInfo }) => userInfo.id && companyInfo.id,
    component: <App ScreenComponent={AppScreen} />
  },
  {
    path: "/admin",
    label: "Gestion entreprise",
    accessible: ({ userInfo, companyInfo }) => userInfo.id && companyInfo.admin,
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
      !userInfo.id || !userInfo.email || isSigningUp,
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
    accessible: ({ userInfo }) => !!userInfo.id,
    component: <RedeemInvite />,
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
  }
];

export function getFallbackRoute({ userInfo, companyInfo }) {
  if (userInfo.id && userInfo.email && companyInfo.admin) {
    return "/admin";
  }
  if (userInfo.id && userInfo.email && companyInfo.id) {
    return "/app";
  }
  if (userInfo.id && userInfo.email) {
    return "/home";
  }
  if (userInfo.id && !userInfo.email) {
    return "/signup/user_login";
  }
  return "/";
}

export function getAccessibleRoutes(storeData) {
  return ROUTES.filter(r => r.accessible(storeData));
}
