import React from "react";
import { Landing } from "../landing/root";
import Login from "../login/login";
import Signup from "../signup/root";
import Stats from "../landing/stats";
import Accessibility from "../landing/accessibility";
import PrivacyPolicy from "../landing/privacyPolicy";
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
import { ResourcePage } from "../landing/ResourcePage/ResourcePage";
import { AdminResourcePage } from "../landing/ResourcePage/AdminResourcePage";
import { DriverResourcePage } from "../landing/ResourcePage/DriverResourcePage";
import { ControllerResourcePage } from "../landing/ResourcePage/ControllerResourcePage";
import { RegulationPage } from "../landing/ResourcePage/RegulationPage";
import {
  entryToBeValidatedByAdmin,
  missionsToTableEntries
} from "../admin/selectors/validationEntriesSelectors";
import size from "lodash/size";
import groupBy from "lodash/groupBy";
import LoginController from "../login/login-controller";
import { AgentConnectCallback } from "../signup/AgentConnectCallback";
import { ControllerHome } from "../controller/components/home/ControllerHome";
import { ControllerScanQRCode } from "../controller/components/scanQRCode/ControllerScanQRCode";
import { ControllerQRCodeNotRecognized } from "../controller/components/scanQRCode/ControllerQRCodeNotRecognized";
import { ControllerHistory } from "../controller/components/history/ControllerHistory";
import { SyncEmployeeValidation } from "../login/SyncEmployeeValidation";
import { Certificate } from "../landing/certificate";

function UserReadRedirect() {
  const { token } = useParams();

  return <Redirect to={`/control/user-history?token=${token}`} />;
}

const RESOURCES_ROUTE = {
  label: "Ressources",
  path: "",
  accessible: ({ controllerInfo }) => !controllerInfo?.id,
  subRoutes: [
    {
      to: "",
      label: "Foire aux questions",
      target: "_blank",
      href: "https://faq.mobilic.beta.gouv.fr/"
    },
    {
      path: "/resources/home",
      target: "_blank",
      label: "Documentation"
    },
    {
      path: "/partners",
      label: "Partenaires"
    }
  ]
};

export const CERTIFICATE_ROUTE = {
  label: "Certificat",
  path: "/certificate",
  component: Certificate,
  accessible: () => true
};

export const CONTROLLER_ROUTE_PREFIX = "/controller";

