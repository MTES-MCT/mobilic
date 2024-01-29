import React from "react";
import { FunnelModal } from "./FunnelModal";
import { LogHolidayForm } from "../../common/LogHolidayForm";

export default function LogHolidayModal({
  open,
  handleClose,
  handleContinue,
  companies
}) {
  return (
    <FunnelModal open={open} handleBack={handleClose}>
      <LogHolidayForm handleSubmit={handleContinue} companies={companies} />
    </FunnelModal>
  );
}
