import React from "react";
import mapValues from "lodash/mapValues";
import flatMap from "lodash/flatMap";
import uniq from "lodash/uniq";
import uniqBy from "lodash/uniqBy";
import map from "lodash/map";

import { NonConcurrentExecutionQueue } from "../utils/concurrency";
import { BroadcastChannel } from "broadcast-channel";
import { currentControllerId, currentUserId } from "../utils/cookie";
import { captureSentryException } from "../utils/sentry";
import { LOCAL_STORAGE_SCHEMA, NON_PERSISTENT_SCHEMA } from "./schemas";
import { employmentSelector, entitySelector } from "./selectors";
import { ACTIONS, rootReducer } from "./reducers/root";
import { EMPLOYMENT_STATUS, getEmploymentsStatus } from "../utils/employments";

const STORE_VERSION = 17;

export const broadCastChannel = new BroadcastChannel("storeUpdates", {
  webWorkerSupport: false
});

const StoreSyncedWithLocalStorage = React.createContext(() => {});

export class StoreSyncedWithLocalStorageProvider extends React.Component {
  constructor(props) {
    super(props);
    this.storage = props.storage;

    // Initialize state with null values
    this.state = { _utils: this };
    this.nonPersistentState = {};
    this.pendingActions = [];
    Object.keys(LOCAL_STORAGE_SCHEMA).forEach(entry => {
      this.state[entry] = LOCAL_STORAGE_SCHEMA[entry].deserialize(null);
    });
    Object.keys(NON_PERSISTENT_SCHEMA).forEach(entry => {
      this.nonPersistentState[entry] = NON_PERSISTENT_SCHEMA[entry].deserialize(
        null
      );
    });

    this.allowOfflineMode = this.testStorage();
    this.loadFromStorageQueue = new NonConcurrentExecutionQueue();
    // Async load state from storage
    this.loadFromStorage();
  }

  testStorage = () => {
    try {
      const testKey = "__test__";
      this.storage.setItem(testKey, "mobilic");
      const test = this.storage.getItem(testKey) === "mobilic";
      this.storage.removeItem(testKey);
      return test;
    } catch (err) {
      captureSentryException(err);
      return false;
    }
  };

  loadFromStorage = async (resetIfNeeded = true) => {
    if (!this.allowOfflineMode) return;
    // Reset storage when breaking backward compatibility
    const storeVersion = parseInt(await this.storage.getItem("storeVersion"));
    if (storeVersion !== STORE_VERSION && resetIfNeeded) {
      await this.storage.clear();
      await this.storage.setItem("storeVersion", STORE_VERSION);
    } else {
      // Load main state from (local) storage
      const stateUpdate = Object.fromEntries(
        await Promise.all(
          map(LOCAL_STORAGE_SCHEMA, async (value, entry) => {
            return [entry, await this.storage.getItem(entry)];
          })
        )
      );
      // Load secondary state from (local) storage, resetting it if possible
      const pendingRequests = NON_PERSISTENT_SCHEMA.pendingRequests.deserialize(
        await this.storage.getItem("pendingRequests")
      );
      await Promise.all(
        Object.keys(NON_PERSISTENT_SCHEMA).map(async entry => {
          this.nonPersistentState[entry] = NON_PERSISTENT_SCHEMA[
            entry
          ].deserialize(
            await (pendingRequests.length > 0
              ? this.storage.getItem(entry)
              : null)
          );
          if (pendingRequests.length === 0)
            this.storage.setItem(
              entry,
              NON_PERSISTENT_SCHEMA[entry].serialize(
                this.nonPersistentState[entry]
              )
            );
        })
      );
      try {
        await new Promise(resolve =>
          this.setState(
            mapValues(stateUpdate, (value, entry) =>
              LOCAL_STORAGE_SCHEMA[entry].deserialize(value)
            ),
            resolve
          )
        );
      } catch (err) {
        captureSentryException(err);
      }
    }
    await this._updateUserId();
    await this._updateControllerId();
  };

  broadcastChannelMessageHandler = msg => {
    if (msg === "update") {
      this.loadFromStorageQueue.execute(
        async () => await this.loadFromStorage(false),
        { cacheKey: "load", refresh: true }
      );
    }
  };

  componentDidMount() {
    broadCastChannel.addEventListener(
      "message",
      this.broadcastChannelMessageHandler
    );
  }

  componentWillUnmount() {
    broadCastChannel.removeEventListener(
      "message",
      this.broadcastChannelMessageHandler
    );
  }

