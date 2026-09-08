import React from "react";
import { useLocation } from "react-router-dom";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";
import { JoinWebinarsCard } from "./JoinWebinarsCard";
import { getBadgeRoutes } from "../../../common/routes";
import { useAdminStore } from "../../store/store";
import Badge from "@codegouvfr/react-dsfr/Badge";

export function AdminSideMenu({ views }) {
  const { pathname } = useLocation();
  const adminStore = useAdminStore();
  const badgeRoutes = getBadgeRoutes(adminStore);
  const items = views.map(view => {
    const badge = badgeRoutes.find(br => br.path === view.path)?.badge;
    return {
      text: (
        <p
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 3,
            width: '100%',
            textWrap: "nowrap"
          }}
        >
          {view.label}
          {badge && (
            <Badge noIcon severity="error">
              {badge.badgeContent}
            </Badge>
          )}
        </p>
      ),
      isActive: pathname.startsWith(view.path),
      linkProps: {
        to: view.path
      }
    };
  });

  return (
    <div
      className="
        admin-side-menu
        fr-flex-direction-column
        fr-p-3w
      "
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}
    >
      <SideMenu
        align="left"
        items={items}
      />
      <JoinWebinarsCard />
    </div>
  );
}
