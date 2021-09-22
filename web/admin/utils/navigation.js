import Company from "../panels/Company";
import Activities from "../panels/Activities";
import Validations from "../panels/Validations";

export function getAdminView(nbMissionToValidateByAdmin) {
  return [
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
      component: Validations,
      badgeContent: nbMissionToValidateByAdmin
    }
  ];
}
