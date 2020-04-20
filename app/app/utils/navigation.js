import {ACTIVITIES} from 'common/utils/activities';
import {BeforeWork} from '../screens/BeforeWork';
import {CurrentActivity} from '../screens/CurrentActivity';
import React from 'react';
import {SafeAreaView} from 'react-native';
import {BottomNavigation} from 'react-native-paper';
import {theme} from '../design/theme';

const SCREENS_WITH_BOTTOM_NAVIGATION = [
  {
    key: 'activity',
    title: 'Activité',
    icon: 'timer',
    render: props =>
      props.currentActivity &&
      props.currentActivity.type !== ACTIVITIES.rest.name ? (
        <CurrentActivity {...props} />
      ) : (
        <BeforeWork {...props} />
      ),
  },
  {
    key: 'context',
    title: 'Infos',
    icon: 'information',
    render: props => null,
  },
  {
    key: 'history',
    title: 'Historique',
    icon: 'timetable',
    render: props => null,
  },
];

export function ScreenWithBottomNavigation(props) {
  const [screenIdx, setScreenIdx] = React.useState(0);
  return (
    <BottomNavigation
      navigationState={{
        index: screenIdx,
        routes: SCREENS_WITH_BOTTOM_NAVIGATION,
      }}
      onIndexChange={idx => setScreenIdx(idx)}
      activeColor={theme.palette.primary.main}
      barStyle={{borderStyle: 'solid', borderColor: 'black', borderTopWidth: 1}}
      renderScene={({route}) => (
        <SafeAreaView style={{height: '100%'}}>
          {route.render(props)}
        </SafeAreaView>
      )}
    />
  );
}
