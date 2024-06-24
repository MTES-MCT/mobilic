import React from "react";
import { Select } from "@dataesr/react-dsfr";
import { useUpdateEmployeeBusinessType } from "../../common/useUpdateBusiness";
import { BUSINESS_TYPES } from "common/utils/businessTypes";

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
