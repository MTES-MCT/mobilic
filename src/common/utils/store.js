import React from "react";
import jwtDecode from "jwt-decode";

const StoreSyncedWithLocalStorage = React.createContext(() => {});

const List = {
  serialize: JSON.stringify,
  deserialize: value => (value ? JSON.parse(value) : [])
};

export class StoreSyncedWithLocalStorageProvider extends React.Component {
  constructor(props) {
    super(props);
    // What is stored in local storage and how to read/write to it
    this.mapper = {
      accessToken: {},
      refreshToken: {},
      companyAdmin: { deserialize: value => value === "true" },
      userId: { deserialize: value => (value ? parseInt(value) : value) },
      companyId: { deserialize: value => (value ? parseInt(value) : value) },
      userInfo: {
        serialize: JSON.stringify,
        deserialize: value => (value ? JSON.parse(value) : {})
      },
      coworkers: List,
      teamEnrollments: List,
      activities: List,
      pendingActivityCancels: List,
      pendingActivityRevisions: List,
      expenditures: List,
      pendingExpenditureCancels: List,
      comments: List,
      missions: List,
      vehicleBookings: List,
      vehicles: List
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

  pushEvent = (event, arrayField) =>
    new Promise(resolve =>
      this._setState(
        prevState => ({ [arrayField]: [...prevState[arrayField], event] }),
        [arrayField],
        resolve
      )
    );

  removeEvent = (event, arrayField) =>
    this._setState(
      prevState => ({
        [arrayField]: prevState[arrayField].filter(
          e => JSON.stringify(e) !== JSON.stringify(event)
        )
      }),
      [arrayField]
    );

  hideEvent = (event, arrayField) =>
    this._setState(
      prevState => ({
        [arrayField]: [
          ...prevState[arrayField].filter(
            e => JSON.stringify(e) !== JSON.stringify(event)
          ),
          { ...event, isHidden: true }
        ]
      }),
      [arrayField]
    );

  updateAllSubmittedEvents = (eventsFromApi, arrayField) =>
    new Promise(resolve => {
      this._setState(
        prevState => ({
          [arrayField]: [
            ...eventsFromApi,
            ...prevState[arrayField].filter(
              e => !e.id && !e.isBeingSubmitted && !e.isPrediction
            )
          ]
        }),
        [arrayField],
        () => resolve()
      );
    });

  markAndGetEventsForSubmission = arrayField =>
    new Promise(resolve => {
      this._setState(
        prevState => ({
          [arrayField]: prevState[arrayField].map(e =>
            e.id || e.isPrediction ? e : { ...e, isBeingSubmitted: true }
          )
        }),
        [arrayField],
        () =>
          resolve(
            this.state[arrayField]
              .filter(e => e.isBeingSubmitted)
              .map(event => {
                const { isHidden, ...eventProps } = event;
                return eventProps;
              })
          )
      );
    });

  removeSubmissionMark = arrayField =>
    new Promise(resolve => {
      this._setState(
        prevState => ({
          [arrayField]: prevState[arrayField].map(e => ({
            ...e,
            isBeingSubmitted: false
          }))
        }),
        [arrayField],
        () => resolve()
      );
    });

  removeEventsAfterFailedSubmission = arrayField =>
    new Promise(resolve => {
      this._setState(
        prevState => ({
          [arrayField]: prevState[arrayField].filter(e => !e.isBeingSubmitted)
        }),
        [arrayField],
        () => resolve()
      );
    });

  removeItems = (items, callback = () => {}) => {
    const itemValueMap = {};
    items.forEach(item => (itemValueMap[item] = null));
    this.setState(itemValueMap, () => {
      items.forEach(item => localStorage.removeItem(item));
      callback();
    });
  };

  storeTokens = ({ accessToken, refreshToken }) =>
    new Promise(resolve => {
      const { id, company_admin, company_id } = jwtDecode(accessToken).identity;
      this.setItems(
        {
          accessToken,
          refreshToken,
          userId: id,
          companyId: company_id,
          companyAdmin: company_admin
        },
        resolve
      );
    });

  removeTokens = () =>
    new Promise(resolve =>
      this.removeItems(
        ["accessToken", "refreshToken", "userId", "companyId", "companyAdmin"],
        resolve
      )
    );

  setUserInfo = ({
    firstName,
    lastName,
    companyId,
    companyName,
    isCompanyAdmin
  }) =>
    this.setItems({
      userInfo: { firstName, lastName, companyName },
      companyId,
      companyAdmin: isCompanyAdmin
    });

  setCoworkers = (coworkers, callback = () => {}) =>
    this.setItems(
      {
        coworkers: coworkers.filter(cw => cw.id !== this.state.userId)
      },
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
            companyId: () => this.state.companyId,
            removeTokens: this.removeTokens,
            setUserInfo: this.setUserInfo,
            userInfo: () => ({ id: this.state.userId, ...this.state.userInfo }),
            coworkers: () => this.state.coworkers,
            setCoworkers: this.setCoworkers,
            activities: () => this.state.activities,
            expenditures: () => this.state.expenditures,
            comments: () => this.state.comments,
            pendingExpenditureCancels: () =>
              this.state.pendingExpenditureCancels,
            updateAllSubmittedEvents: this.updateAllSubmittedEvents,
            markAndGetEventsForSubmission: this.markAndGetEventsForSubmission,
            removeSubmissionMark: this.removeSubmissionMark,
            removeEventsAfterFailedSubmission: this
              .removeEventsAfterFailedSubmission,
            removeEvent: this.removeEvent,
            hideEvent: this.hideEvent,
            pushEvent: this.pushEvent,
            pendingActivityCancels: () => this.state.pendingActivityCancels,
            pendingActivityRevisions: () => this.state.pendingActivityRevisions,
            teamEnrollments: () => this.state.teamEnrollments,
            missions: () => this.state.missions,
            vehicleBookings: () => this.state.vehicleBookings,
            vehicles: () => this.state.vehicles
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
