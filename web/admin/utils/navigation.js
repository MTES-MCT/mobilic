import Company from "../panels/Company";
import Activities from "../panels/Activities";
import Validations from "../panels/Validations";
import CertificationPanel from "../panels/CertificationPanel/CertificationPanel";

export const ADMIN_VIEWS = [
  {
    label: "Entreprise(s)",
    path: "/company",
    component: Company,
    isDefault: true
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
    label: "Certificat",
    path: "/certificate",
    component: CertificationPanel
  }
];
