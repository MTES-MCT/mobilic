import React from "react";
import jwtDecode from "jwt-decode";
import zipObject from "lodash/zipObject";
import keyBy from "lodash/keyBy";
import pickBy from "lodash/pickBy";
import mapValues from "lodash/mapValues";
import map from "lodash/map";
import * as Sentry from "@sentry/browser";
import omit from "lodash/omit";
import { NonConcurrentExecutionQueue } from "./concurrency";

const STORE_VERSION = 4;

const StoreSyncedWithLocalStorage = React.createContext(() => {});

const List = {
  serialize: JSON.stringify,
  deserialize: value => (value ? JSON.parse(value) : [])
};

const Map = {
  serialize: JSON.stringify,
  deserialize: value => (value ? JSON.parse(value) : {})
};

const String = {
  serialize: value => value,
  deserialize: value => value
};

export const isPendingSubmission = item => !!item.pendingUpdate;

export class StoreSyncedWithLocalStorageProvider extends React.Component {
  constructor(props) {
    super(props);
    this.storage = props.storage;
    // What is stored in local storage and how to read/write to it
    this.mapper = {
      accessToken: String,
      refreshToken: String,
      companyAdmin: {
        deserialize: value => value === "true",
        serialize: String.serialize
      },
      userId: {
        deserialize: value => (value ? parseInt(value) : value),
        serialize: String.serialize
      },
      companyId: {
        deserialize: value => (value ? parseInt(value) : value),
        serialize: String.serialize
      },
      userInfo: Map,
      coworkers: Map,
      activities: Map,
      teamChanges: List,
      pendingRequests: List,
      comments: Map,
      missions: Map,
      vehicleBookings: Map,
      vehicles: Map,
      nextRequestId: {
        deserialize: value => (value ? parseInt(value) : 1),
        serialize: String.serialize
      },
      nextEntityObjectId: {
        deserialize: value => (value ? parseInt(value) : 1),
        serialize: String.serialize
      }
    };

    // Initialize state with null values
    this.state = {};
    this.generateRequestIdQueue = new NonConcurrentExecutionQueue(
      "generateRequestId"
    );
    this.generateEntityObjectIdQueue = new NonConcurrentExecutionQueue(
      "generateEntityObjectId"
    );
    Object.keys(this.mapper).forEach(entry => {
      this.state[entry] = this.mapper[entry].deserialize(null);
    });

    // Async load state from storage
    this.initFromStorage();
  }

