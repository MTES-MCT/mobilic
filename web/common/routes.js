import React from "react";
import App from "common/components/App";
import { AppScreen } from "../pwa/utils/navigation";
import { Admin } from "../admin/Admin";
import { Landing } from "../landing/landing";
import Signup from "../landing/signup/root";
import Login from "../landing/login";
import Stats from "../landing/stats";
import { Home } from "../home/AccountInfo";
import { Invite } from "../landing/invite";
import { RedeemInvite } from "../home/RedeemInvite";
import { FranceConnectCallback } from "../landing/signup/FranceConnectCallback";
import OAuth from "../landing/oauth/root";
import { Logout } from "../landing/logout";
import { ActivateEmail } from "../landing/signup/ActivateEmail";
import { RequestResetPassword, ResetPassword } from "../landing/ResetPassword";
import { ADMIN_VIEWS } from "../admin/utils/navigation";
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
    component: <FranceConnectCallback />,
    menuItemFilter: () => false
  },
  {
    path: "/app",
    label: "Saisie de temps",
    accessible: ({ userInfo, companies }) =>
      userInfo.hasActivatedEmail && userInfo.id && companies.length > 0,
    component: <App ScreenComponent={AppScreen} />,
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
    component: <Admin />,
    subRoutes: ADMIN_VIEWS
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
    accessible: () => true,
    component: <Signup />,
    menuItemFilter: ({ userInfo }) => !userInfo.id,
    mainCta: true
  },
  {
    path: "/login",
    label: "Connexion",
    accessible: () => true,
    component: <Login />,
    menuItemFilter: ({ userInfo }) => !userInfo.id
  },
  {
    path: "/stats",
    label: "Statistiques",
    accessible: () => true,
    component: <Stats />,
    menuItemFilter: () => false
  },
  {
    path: "/cgu",
    label: "CGU",
    accessible: () => true,
    component: <CGU />,
    menuItemFilter: () => false
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
    accessible: () => true,
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
  },
  {
    path: "/control/user-history/:token",
    label: "Historique de l'utilisateur",
    accessible: () => true,
    component: <UserReadRedirect />,
    menuItemFilter: () => false
  },
  {
    path: "/control/user-history",
    label: "Historique de l'utilisateur",
    accessible: () => true,
    component: <UserRead />,
    menuItemFilter: () => false
  },
  {
    path: "/control/verify-export",
    label: "Vérification d'intégrité",
    accessible: () => true,
    component: <XlsxVerifier />,
    menuItemFilter: () => false
  },
  {
    path: "/partners",
    label: "Partenaires",
    accessible: () => true,
    component: <Partners />,
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
