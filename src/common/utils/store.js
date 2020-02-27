import React from "react";
import jwtDecode from "jwt-decode";

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
      },
      comments: {
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

  _setState = (stateUpdate, fieldsToSync, callback = () => {}) =>
    this.setState(stateUpdate, () => {
      fieldsToSync.forEach(field => {
        localStorage.setItem(
          field,
          this.mapper[field].serialize(this.state[field])
        );
      });
      callback();
    });

  setItems = (itemValueMap, callback = () => {}) =>
    this._setState(itemValueMap, Object.keys(itemValueMap), callback);

  pushEvent = (event, arrayField, callback = () => {}) =>
    this._setState(
      prevState => ({ [arrayField]: [...prevState[arrayField], event] }),
      [arrayField],
      callback
    );

  updateAllSubmittedEvents = (eventsFromApi, arrayField) =>
    this._setState(
      prevState => ({
        [arrayField]: [
          ...eventsFromApi,
          ...prevState[arrayField].filter(e => !e.isBeingSubmitted && !e.id)
        ]
      }),
      [arrayField]
    );

  markAndGetEventsForSubmission = arrayField =>
    new Promise(resolve => {
      this._setState(
        prevState => ({
          [arrayField]: prevState[arrayField].map(e =>
            e.id ? e : { ...e, isBeingSubmitted: true }
          )
        }),
        [arrayField],
        () => resolve(this.state[arrayField].filter(e => e.isBeingSubmitted))
      );
    });

  removeSubmissionMark = arrayField =>
    this._setState(
      prevState => ({
        [arrayField]: prevState[arrayField].map(e => ({
          ...e,
          isBeingSubmitted: false
        }))
      }),
      [arrayField]
    );

  removeEventsAfterFailedSubmission = arrayField =>
    this._setState(
      prevState => ({
        [arrayField]: prevState[arrayField].filter(e => !e.isBeingSubmitted)
      }),
      [arrayField]
    );

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
    this.setItems(
      {
        coworkers: coworkers.filter(cw => cw.id !== this.state.userId)
      },
      callback
    );

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
      mission: mission,
      vehicleRegistrationNumber: vehicleRegistrationNumber,
      team: team.map(tm => ({
        id: tm.id,
        firstName: tm.firstName,
        lastName: tm.lastName
      }))
    };
    if (driverIdx) newActivity.driverIdx = driverIdx;

    this.pushEvent(newActivity, "activities", callback);
  };

  pushNewExpenditure = (expenditureType, team, callback = () => {}) =>
    this.pushEvent(
      {
        type: expenditureType,
        eventTime: Date.now(),
        team: team.map(tm => ({
          id: tm.id,
          firstName: tm.firstName,
          lastName: tm.lastName
        }))
      },
      "expenditures",
      callback
    );

  pushNewComment = (content, team, callback = () => {}) =>
    this.pushEvent(
      {
        content,
        eventTime: Date.now(),
        team: team.map(tm => ({
          id: tm.id,
          firstName: tm.firstName,
          lastName: tm.lastName
        }))
      },
      "comments",
      callback
    );

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
            activities: () => this.state.activities,
            pushNewActivity: this.pushNewActivity,
            expenditures: () => this.state.expenditures,
            pushNewExpenditure: this.pushNewExpenditure,
            comments: () => this.state.comments,
            pushNewComment: this.pushNewComment,
            updateAllSubmittedEvents: this.updateAllSubmittedEvents,
            markAndGetEventsForSubmission: this.markAndGetEventsForSubmission,
            removeSubmissionMark: this.removeSubmissionMark,
            removeEventsAfterFailedSubmission: this
              .removeEventsAfterFailedSubmission
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