  initFromStorage = async () => {
    // Reset storage when breaking backward compatibility
    const storeVersion = parseInt(await this.storage.getItem("storeVersion"));
    if (storeVersion !== STORE_VERSION) {
      await this.storage.clear();
      await this.storage.setItem("storeVersion", STORE_VERSION);
      return;
    }

    const stateUpdate = Object.fromEntries(
      await Promise.all(
        map(this.mapper, async (value, entry) => {
          return [entry, await this.storage.getItem(entry)];
        })
      )
    );
    try {
      this.setState(
        mapValues(stateUpdate, (value, entry) =>
          this.mapper[entry].deserialize(value)
        )
      );
    } catch (err) {
      Sentry.captureException(err);
      console.log(err);
    }
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

  pushItemToArray = (item, arrayField) => {
    return new Promise(resolve =>
      this.setStoreState(
        prevState => ({ [arrayField]: [...prevState[arrayField], item] }),
        [arrayField],
        resolve
      )
    );
  };

  updateItemInArray = (updatedItem, arrayField) => {
    return new Promise(resolve =>
      this.setStoreState(
        prevState => {
          const array = prevState[arrayField];
          const oldItemVersionIdx = array.findIndex(
            it => it.id === updatedItem.id
          );
          if (oldItemVersionIdx >= 0) {
            array.splice(oldItemVersionIdx, 1, updatedItem);
            return { [arrayField]: [...array] };
          }
          return {};
        },
        [arrayField],
        resolve
      )
    );
  };

  _generateId = (queue, idStateEntry) =>
    queue.execute(
      () =>
        new Promise(resolve => {
          const reqId = this.state[idStateEntry];
          this.setStoreState(
            prevState => ({
              [idStateEntry]: prevState[idStateEntry] + 1
            }),
            [idStateEntry],
            () => resolve(reqId)
          );
        })
    );

  createEntityObject = async (object, entity, requestId) => {
    if (this.mapper[entity] === List) {
      this.setStoreState(
        prevState => ({
          [entity]: [
            ...prevState[entity],
            { ...object, pendingUpdate: { requestId, type: "create" } }
          ]
        }),
        [entity]
      );
      return;
    }
    const entityObjectId =
      "temp" +
      (await this._generateId(
        this.generateEntityObjectIdQueue,
        "nextEntityObjectId"
      ));
    this.setStoreState(
      prevState => ({
        [entity]: {
          ...prevState[entity],
          [entityObjectId.toString()]: {
            ...object,
            id: entityObjectId,
            pendingUpdate: { requestId, type: "create" }
          }
        }
      }),
      [entity]
    );
    return entityObjectId;
  };

  updateEntityObject = (objectId, entity, update, requestId) =>
    this.setStoreState(
      prevState => ({
        [entity]: {
          ...mapValues(prevState[entity], (value, id) =>
            id === objectId.toString()
              ? {
                  ...value,
                  pendingUpdate: { requestId, type: "update", new: update }
                }
              : value
          )
        }
      }),
      [entity]
    );

  deleteEntityObject = (objectId, entity, requestId) =>
    this.setStoreState(
      prevState => ({
        [entity]: {
          ...mapValues(prevState[entity], (value, id) =>
            id === objectId.toString()
              ? { ...value, pendingUpdate: { requestId, type: "delete" } }
              : value
          )
        }
      }),
      [entity]
    );

  getEntity = entity => {
    if (this.mapper[entity] === List) return this.state[entity];
    return pickBy(
      mapValues(this.state[entity], item =>
        this.resolveLastVersionOfItem(item)
      ),
      value => !!value
    );
  };

  removeItemFromArray = (item, arrayField) =>
    new Promise((resolve, reject) =>
      this.setStoreState(
        prevState => ({
          [arrayField]: prevState[arrayField].filter(e =>
            item.id
              ? item.id !== e.id
              : JSON.stringify(e) !== JSON.stringify(item)
          )
        }),
        [arrayField],
        resolve
      )
    );

  clearPendingRequest = async request => {
    await this.removeOptimisticUpdateForRequest(
      request.id,
      request.watchFields
    );
    await this.removeItemFromArray(request, "pendingRequests");
  };

  newRequest = async (
    query,
    variables,
    updateStore,
    watchFields,
    handleSubmitResponse,
    batchable = true,
    onApiError = null
  ) => {
    const requestId = await this._generateId(
      this.generateRequestIdQueue,
      "nextRequestId"
    );
    const storeInfo = await updateStore(this, requestId);
    const request = {
      id: requestId,
      query,
      variables,
      watchFields,
      handleSubmitResponse: apiResponse =>
        handleSubmitResponse(apiResponse, storeInfo),
      batchable,
      onApiError: onApiError ? err => onApiError(err, storeInfo) : null
    };
    await this.pushItemToArray(request, "pendingRequests");
    return request;
  };

  removeOptimisticUpdateForRequest = (requestId, watchFields) =>
    new Promise(resolve => {
      this.setStoreState(
        prevState =>
          zipObject(
            watchFields,
            watchFields.map(entity => {
              if (this.mapper[entity] === List) {
                return prevState[entity].filter(
                  item =>
                    !isPendingSubmission(item) ||
                    item.pendingUpdate.requestId !== requestId
                );
              }
              return pickBy(
                mapValues(prevState[entity], item =>
                  isPendingSubmission(item) &&
                  item.pendingUpdate.requestId === requestId
                    ? item.pendingUpdate.type === "create"
                      ? null
                      : omit(item, "pendingUpdate")
                    : item
                ),
                value => !!value
              );
            })
          ),
        watchFields,
        resolve
      );
    });

  resolveLastVersionOfItem = item => {
    if (!isPendingSubmission(item) || item.pendingUpdate.type === "create") {
      return item;
    }
    if (item.pendingUpdate.type === "delete") {
      return null;
    }
    if (item.pendingUpdate.type === "update") {
      return { ...item, ...item.pendingUpdate.new };
    }
  };

  syncEntity = (itemsFromApi, entity, belongsToSyncScope = () => true) =>
    new Promise(resolve => {
      this.setStoreState(
        prevState => {
          const prevEntityState = prevState[entity];
          if (this.mapper[entity] === List) {
            return {
              [entity]: [
                ...prevEntityState.filter(
                  item =>
                    !belongsToSyncScope(item) ||
                    (isPendingSubmission(item) &&
                      item.pendingUpdate.type === "create")
                ),
                ...itemsFromApi
              ]
            };
          }
          itemsFromApi.forEach(item => {
            const prevEntityMatch = prevEntityState[item.id.toString()];
            if (prevEntityMatch && isPendingSubmission(prevEntityMatch)) {
              item.pendingUpdate = prevEntityMatch.pendingUpdate;
            }
          });
          return {
            [entity]: {
              ...pickBy(
                prevEntityState,
                item =>
                  !belongsToSyncScope(item) ||
                  (isPendingSubmission(item) &&
                    item.pendingUpdate.type === "create")
              ),
              ...keyBy(itemsFromApi, item => item.id.toString())
            }
          };
        },
        [entity],
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
            pendingRequests: () => this.state.pendingRequests,
            getEntity: this.getEntity,
            pushItemToArray: this.pushItemToArray,
            setItems: this.setItems,
            setStoreState: this.setStoreState,
            newRequest: this.newRequest,
            syncEntity: this.syncEntity,
            clearPendingRequest: this.clearPendingRequest,
            removeOptimisticUpdateForRequest: this
              .removeOptimisticUpdateForRequest,
            updateItemInArray: this.updateItemInArray,
            createEntityObject: this.createEntityObject,
            updateEntityObject: this.updateEntityObject,
            deleteEntityObject: this.deleteEntityObject
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
