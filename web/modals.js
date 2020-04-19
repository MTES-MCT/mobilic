import React from "react";
import { FirstActivitySelectionModal } from "./pwa/components/FirstActivitySelection";
import { TeamSelectionModal } from "./pwa/components/TeamSelection";
import { ConfirmationModal } from "./common/Confirmation";
import { MissionSelectionModal } from "./pwa/components/MissionSelection";
import { DriverSelectionModal } from "./pwa/components/DriverSelection";
import { CommentInputModal } from "./pwa/components/CommentInput";
import { ActivityRevisionOrCreationModal } from "./pwa/components/ActivityRevision";
import { MissionChangeModal } from "./pwa/components/MissionChange";
import { VehicleBookingModal } from "./pwa/components/VehicleBooking";
import { DataExport } from "./admin/components/DataExport";

export const ModalContext = React.createContext(() => {});

export class ModalProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    Object.keys(props.modalDict).forEach(modalName => {
      this.state[modalName] = { open: false, modalProps: {} };
    });
  }

  open = (modalName, modalProps = {}) => {
    this.setState({
      [modalName]: { open: true, modalProps }
    });
  };

  close = modalName => {
    this.setState({
      [modalName]: { open: false, modalProps: {} }
    });
  };

  render() {
    return (
      <>
        <ModalContext.Provider value={{ open: this.open, close: this.close }}>
          {this.props.children}
          {Object.keys(this.props.modalDict).map((modalName, index) => {
            const Modal = this.props.modalDict[modalName];
            return (
              <Modal
                key={index}
                open={!!this.state[modalName].open}
                handleClose={() => this.close(modalName)}
                {...this.state[modalName].modalProps}
              />
            );
          })}
        </ModalContext.Provider>
      </>
    );
  }
}

export const MODAL_DICT = {
  firstActivity: FirstActivitySelectionModal,
  teamSelection: TeamSelectionModal,
  confirmation: ConfirmationModal,
  missionSelection: MissionSelectionModal,
  driverSelection: DriverSelectionModal,
  commentInput: CommentInputModal,
  activityRevision: ActivityRevisionOrCreationModal,
  missionChange: MissionChangeModal,
  vehicleBooking: VehicleBookingModal,
  dataExport: DataExport
};
