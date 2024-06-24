import React from "react";
import { useUpdateEmployeeBusinessType } from "../../common/useUpdateBusiness";
import { Select } from "@dataesr/react-dsfr";

const BUSINESS_TYPES = [
  {
    value: "LONG_DISTANCE",
    label: "TRM - Longue distance"
  },
  {
    value: "SHORT_DISTANCE",
    label: "TRM - Courte distance"
  },
  {
    value: "SHIPPING",
    label: "TRM - Messagerie, Fonds et valeur"
  },
  {
    value: "FREQUENT",
    label: "TRV - Lignes régulières"
  },
  {
    value: "INFREQUENT",
    label: "TRV - Occasionnels"
  }
];
export function BusinessDropdown({ employmentId, companyId, business }) {
  const { udpateEmployeeBusinessType } = useUpdateEmployeeBusinessType(
    employmentId,
    companyId
  );

  return (
    <Select
      options={[
        ...(!business?.businessType
          ? [{ value: "", label: "Non renseigné" }]
          : []),
        ...BUSINESS_TYPES
      ]}
      selected={business?.businessType || ""}
      onChange={e => udpateEmployeeBusinessType(e.target.value)}
      aria-label="Type d'activité"
    />
  );
}