export const ROUTES = [
  {
    path: "/fc-callback",
    label: "Callback France Connect",
    accessible: ({ userInfo }) => !userInfo?.id,
    component: FranceConnectCallback,
    menuItemFilter: () => false
  },
  {
    path: "/ac-callback",
    label: "Callback Agent Connect",
    accessible: ({ controllerInfo }) => !controllerInfo?.id,
    component: AgentConnectCallback,
    menuItemFilter: () => false
  },
  {
    path: "/app",
    label: "Mes missions",
    accessible: ({ userInfo }) => userInfo?.hasActivatedEmail && userInfo?.id,
    component: React.lazy(() => import("../pwa/utils/navigation")),
    subRoutes: [
      {
        accessible: ({ companies }) => companies?.length > 0,
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
      userInfo?.hasActivatedEmail &&
      userInfo?.id &&
      companies?.some(c => c.admin),
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
    menuItemFilter: ({ userInfo, controllerInfo }) =>
      !userInfo?.id && !controllerInfo?.id,
    mainCta: true
  },
  {
    path: "/login",
    label: "Connexion",
    accessible: () => true,
    component: Login,
    menuItemFilter: ({ userInfo, controllerInfo }) =>
      !userInfo?.id && !controllerInfo?.id
  },
  {
    path: "/controller-login",
    label: "Connexion Agent",
    accessible: () => true,
    component: LoginController,
    menuItemFilter: () => false
  },
  {
    path: "/stats",
    label: "Statistiques",
    accessible: () => true,
    component: Stats,
    menuItemFilter: () => false
  },
  {
    path: "/accessibility",
    label: "Déclaration d'accessibilité",
    accessible: () => true,
    component: Accessibility,
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
    path: "/privacy",
    label: "Gestion des cookies",
    accessible: () => true,
    component: PrivacyPolicy,
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
    path: "/sync_employee",
    label: "Rattachement d'un compte Mobilic",
    accessible: () => true,
    component: SyncEmployeeValidation,
    menuItemFilter: () => false
  },
  {
    path: "/request_reset_password",
    label: "Reset password",
    accessible: ({ userInfo, controllerInfo }) =>
      !userInfo?.id && !controllerInfo?.id,
    component: RequestResetPassword,
    menuItemFilter: () => false
  },
  {
    path: CONTROLLER_ROUTE_PREFIX + "/home",
    label: "Nouveau contrôle",
    accessible: ({ controllerInfo }) => {
      return controllerInfo?.id;
    },
    component: ControllerHome,
    menuItemFilter: () => false
  },
  {
    path: CONTROLLER_ROUTE_PREFIX + "/history",
    label: "Historique des contrôles",
    accessible: ({ controllerInfo }) => {
      return !!controllerInfo?.id;
    },
    component: ControllerHistory,
    menuItemFilter: () => false
  },
  {
    path: CONTROLLER_ROUTE_PREFIX + "/scan",
    label: "Scan QR Code",
    accessible: ({ controllerInfo }) => {
      return !!controllerInfo?.id;
    },
    component: ControllerScanQRCode,
    menuItemFilter: () => false
  },
  {
    path: CONTROLLER_ROUTE_PREFIX + "/scan_error",
    label: "Erreur de Scan QR Code",
    accessible: ({ controllerInfo }) => {
      return !!controllerInfo?.id;
    },
    component: ControllerQRCodeNotRecognized,
    menuItemFilter: () => false
  },
  {
    label: "Contrôles",
    path: CONTROLLER_ROUTE_PREFIX,
    accessible: ({ controllerInfo }) => !!controllerInfo?.id,
    menuItemFilter: () => true,
    subRoutes: [
      {
        path: "/home",
        label: "Nouveau contrôle"
      },
      {
        path: "/history",
        label: "Historique des contrôles"
      }
    ]
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
    path: "/certificate",
    label: "Recherche certification",
    accessible: () => true,
    component: Certificate,
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
  RESOURCES_ROUTE,
  {
    label: "Mon compte",
    path: "",
    accessible: ({ userInfo, controllerInfo }) =>
      !!userInfo?.id && !controllerInfo?.id,
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
  },
  {
    label: "Ressources",
    path: "",
    accessible: ({ controllerInfo }) => !!controllerInfo?.id,
    menuItemFilter: () => true,
    subRoutes: [
      {
        path: "/resources/controller",
        target: "_blank",
        label: "Documentation"
      },
      {
        href:
          "https://mobilic.gitbook.io/mobilic-faq-dediee-aux-corps-de-controle/",
        target: "_blank",
        label: "Foire aux questions"
      },
      {
        href: "https://mobilic.gitbook.io/natinf-expliques/",
        target: "_blank",
        label: "NATINFS expliqués"
      },
      {
        href:
          "https://tchap.gouv.fr/#/room/#SupportMobilicYNhe5wcTWWb:agent.dinum.tchap.gouv.fr",
        target: "_blank",
        label: "Forum Tchap"
      }
    ]
  },
  {
    path: "/logout",
    label: "Déconnexion",
    accessible: ({ controllerInfo }) => !!controllerInfo?.id,
    menuItemFilter: () => true,
    component: Logout
  }
];

export function getFallbackRoute({ userInfo, companies, controllerInfo }) {
  if (userInfo?.id) {
    if (
      userInfo.hasConfirmedEmail &&
      userInfo.hasActivatedEmail &&
      companies.some(c => c.admin)
    ) {
      return "/admin";
    }
    if (
      userInfo.hasConfirmedEmail &&
      userInfo.hasActivatedEmail &&
      companies.length > 0
    ) {
      return "/app";
    }
    if (userInfo.hasConfirmedEmail) {
      return "/home";
    }
  }
  if (controllerInfo?.id) {
    return CONTROLLER_ROUTE_PREFIX + "/home";
  }
  return "/";
}

export function getAccessibleRoutes(storeData) {
  return ROUTES.filter(r => r.accessible(storeData));
}

export function isAccessible(path, storeData) {
  return ROUTES.find(r => path.startsWith(r.path)).accessible(storeData);
}

export function getBadgeRoutes(
  adminStore,
  companyWithCertificationInfo,
  shouldDisplayBadge
) {
  const entries = missionsToTableEntries(adminStore).filter(entry =>
    entryToBeValidatedByAdmin(entry, adminStore?.userId)
  );

  const badgeRoutes = [
    {
      path: "/admin/validations",
      badge: {
        badgeContent: size(groupBy(entries, "missionId")),
        color: "error"
      }
    }
  ];

  if (shouldDisplayBadge) {
    const certificateBadge = getCertificateBadge(companyWithCertificationInfo);
    if (certificateBadge) {
      badgeRoutes.push({
        path: "/admin/company",
        badge: certificateBadge
      });
    }
  }

  return badgeRoutes;
}

export function getCertificateBadge(companyWithCertificationInfo) {
  let color = null;
  if (companyWithCertificationInfo.hasNoActivity) {
    color = "error";
  } else if (!companyWithCertificationInfo.certificateCriterias?.creationTime) {
    return null;
  } else if (!companyWithCertificationInfo.isCertified) {
    color = "error";
  } else {
    const currentCriterias = companyWithCertificationInfo.certificateCriterias;
    if (
      !currentCriterias.beActive ||
      !currentCriterias.beCompliant ||
      !currentCriterias.logInRealTime ||
      !currentCriterias.notTooManyChanges ||
      !currentCriterias.validateRegularly
    ) {
      color = "warning";
    } else {
      color = "success";
    }
  }

  return {
    variant: "dot",
    color
  };
}
