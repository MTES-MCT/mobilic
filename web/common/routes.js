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

export const ROUTES = [
  {
    path: "/app",
    label: "Saisie de temps",
    accessible: ({ userInfo, companyInfo }) => userInfo.id && companyInfo.id,
    component: <App ScreenComponent={AppScreen} />,
    fallbackPriority: 2
  },
  {
    path: "/admin",
    label: "Gestion entreprise",
    accessible: ({ userInfo, companyInfo }) => userInfo.id && companyInfo.admin,
    component: <Admin />,
    fallbackPriority: 1
  },
  {
    path: "/home",
    label: "Mes informations",
    accessible: ({ userInfo }) => !!userInfo.id,
    component: <Home />,
    fallbackPriority: 3
  },
  {
    path: "/signup",
    label: "Inscription",
    accessible: ({ userInfo, isSigningUp }) => !userInfo.id || isSigningUp,
    component: <Signup />
  },
  {
    path: "/login",
    label: "Connexion",
    accessible: ({ userInfo }) => !userInfo.id,
    component: <Login />
  },
  {
    path: "/invite",
    label: "Invitation",
    accessible: () => true,
    component: <Invite />,
    noMenuItem: true
  },
  {
    path: "/redeem_invite",
    label: "Redeem invite",
    accessible: ({ userInfo }) => !!userInfo.id,
    component: <RedeemInvite />,
    noMenuItem: true
  },
  {
    path: "/",
    label: "Landing",
    accessible: ({ userInfo }) => !userInfo.id,
    component: <Landing />,
    noMenuItem: true,
    fallbackPriority: 4
  }
];

export function getFallbackRoute(store) {
  const sortedFallbackRoutes = ROUTES.filter(
    r => r.accessible(store) && !!r.fallbackPriority
  ).sort((r1, r2) => r1.fallbackPriority - r2.fallbackPriority);

  return sortedFallbackRoutes.length > 0 ? sortedFallbackRoutes[0].path : "/";
}

export function getAccessibleRoutes(storeData) {
  return ROUTES.filter(r => r.accessible(storeData));
}
