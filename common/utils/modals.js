import React from "react";

const ModalContext = React.createContext(() => {});

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

export const useModals = () => React.useContext(ModalContext);
