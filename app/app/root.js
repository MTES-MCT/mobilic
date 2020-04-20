import React from 'react';
import {Provider as PaperProvider} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {ScreenWithBottomNavigation} from './utils/navigation';
import {ApiContextProvider} from 'common/utils/api';
import {StoreSyncedWithLocalStorageProvider} from 'common/utils/store';
import AsyncStorage from '@react-native-community/async-storage';
import {ActionsContextProvider} from 'common/utils/actions';
import App from 'common/components/App';
import {ModalProvider} from 'common/utils/modals';
import {MODAL_DICT} from './utils/modals';
import {reactNativePaperTheme} from './design/theme';

const Root = () => {
  return (
    <StoreSyncedWithLocalStorageProvider storage={AsyncStorage}>
      <ApiContextProvider>
        <ActionsContextProvider>
          <PaperProvider theme={reactNativePaperTheme}>
            <ModalProvider modalDict={MODAL_DICT}>
              <App ScreenComponent={ScreenWithBottomNavigation} />
            </ModalProvider>
          </PaperProvider>
        </ActionsContextProvider>
      </ApiContextProvider>
    </StoreSyncedWithLocalStorageProvider>
  );
};

export default Root;
