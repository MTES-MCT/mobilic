import React from "react";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { useUpdateEmployeeBusinessType } from "../../common/useUpdateBusiness";
import { BUSINESS_TYPES } from "common/utils/businessTypes";

const toOptionValue = (transportType, businessType) =>
  `${transportType}__${businessType}`;

export function BusinessDropdown({ employmentId, companyId, business, disabled = false }) {
  const { udpateEmployeeBusinessType } = useUpdateEmployeeBusinessType(
    employmentId,
    companyId
  );

  const handleChange = optionValue => {
    const [transportType, businessType] = optionValue.split("__");
    udpateEmployeeBusinessType(businessType, transportType);
  };

  return (
    <Select
      disabled={disabled}
      nativeSelectProps={{
        onChange: e => handleChange(e.target.value),
        value:
          business?.transportType && business?.businessType
            ? toOptionValue(business.transportType, business.businessType)
            : ""
      }}
    >
      {!business?.businessType && (
        <option value="" disabled>
          Non renseigné
        </option>
      )}
      {BUSINESS_TYPES.map(businessType => (
        <option
          key={toOptionValue(businessType.transportType, businessType.value)}
          value={toOptionValue(businessType.transportType, businessType.value)}
        >
          {businessType.label}
        </option>
      ))}
    </Select>
  );
}
