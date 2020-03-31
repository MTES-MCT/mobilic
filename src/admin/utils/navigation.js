import React from "react";
import { ActivityPanel } from "../panels/Activities";
import { CompanyPanel } from "../panels/Company";

export const ADMIN_VIEWS = [
  {
    label: "Entreprise",
    route: "/company",
    component: <CompanyPanel />
  },
  {
    label: "Activités",
    route: "/activities",
    isDefault: true,
    component: <ActivityPanel />
  }
];
