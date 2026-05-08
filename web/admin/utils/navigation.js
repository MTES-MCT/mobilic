import Home from "../panels/Home";
import Company from "../panels/Company";
import Activities from "../panels/Activities";
import Validations from "../panels/Validations";
import CertificationPanel from "../panels/CertificationPanel/CertificationPanel";
import RegulatoryRespectPanel from "../panels/RegulatoryRespect/RegulatoryRespectPanel";

export const ADMIN_VIEWS = [
  {
    label: "Accueil",
    path: "/home",
    component: Home,
    isDefault: true
  },
  {
    label: "Entreprise(s)",
    path: "/company",
    component: Company
  },
  {
    label: "Activités",
    path: "/activities",
    component: Activities
  },
  {
    label: "Saisies à valider",
    path: "/validations",
    component: Validations
  },
  {
    label: "Respect des seuils",
    path: "/regulatory-respect",
    component: RegulatoryRespectPanel
  },
  {
    label: "Certificat",
    path: "/certificate",
    component: CertificationPanel
  }
];
