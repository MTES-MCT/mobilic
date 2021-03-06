import React from "react";
import { Landing } from "../landing/landing";
import Login from "../landing/login";
import Signup from "../landing/signup/root";
import Stats from "../landing/stats";
import Home from "../home/AccountInfo";
import { Invite } from "../landing/invite";
import { RedeemInvite } from "../home/RedeemInvite";
import { FranceConnectCallback } from "../landing/signup/FranceConnectCallback";
import { Logout } from "../landing/logout";
import { ActivateEmail } from "../landing/signup/ActivateEmail";
import { RequestResetPassword, ResetPassword } from "../landing/ResetPassword";
import { CGU } from "../landing/cgu";
import { UserRead } from "../control/UserRead";
import { XlsxVerifier } from "../control/VerifyXlsxSignature";
import { Partners } from "../landing/partners";
import { Redirect, useParams } from "react-router-dom";

function UserReadRedirect() {
  const { token } = useParams();

  return <Redirect to={`/control/user-history?token=${token}`} />;
}

export const ROUTES = [
  {
    path: "/fc-callback",
    label: "Callback France Connect",
    accessible: ({ userInfo }) => !userInfo.id,
    component: FranceConnectCallback,
    menuItemFilter: () => false
  },
  {
    path: "/app",
    label: "Saisie de temps",
    accessible: ({ userInfo, companies }) =>
      userInfo.hasActivatedEmail && userInfo.id && companies.length > 0,
    component: React.lazy(() => import("../pwa/utils/navigation")),
    subRoutes: [
      {
        path: "",
        label: "Saisie",
        exact: true
      },
      {
        path: "/history",
        label: "Historique"
      }
    ]
  },
  {
    path: "/admin",
    label: "Gestion entreprise",
    accessible: ({ userInfo, companies }) =>
      userInfo.hasActivatedEmail && userInfo.id && companies.some(c => c.admin),
    component: React.lazy(() => import("../admin/Admin")),
    subRoutes: [
      {
        path: "/company",
        label: "Entreprise(s)"
      },
      {
        path: "/activities",
        label: "Activités"
      },
      {
        label: "Saisies à valider",
        path: "/validations"
      }
    ]
  },
  {
    path: "/home",
    label: "Mes informations",
    accessible: ({ userInfo }) => !!userInfo.id,
    component: Home
  },
  {
    path: "/signup",
    label: "Inscription",
    accessible: () => true,
    component: Signup,
    menuItemFilter: ({ userInfo }) => !userInfo.id,
    mainCta: true
  },
  {
    path: "/login",
    label: "Connexion",
    accessible: () => true,
    component: Login,
    menuItemFilter: ({ userInfo }) => !userInfo.id
  },
  {
    path: "/stats",
    label: "Statistiques",
    accessible: () => true,
    component: Stats,
    menuItemFilter: () => false
  },
  {
    path: "/cgu",
    label: "CGU",
    accessible: () => true,
    component: CGU,
    menuItemFilter: () => false
  },
  {
    path: "/invite",
    label: "Invitation",
    accessible: () => true,
    component: Invite,
    menuItemFilter: () => false
  },
  {
    path: "/redeem_invite",
    label: "Redeem invite",
    accessible: () => true,
    component: RedeemInvite,
    menuItemFilter: () => false
  },
  {
    path: "/activate_email",
    label: "Activate email",
    accessible: () => true,
    component: ActivateEmail,
    menuItemFilter: () => false
  },
  {
    path: "/oauth/authorize",
    label: "OAuth",
    accessible: () => true,
    component: React.lazy(() => import("../landing/oauth/root")),
    menuItemFilter: () => false
  },
  {
    path: "/logout",
    label: "Logout",
    accessible: () => true,
    component: Logout,
    menuItemFilter: () => false
  },
  {
    path: "/",
    label: "Landing",
    accessible: () => true,
    exact: true,
    component: Landing,
    menuItemFilter: () => false
  },
  {
    path: "/reset_password",
    label: "Reset password",
    accessible: () => true,
    component: ResetPassword,
    menuItemFilter: () => false
  },
  {
    path: "/request_reset_password",
    label: "Reset password",
    accessible: ({ userInfo }) => !userInfo.id,
    component: RequestResetPassword,
    menuItemFilter: () => false
  },
  {
    path: "/control/user-history/:token",
    label: "Historique de l'utilisateur",
    accessible: () => true,
    component: UserReadRedirect,
    menuItemFilter: () => false
  },
  {
    path: "/control/user-history",
    label: "Historique de l'utilisateur",
    accessible: () => true,
    component: UserRead,
    menuItemFilter: () => false
  },
  {
    path: "/control/verify-export",
    label: "Vérification d'intégrité",
    accessible: () => true,
    component: XlsxVerifier,
    menuItemFilter: () => false
  },
  {
    path: "/partners",
    label: "Partenaires",
    accessible: () => true,
    component: Partners,
    menuItemFilter: () => false
  }
];

export function getFallbackRoute({ userInfo, companies }) {
  if (
    userInfo.id &&
    userInfo.hasConfirmedEmail &&
    userInfo.hasActivatedEmail &&
    companies.some(c => c.admin)
  ) {
    return "/admin";
  }
  if (
    userInfo.id &&
    userInfo.hasConfirmedEmail &&
    userInfo.hasActivatedEmail &&
    companies.length > 0
  ) {
    return "/app";
  }
  if (userInfo.id && userInfo.hasConfirmedEmail) {
    return "/home";
  }
  return "/";
}

export function getAccessibleRoutes(storeData) {
  return ROUTES.filter(r => r.accessible(storeData));
}

export function isAccessible(path, storeData) {
  return ROUTES.find(r => path.startsWith(r.path)).accessible(storeData);
}