  batchUpdate = () => {
    if (this.pendingActions.length > 0) {
      this.update(
        this.pendingActions.map(a => a.action),
        uniq(flatMap(this.pendingActions, upd => upd.fieldsToSync)),
        () => {
          this.pendingActions.forEach(upd => upd.callback());
        }
      );
      this.pendingActions = [];
    }
  };

  dispatch = (action, fieldsToSync, callback = () => {}) => {
    this.pendingActions.push({
      action,
      fieldsToSync,
      callback
    });
  };

  update = (actionOrActions, fieldsToSync, callback = () => {}) => {
    const actions = Array.isArray(actionOrActions)
      ? actionOrActions
      : [actionOrActions];

    this.setState(
      state => {
        const newState = actions.reduce(rootReducer, state);
        return newState;
      },
      () => {
        if (this.allowOfflineMode)
          fieldsToSync.forEach(field => {
            this.storage.setItem(
              field,
              LOCAL_STORAGE_SCHEMA[field].serialize(this.state[field])
            );
          });
        callback();
      }
    );
  };

  setItems = (itemValueMap, callback = () => {}, commitImmediately = true) => {
    const action = { type: ACTIONS.basicUpdate, payload: itemValueMap };
    commitImmediately
      ? this.update(action, Object.keys(itemValueMap), callback)
      : this.dispatch(action, Object.keys(itemValueMap), callback);
  };

  generateId = idStateEntry => {
    const id = this.nonPersistentState[idStateEntry];
    this.nonPersistentState[idStateEntry] = id + 1;
    if (this.allowOfflineMode)
      this.storage.setItem(
        idStateEntry,
        NON_PERSISTENT_SCHEMA[idStateEntry].serialize(id + 1)
      );
    return id;
  };

  generateTempEntityObjectId = () => {
    return "temp" + this.generateId("nextEntityObjectId");
  };

  addToIdentityMap = async (key, value) => {
    this.nonPersistentState.identityMap = {
      ...this.nonPersistentState.identityMap,
      [key]: value
    };
    if (this.allowOfflineMode)
      this.storage.setItem(
        "identityMap",
        NON_PERSISTENT_SCHEMA["identityMap"].serialize(
          this.nonPersistentState.identityMap
        )
      );
  };

  createEntityObject = (objects, entity, pendingRequestId) => {
    let objectList = Array.isArray(objects) ? objects : [objects];

    if (pendingRequestId) {
      objectList = objectList.map(object => ({
        ...object,
        id: this.generateTempEntityObjectId()
      }));
    }

    this.dispatch(
      {
        type: ACTIONS.create,
        payload: { items: objectList, entity, pendingRequestId }
      },
      [entity]
    );

    return Array.isArray(objects)
      ? objectList.map(o => o.id)
      : objectList[0].id;
  };

  updateEntityObject = ({
    objectId,
    entity,
    update,
    pendingRequestId,
    createOrReplace = false,
    deepMerge = false
  }) => {
    return this.dispatch(
      {
        type: ACTIONS.update,
        payload: {
          id: objectId,
          entity,
          update,
          pendingRequestId,
          createOrReplace,
          deepMerge
        }
      },
      [entity]
    );
  };

  deleteEntityObject = (objectId, entity, pendingRequestId) =>
    this.dispatch(
      {
        type: ACTIONS.delete,
        payload: { id: objectId, entity, pendingRequestId }
      },
      [entity]
    );

  getEntity = entity => entitySelector(entity)(this.state);

  clearPendingRequest = async request => {
    await this.removeOptimisticUpdateForRequest(
      request.id,
      request.watchFields
    );
    this.nonPersistentState.pendingRequests = this.nonPersistentState.pendingRequests.filter(
      r => r.id !== request.id
    );
    if (this.allowOfflineMode)
      this.storage.setItem(
        "pendingRequests",
        NON_PERSISTENT_SCHEMA["pendingRequests"].serialize(
          this.nonPersistentState.pendingRequests
        )
      );
  };

  newRequest = (
    query,
    variables,
    updateStore,
    watchFields,
    apiResponseHandlerName,
    groupId = null
  ) => {
    const requestId = this.generateId("nextRequestId");
    const storeInfo = updateStore(this, requestId);
    this.batchUpdate();
    const request = {
      id: requestId,
      userId: this.state.userId,
      query,
      variables,
      watchFields,
      storeInfo,
      apiResponseHandlerName,
      groupId
    };
    this.nonPersistentState.pendingRequests = [
      ...this.nonPersistentState.pendingRequests,
      request
    ];
    if (this.allowOfflineMode)
      this.storage.setItem(
        "pendingRequests",
        NON_PERSISTENT_SCHEMA["pendingRequests"].serialize(
          this.nonPersistentState.pendingRequests
        )
      );
    return request;
  };

