import React from "react";
import jwtDecode from "jwt-decode";
import { NonConcurrentExecutionQueue } from "./concurrency";

const StoreSyncedWithLocalStorage = React.createContext(() => {});

const List = {
  serialize: JSON.stringify,
  deserialize: value => (value ? JSON.parse(value) : [])
};

export const isPendingSubmission = item =>
  !!item.deletedByRequestId ||
  !!item.createdByRequestId ||
  !!item.updatedByRequestId;

export class StoreSyncedWithLocalStorageProvider extends React.Component {
  constructor(props) {
    super(props);
    this.storage = props.storage;
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
      activities: List,
      pendingRequests: List,
      comments: List,
      missions: List,
      vehicleBookings: List,
      vehicles: List,
      nextRequestId: { deserialize: value => (value ? parseInt(value) : 1) }
    };

    // Initialize state with null values
    this.state = {};
    this.generateRequestIdQueue = new NonConcurrentExecutionQueue(
      "generateRequestId"
    );
    Object.keys(this.mapper).forEach(entry => {
      this.mapper[entry] = {
        serialize: this.mapper[entry].serialize || (value => value),
        deserialize: this.mapper[entry].deserialize || (value => value)
      };
      this.state[entry] = this.mapper[entry].deserialize(null);
    });

    // Async load state from storage
    this.initFromStorage();
  }

  initFromStorage = () => {
    Object.keys(this.mapper).forEach(async entry => {
      const rawValueFromLS = await this.storage.getItem(entry);
      try {
        this.setState({
          [entry]: this.mapper[entry].deserialize(rawValueFromLS)
        });
      } catch (err) {
        console.log(err);
      }
    });
  };

  setStoreState = (stateUpdate, fieldsToSync, callback = () => {}) =>
    this.setState(stateUpdate, () => {
      fieldsToSync.forEach(field => {
        this.storage.setItem(
          field,
          this.mapper[field].serialize(this.state[field])
        );
      });
      callback();
    });

  setItems = (itemValueMap, callback = () => {}) =>
    this.setStoreState(itemValueMap, Object.keys(itemValueMap), callback);

  getItemById = (id, arrayField) =>
    this.state[arrayField].find(e => e.id === id);

  pushItem = (item, arrayField) => {
    return new Promise(resolve =>
      this.setStoreState(
        prevState => ({ [arrayField]: [...prevState[arrayField], item] }),
        [arrayField],
        resolve
      )
    );
  };

  getArray = arrayField => {
    const baseItems = this.state[arrayField];
    const updatedIds = [];
    const deletedIds = [];
    baseItems.forEach(item => {
      if (item.updatedByRequestId) updatedIds.push(item.id);
      else if (item.deletedByRequestId) deletedIds.push(item.id);
    });
    if (updatedIds.length + deletedIds.length > 0) {
      return baseItems.filter(
        item =>
          !deletedIds.includes(item.id) &&
          (!updatedIds.includes(item) || item.updatedByRequestId)
      );
    }
    return baseItems;
  };

  removeItem = (item, arrayField) =>
    this.setStoreState(
      prevState => ({
        [arrayField]: prevState[arrayField].filter(e =>
          item.id
            ? item.id !== e.id
            : JSON.stringify(e) !== JSON.stringify(item)
        )
      }),
      [arrayField]
    );

  clearPendingRequest = async request => {
    await this.removeOptimisticUpdateForRequest(
      request.id,
      request.watchFields
    );
    await this.removeItem(request, "pendingRequests");
  };

  hideItem = (item, arrayField) =>
    this.setStoreState(
      prevState => ({
        [arrayField]: [
          ...prevState[arrayField].filter(e =>
            item.id
              ? item.id !== e.id
              : JSON.stringify(e) !== JSON.stringify(item)
          ),
          { ...item, isHidden: true }
        ]
      }),
      [arrayField]
    );

  newRequest = async (
    query,
    variables,
    updateStore,
    watchFields,
    handleSubmitResponse,
    batchable = true
  ) => {
    const requestId = await this.generateRequestIdQueue.execute(
      () =>
        new Promise(resolve => {
          const reqId = this.state.nextRequestId;
          this.setStoreState(
            prevState => ({
              nextRequestId: prevState.nextRequestId + 1
            }),
            ["nextRequestId"],
            () => resolve(reqId)
          );
        })
    );
    await updateStore(this, requestId);
    const request = {
      id: requestId,
      query,
      variables,
      watchFields,
      handleSubmitResponse,
      batchable
    };
    await this.pushItem(request, "pendingRequests");
    return request;
  };

  removeOptimisticUpdateForRequest = (requestId, watchFields) =>
    new Promise(resolve => {
      this.setStoreState(
        prevState =>
          Object.fromEntries(
            watchFields.map(arrayField => [
              arrayField,
              prevState[arrayField].filter(
                e =>
                  ![
                    e.createdByRequestId,
                    e.updatedByRequestId,
                    e.deletedByRequestId
                  ].includes(requestId)
              )
            ])
          ),
        watchFields,
        resolve
      );
    });

  syncAllSubmittedItems = (
    itemsFromApi,
    arrayField,
    onlyReplaceEventsWithCondition = () => true
  ) =>
    new Promise(resolve => {
      this.setStoreState(
        prevState => ({
          [arrayField]: [
            ...itemsFromApi,
            ...prevState[arrayField].filter(
              e => isPendingSubmission(e) || !onlyReplaceEventsWithCondition(e)
            )
          ]
        }),
        [arrayField],
        resolve
      );
    });

  removeItems = (items, callback = () => {}) => {
    const itemValueMap = {};
    items.forEach(item => (itemValueMap[item] = null));
    this.setState(itemValueMap, () => {
      items.forEach(item => this.storage.removeItem(item));
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
            pendingRequests: () => this.state.pendingRequests,
            getArray: this.getArray,
            vehicles: () => this.state.vehicles,
            removeItem: this.removeItem,
            hideItem: this.hideItem,
            pushItem: this.pushItem,
            setItems: this.setItems,
            setStoreState: this.setStoreState,
            newRequest: this.newRequest,
            syncAllSubmittedItems: this.syncAllSubmittedItems,
            clearPendingRequest: this.clearPendingRequest,
            removeOptimisticUpdateForRequest: this
              .removeOptimisticUpdateForRequest,
            getItemById: this.getItemById
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
