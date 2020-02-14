import React from "react";
import jwtDecode from "jwt-decode";
import { findDriverIndex } from "./coworkers";

const StoreSyncedWithLocalStorage = React.createContext(() => {});

export class StoreSyncedWithLocalStorageProvider extends React.Component {
  constructor(props) {
    super(props);
    // What is stored in local storage and how to read/write to it
    this.mapper = {
      accessToken: {},
      refreshToken: {},
      companyAdmin: { deserialize: value => value === "true" },
      userId: { deserialize: value => (value ? parseInt(value) : value) },
      userInfo: {
        serialize: JSON.stringify,
        deserialize: value => (value ? JSON.parse(value) : {})
      },
      coworkers: {
        serialize: JSON.stringify,
        deserialize: value => (value ? JSON.parse(value) : [])
      },
      activities: {
        serialize: JSON.stringify,
        deserialize: value => (value ? JSON.parse(value) : [])
      },
      expenditures: {
        serialize: JSON.stringify,
        deserialize: value => (value ? JSON.parse(value) : [])
      }
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

  setItems = (itemValueMap, callback = () => {}) =>
    this.setState(itemValueMap, () => {
      Object.keys(itemValueMap).forEach(item => {
        localStorage.setItem(
          item,
          this.mapper[item].serialize(itemValueMap[item])
        );
      });
      callback();
    });

  removeItems = items => {
    const itemValueMap = {};
    items.forEach(item => (itemValueMap[item] = null));
    this.setState(itemValueMap, () =>
      items.forEach(item => localStorage.removeItem(item))
    );
  };

  storeTokens = ({ accessToken, refreshToken }) =>
    new Promise(resolve => {
      const { id, company_admin } = jwtDecode(accessToken).identity;
      this.setItems(
        {
          accessToken,
          refreshToken,
          userId: id,
          companyAdmin: company_admin
        },
        resolve()
      );
    });

  removeTokens = () => {
    this.removeItems(["accessToken", "refreshToken", "userId", "companyAdmin"]);
  };

  setUserInfo = ({ firstName, lastName, companyId, companyName }) =>
    this.setItems({
      userInfo: { firstName, lastName, companyId, companyName }
    });

  setCoworkers = (coworkers, callback = () => {}) =>
    this.setItems({ coworkers }, callback);

  pushNewCoworkers = coworkers =>
    this.setItems({
      coworkers: [...this.state.coworkers, ...coworkers]
    });

  coworkersPendingSubmission = () => this.state.coworkers.filter(cw => !cw.id);

  activitiesPendingSubmission = () => this.state.activities.filter(a => !a.id);

  setActivities = activities => this.setItems({ activities });

  pushNewActivity = (
    activityType,
    team,
    mission,
    vehicleRegistrationNumber,
    driverIdx,
    callback = () => {}
  ) => {
    const newActivity = {
      type: activityType,
      eventTime: Date.now(),
      companyId: this.state.userInfo.companyId,
      mission: mission,
      vehicleRegistrationNumber: vehicleRegistrationNumber,
      team: team.map(tm => ({
        id: tm.id,
        firstName: tm.firstName,
        lastName: tm.lastName
      }))
    };
    if (driverIdx) newActivity.driverIdx = driverIdx;

    this.setItems(
      {
        activities: [...this.state.activities, newActivity]
      },
      callback
    );
  };

  setExpenditures = expenditures => this.setItems({ expenditures });

  pushNewExpenditure = (expenditureType, team, callback = () => {}) =>
    this.setItems(
      {
        expenditures: [
          ...this.state.expenditures,
          {
            type: expenditureType,
            eventTime: Date.now(),
            companyId: this.state.userInfo.companyId,
            team: team.map(tm => ({
              id: tm.id,
              firstName: tm.firstName,
              lastName: tm.lastName
            }))
          }
        ]
      },
      callback
    );

  expendituresPendingSubmission = () =>
    this.state.expenditures.filter(e => !e.id);

  render() {
    return (
      <>
        <StoreSyncedWithLocalStorage.Provider
          value={{
            storeTokens: this.storeTokens,
            accessToken: () => this.state.accessToken,
            refreshToken: () => this.state.refreshToken,
            userId: () => this.state.userId,
            companyAdmin: () => this.state.companyAdmin,
            removeTokens: this.removeTokens,
            setUserInfo: this.setUserInfo,
            userInfo: () => ({ id: this.state.userId, ...this.state.userInfo }),
            coworkers: () => this.state.coworkers,
            setCoworkers: this.setCoworkers,
            pushNewCoworkers: this.pushNewCoworkers,
            activities: () => this.state.activities,
            setActivities: this.setActivities,
            pushNewActivity: this.pushNewActivity,
            coworkersPendingSubmission: this.coworkersPendingSubmission,
            activitiesPendingSubmission: this.activitiesPendingSubmission,
            expenditures: () => this.state.expenditures,
            setExpenditures: this.setExpenditures,
            pushNewExpenditure: this.pushNewExpenditure,
            expendituresPendingSubmission: this.expendituresPendingSubmission
          }}
        >
          {this.props.children}
        </StoreSyncedWithLocalStorage.Provider>
      </>
    );
  }
}

export const useStoreSyncedWithLocalStorage = () =>
  React.useContext(StoreSyncedWithLocalStorage);
