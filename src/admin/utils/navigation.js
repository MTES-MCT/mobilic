import React from "react";
import { ActivityPanel } from "../panels/Activities";

export const ADMIN_VIEWS = [
  {
    label: "Employés",
    route: "/employees",
    component: "null"
  },
  {
    label: "Véhicules",
    route: "/vehicles",
    component: "null"
  },
  {
    label: "Activités",
    route: "/activities",
    isDefault: true,
    component: <ActivityPanel />
  }
];
