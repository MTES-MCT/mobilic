import React from "react";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { useUpdateEmployeeBusinessType } from "../../common/useUpdateBusiness";
import { BUSINESS_TYPES } from "common/utils/businessTypes";

export function BusinessDropdown({ employmentId, companyId, business }) {
  const { udpateEmployeeBusinessType } = useUpdateEmployeeBusinessType(
    employmentId,
    companyId
  );

  return (
    <></>
    // <Select
    //   label="Type d'activité"
    //   nativeSelectProps={{
    //     onChange: e => udpateEmployeeBusinessType(e.target.value),
    //     value: business?.businessType || ""
    //   }}
    // >
    //   {!business?.businessType && (
    //     <option value="" disabled>
    //       Non renseigné
    //     </option>
    //   )}
    //   {BUSINESS_TYPES.map(businessType => (
    //     <option key={businessType.value} value={businessType.value}>
    //       {businessType.label}
    //     </option>
    //   ))}
    // </Select>
  );
}
