import React from "react";
import { EmployeeFilter } from "../components/EmployeeFilter";
import Modal from "../../common/Modal";

export default function SelectEmployeeModal({
  open,
  handleClose,
  users,
  handleSelect
}) {
  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title="Sélectionner un salarié"
      size="sm"
      content={
        <EmployeeFilter
          users={users}
          multiple={false}
          handleSelect={(e, v) => {
            if (v) {
              handleSelect(v);
              handleClose();
            }
          }}
        />
      }
    />
  );
}
