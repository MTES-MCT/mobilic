import React from "react";
import { FirstActivitySelectionModal } from "../../app/components/FirstActivitySelection";
import { TeamSelectionModal } from "../../app/components/TeamSelection";
import { ConfirmationModal } from "../components/Confirmation";
import { MissionSelectionModal } from "../../app/components/MissionSelection";
import { DriverSelectionModal } from "../../app/components/DriverSelection";
import { CommentInputModal } from "../../app/components/CommentInput";

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
        </ModalContext.Provider>
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
  commentInput: CommentInputModal
};
