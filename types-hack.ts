// react-native-paper@5 & @react-navigation/native@7 type compatibility hack
// https://github.com/callstack/react-native-paper/issues/4572#issuecomment-2558782323
// todo: remove below after react-native-paper@5 fixes support for @react-navigation/native@7

import {
  DefaultNavigatorOptions,
  EventMapBase,
  NavigationState,
  ParamListBase,
  RouteConfig,
  RouteGroupConfig,
  TabNavigationState,
} from '@react-navigation/native';
import { MaterialBottomTabNavigationEventMap, MaterialBottomTabNavigationOptions } from 'react-native-paper';
import { MaterialBottomTabNavigatorProps } from 'react-native-paper/lib/typescript/react-navigation/navigators/createMaterialBottomTabNavigator';

type LegacyTypedNavigator<
  ParamList extends ParamListBase,
  State extends NavigationState,
  ScreenOptions extends object,
  EventMap extends EventMapBase,
  Navigator extends React.ComponentType<any>,
> = {
  Navigator: React.ComponentType<
    Omit<React.ComponentProps<Navigator>, keyof DefaultNavigatorOptions<any, any, any, any, any, any>> &
      DefaultNavigatorOptions<ParamList, any, State, ScreenOptions, EventMap, any>
  >;
  Group: React.ComponentType<RouteGroupConfig<ParamList, ScreenOptions, any>>;
  Screen: <RouteName extends keyof ParamList>(
    _: RouteConfig<ParamList, RouteName, State, ScreenOptions, EventMap, any>,
  ) => null;
};

export type MaterialBottomTabNavigator<T extends ParamListBase> = LegacyTypedNavigator<
  T,
  TabNavigationState<ParamListBase>,
  MaterialBottomTabNavigationOptions,
  MaterialBottomTabNavigationEventMap,
  (_: MaterialBottomTabNavigatorProps) => React.JSX.Element
>;
