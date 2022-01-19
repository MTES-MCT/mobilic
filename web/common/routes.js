import React from "react";
import { Landing } from "../landing/root";
import Login from "../login/login";
import Signup from "../signup/root";
import Stats from "../landing/stats";
import Home from "../home/AccountInfo/AccountInfo";
import { Invite } from "../signup/invite";
import { RedeemInvite } from "../home/RedeemInvite";
import { FranceConnectCallback } from "../signup/FranceConnectCallback";
import { Logout } from "../login/logout";
import { ActivateEmail } from "../signup/ActivateEmail";
import { RequestResetPassword, ResetPassword } from "../login/ResetPassword";
import { CGU } from "../landing/cgu";
import { UserRead } from "../control/UserRead";
import { XlsxVerifier } from "../control/VerifyXlsxSignature";
import { Partners } from "../landing/partners";
import { Redirect, useParams } from "react-router-dom";
import { missionsToValidateByAdmin } from "../admin/selectors/missionSelectors";
import { ResourcePage } from "../landing/ResourcePage/ResourcePage";
import { AdminResourcePage } from "../landing/ResourcePage/AdminResourcePage";
import { DriverResourcePage } from "../landing/ResourcePage/DriverResourcePage";
import { ControllerResourcePage } from "../landing/ResourcePage/ControllerResourcePage";
import { RegulationPage } from "../landing/ResourcePage/RegulationPage";

function UserReadRedirect() {
  const { token } = useParams();

  return <Redirect to={`/control/user-history?token=${token}`} />;
}

export const RESOURCES_ROUTE = {
  label: "Ressources",
  path: "",
  accessible: () => true,
  subRoutes: [
    {
      path: "/resources/home",
      target: "_blank",
      label: "Documentation"
    },
    {
      to: "",
      label: "Foire aux questions",
      target: "_blank",
      href: "https://faq.mobilic.beta.gouv.fr/"
    }
  ]
};

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
    label: "Mes missions",
    accessible: ({ userInfo, companies }) =>
      userInfo.hasActivatedEmail && userInfo.id && companies.length > 0,
    component: React.lazy(() => import("../pwa/utils/navigation")),
    subRoutes: [
      {
        path: "",
        label: "Saisie de temps",
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
    component: React.lazy(() => import("../oauth/root")),
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
  },
  {
    path: "/resources/home",
    label: "Documentation",
    accessible: () => true,
    component: ResourcePage,
    menuItemFilter: () => false
  },
  {
    path: "/resources/driver",
    label: "Documentation travailleur mobile",
    accessible: () => true,
    component: DriverResourcePage,
    menuItemFilter: () => false
  },
  {
    path: "/resources/controller",
    label: "Documentation contrôleur",
    accessible: () => true,
    component: ControllerResourcePage,
    menuItemFilter: () => false
  },
  {
    path: "/resources/admin",
    label: "Documentation Gestionnaire",
    accessible: () => true,
    component: AdminResourcePage,
    menuItemFilter: () => false
  },
  {
    path: "/resources/regulations",
    label: "Réglementation",
    accessible: () => true,
    component: RegulationPage,
    menuItemFilter: () => false
  },
  {
    path: "/home",
    label: "Mes informations",
    accessible: () => true,
    menuItemFilter: () => false,
    component: Home
  },
  {
    path: "/logout",
    label: "Déconnexion",
    accessible: () => true,
    menuItemFilter: () => false,
    component: Logout
  },
  {
    label: "Mon compte",
    path: "",
    accessible: ({ userInfo }) => !!userInfo.id,
    subRoutes: [
      {
        path: "/home",
        label: "Mes informations"
      },
      {
        path: "/logout",
        label: "Déconnexion"
      }
    ]
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

export function getBadgeRoutes(adminStore) {
  return [
    {
      path: "/admin/validations",
      badgeContent: missionsToValidateByAdmin(adminStore)?.length
    }
  ];
}
