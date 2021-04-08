import React from "react";

export const ADMIN_VIEWS = [
  {
    label: "Entreprise(s)",
    path: "/company",
    component: React.lazy(() => import("../panels/Company")),
    isDefault: true
  },
  {
    label: "Activités",
    path: "/activities",
    component: React.lazy(() => import("../panels/Activities"))
  },
  {
    label: "Saisies à valider",
    path: "/validations",
    component: React.lazy(() => import("../panels/Validations"))
  }
];
