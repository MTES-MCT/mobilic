import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
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
        title="Sélectionner un employé"
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
