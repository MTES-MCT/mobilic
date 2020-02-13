import React from "react";
import jwtDecode from "jwt-decode";

const LocalStorageContext = React.createContext(() => {});

export class LocalStorageContextProvider extends React.Component {
  constructor(props) {
    super(props);
    // What is stored in local storage and how to read/write to it
    this.mapper = {
      accessToken: {},
      refreshToken: {},
      companyAdmin: { deserialize: value => value === "true" },
      userId: { deserialize: value => (value ? parseInt(value) : value) }
    };

    // Init state from local storage
    this.state = {};
    Object.keys(this.mapper).forEach(entry => {
      this.mapper[entry] = {
        serialize: this.mapper[entry].serialize || (value => value),
        deserialize: this.mapper[entry].deserialize || (value => value)
      };
      const rawValueFromLS = localStorage.getItem(entry);
      this.state[entry] = this.mapper[entry].deserialize(rawValueFromLS);
    });
  }

  setItems = itemValueMap =>
    this.setState(itemValueMap, () =>
      Object.keys(itemValueMap).forEach(item => {
        localStorage.setItem(
          item,
          this.mapper[item].serialize(itemValueMap[item])
        );
      })
    );

  removeItems = items => {
    const itemValueMap = {};
    items.forEach(item => (itemValueMap[item] = null));
    this.setState(itemValueMap, () =>
      items.forEach(item => localStorage.removeItem(item))
    );
  };

  getAccessToken = () => this.state.accessToken;
  getRefreshToken = () => this.state.refreshToken;
  getUserId = () => this.state.userId;
  getCompanyAdmin = () => this.state.companyAdmin;

  storeTokens = ({ accessToken, refreshToken }) => {
    const { id, company_admin } = jwtDecode(accessToken).identity;
    this.setItems({
      accessToken,
      refreshToken,
      userId: id,
      companyAdmin: company_admin
    });
  };

  removeTokens = () => {
    this.removeItems(["accessToken", "refreshToken", "userId", "companyAdmin"]);
  };

  render() {
    return (
      <>
        <LocalStorageContext.Provider
          value={{
            storeTokens: this.storeTokens,
            getAccessToken: this.getAccessToken,
            getRefreshToken: this.getRefreshToken,
            getUserId: this.getUserId,
            getCompanyAdmin: this.getCompanyAdmin,
            removeTokens: this.removeTokens
          }}
        >
          {this.props.children}
        </LocalStorageContext.Provider>
      </>
    );
  }
}

export const useLocalStorage = () => React.useContext(LocalStorageContext);
