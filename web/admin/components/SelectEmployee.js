import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { CustomDialogTitle } from "../../common/CustomDialogTitle";
import { EmployeeFilter } from "./EmployeeFilter";

export default function SelectEmployeeModal({
  open,
  handleClose,
  users,
  handleSelect
}) {
  return (
    <Dialog onClose={handleClose} open={open}>
      <CustomDialogTitle
        title="Sélectionner un salarié"
        handleClose={handleClose}
      />
      <DialogContent>
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
      </DialogContent>
    </Dialog>
  );
}
