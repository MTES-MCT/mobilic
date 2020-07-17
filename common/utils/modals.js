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

  open = (modalName, modalProps = {}, updateProps = () => {}) => {
    this.setState(prevState => {
      return {
        [modalName]: {
          open: true,
          modalProps: {
            ...modalProps,
            ...updateProps(prevState[modalName].modalProps)
          }
        }
      };
    });
  };

  close = modalName => {
    this.setState({
      [modalName]: { open: false, modalProps: {} }
    });
  };

  closeAll = () => {
    this.setState(prevState =>
      Object.fromEntries(
        Object.keys(this.state).map(modalName => [
          modalName,
          { open: false, modalProps: {} }
        ])
      )
    );
  };

  render() {
    return (
      <>
        <ModalContext.Provider
          value={{
            open: this.open,
            close: this.close,
            closeAll: this.closeAll
          }}
        >
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