  pendingRequests = () =>
    this.nonPersistentState.pendingRequests.filter(
      r => r.userId === this.state.userId
    );

  removeOptimisticUpdateForRequest = (requestId, watchFields) => {
    this.dispatch(
      {
        type: ACTIONS.removeOptimistic,
        payload: { requestId, entities: watchFields }
      },
      watchFields
    );
  };

  syncEntity = (itemsFromApi, entity, belongsToSyncScope = () => true) =>
    this.dispatch(
      {
        type: ACTIONS.sync,
        payload: { items: itemsFromApi, entity, belongsToSyncScope }
      },
      [entity]
    );

  removeItems = (items, callback = () => {}) => {
    const itemValueMap = {};
    items.forEach(item => (itemValueMap[item] = null));
    this.setState(itemValueMap, () => {
      items.forEach(item => {
        if (this.allowOfflineMode) this.storage.removeItem(item);
      });
      callback();
    });
  };

  _removeUserAndControllerInfo = async () =>
    await Promise.all([
      new Promise(resolve => this.removeItems(["hasAcceptedCgu"], resolve)),
      new Promise(resolve => {
        this.setItems({ userInfo: {}, employments: [] }, resolve);
      }),
      new Promise(resolve => {
        this.setItems({ controllerInfo: {} }, resolve);
      }),
      this.storage.clear()
    ]);

  setControllerInfo = (
    { firstName, lastName, email },
    commitImmediately = true
  ) =>
    new Promise(resolve =>
      this.setItems(
        {
          controllerInfo: {
            firstName,
            lastName,
            email
          }
        },
        resolve,
        commitImmediately
      )
    );

  setUserInfo = (
    {
      firstName,
      lastName,
      email,
      birthDate,
      hasConfirmedEmail,
      hasActivatedEmail,
      disabledWarnings
    },
    commitImmediately = true
  ) =>
    new Promise(resolve =>
      this.setItems(
        {
          userInfo: {
            firstName,
            lastName,
            email,
            birthDate,
            hasConfirmedEmail,
            hasActivatedEmail,
            disabledWarnings
          }
        },
        resolve,
        commitImmediately
      )
    );

  setEmployeeInvite = employment =>
    this.setState({ employeeInvite: employment });

  clearEmployeeInvite = () => this.setState({ employeeInvite: null });

  setHasAcceptedCgu = () => this.setState({ hasAcceptedCgu: true });

  companies = () => {
    const employments = employmentSelector(this.state).filter(
      e => getEmploymentsStatus(e) === EMPLOYMENT_STATUS.active
    );
    return uniqBy(
      employments.map(e => ({
        id: e.company.id,
        name: e.company.name,
        admin: e.hasAdminRights,
        siren: e.company.siren,
        settings: e.company.settings
      })),
      c => c.id
    );
  };

  _updateUserId = async () =>
    new Promise(resolve => this.setItems({ userId: currentUserId() }, resolve));

  _updateControllerId = async () =>
    new Promise(resolve =>
      this.setItems({ controllerId: currentControllerId() }, resolve)
    );

  updateControllerIdAndInfo = async () => {
    await this._updateControllerId();
    await this._removeUserAndControllerInfo();
  };

  updateUserIdAndInfo = async () => {
    await this._updateUserId();
    await this._removeUserAndControllerInfo();
  };

  userId = () => this.state.userId;

  controllerId = () => this.state.controllerId;

  userInfo = () => ({ id: this.state.userId, ...this.state.userInfo });

  controllerInfo = () => ({
    id: this.state.controllerId,
    ...this.state.controllerInfo
  });

  coworkers = () => this.state.coworkers;

  employeeInvite = () => this.state.employeeInvite;

  hasAcceptedCgu = () => this.state.hasAcceptedCgu;

  clearHasAcceptedCgu = () => this.setState({ hasAcceptedCgu: null });

  identityMap = () => this.nonPersistentState.identityMap;

  render() {
    return (
      <StoreSyncedWithLocalStorage.Provider value={this.state}>
        {this.props.children}
      </StoreSyncedWithLocalStorage.Provider>
    );
  }
}

export const useStoreSyncedWithLocalStorage = () =>
  React.useContext(StoreSyncedWithLocalStorage)._utils;
