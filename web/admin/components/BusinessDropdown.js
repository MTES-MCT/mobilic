import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import React from "react";
import { useUpdateEmployeeBusinessType } from "../../common/useUpdateBusiness";
import { BUSINESS_TYPES } from "common/utils/businessTypes";

export function BusinessDropdown({ employmentId, companyId, business }) {
  const { udpateEmployeeBusinessType } = useUpdateEmployeeBusinessType(
    employmentId,
    companyId
  );

  return (
    <Select
      value={business?.businessType || ""}
      onChange={e => udpateEmployeeBusinessType(e.target.value)}
      displayEmpty
      variant="standard"
      size="small"
    >
      <MenuItem value="">
        <em>Non renseigné</em>
      </MenuItem>
      {BUSINESS_TYPES.map(({ id, label }) => (
        <MenuItem key={`business_type_${id}`} value={id}>
          {label}
        </MenuItem>
      ))}
    </Select>
  );
}
