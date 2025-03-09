import React from "react";
import { Search, Likes, Messages, YourProfile, Donate } from "../screens";
import * as Global from "../Global";
import * as URL from "../URL";
import { createMaterialBottomTabNavigator, MaterialBottomTabScreenProps } from 'react-native-paper/react-navigation';
import * as I18N from "../i18n";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NAVIGATION_BAR_HEIGHT } from "../assets/styles";
import { useWindowDimensions } from "react-native";
import { RootStackParamList, MaterialBottomTabNavigator } from "../types";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const i18n = I18N.getI18n()
const ICON_SIZE = 26;

const Tab: MaterialBottomTabNavigator<RootStackParamList> = createMaterialBottomTabNavigator<RootStackParamList>();

const SECOND_MS = 1000;
const POLL_ALERT = 15 * SECOND_MS;
const POLL_MESSAGE = 15 * SECOND_MS;

type Props = MaterialBottomTabScreenProps<RootStackParamList, 'Main'>
const Main = ({ route, navigation }: Props) => {

  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets()
  
  let messageUpdateInterval: NodeJS.Timeout | undefined;
  let alertUpdateInterval: NodeJS.Timeout | undefined;
  let langIso: string | undefined;

  const [newAlert, setNewAlert] = React.useState(false);
  const [newMessage, setHasNewMessage] = React.useState(false);

  async function updateNewAlert() {
    let url;
    if (!langIso) {
      langIso = i18n.locale.slice(0, 2);
      url = Global.format(URL.USER_STATUS_ALERT_LANG, langIso);
    } else {
      url = URL.USER_STATUS_ALERT;
    }
    let response = await Global.Fetch(url);
    let data: boolean = response.data;
    setNewAlert(data);
  }

  async function updateNewMessage() {
    let response = await Global.Fetch(URL.USER_STATUS_MESSAGE);
    let data: boolean = response.data;
    setHasNewMessage(data);
  }

  React.useEffect(() => {
    messageUpdateInterval = setInterval(async () => {
      updateNewAlert();
    }, POLL_MESSAGE);

    alertUpdateInterval = setInterval(async () => {
      updateNewMessage();
    }, POLL_ALERT);

    updateNewAlert();
    updateNewMessage();

    Global.SetStorage(Global.STORAGE_SCREEN, Global.SCREEN_SEARCH);
  }, []);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      if (messageUpdateInterval) {
        clearInterval(messageUpdateInterval);
      }
      if (alertUpdateInterval) {
        clearInterval(alertUpdateInterval);
      }
    });
    return unsubscribe;
  }, [navigation]);

  function saveScreen(target: string | undefined) {
    if (target) {
      let targetSplitArr = target.split("-");
      let screen = targetSplitArr[0];
      switch (screen) {
        case Global.SCREEN_YOURPROFILE: Global.SetStorage(Global.STORAGE_SCREEN, Global.SCREEN_YOURPROFILE); break;
        case Global.SCREEN_CHAT: Global.SetStorage(Global.STORAGE_SCREEN, Global.SCREEN_CHAT); break;
        case Global.SCREEN_SEARCH: Global.SetStorage(Global.STORAGE_SCREEN, Global.SCREEN_SEARCH); break;
        case Global.SCREEN_LIKES: Global.SetStorage(Global.STORAGE_SCREEN, Global.SCREEN_LIKES); break;
        case Global.SCREEN_DONATE: Global.SetStorage(Global.STORAGE_SCREEN, Global.SCREEN_DONATE); break;
      }
    }
  }

  return (
    <Tab.Navigator initialRouteName={Global.SCREEN_SEARCH} barStyle={{height: NAVIGATION_BAR_HEIGHT, marginBottom: insets.bottom}} style={{height: height}}>
      <Tab.Screen
        name={Global.SCREEN_YOURPROFILE}
        component={YourProfile}
        listeners={{
          tabPress: e => {
            saveScreen(e.target);
          },
        }}
        options={{
          tabBarLabel: i18n.t('navigation.profile'),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account" color={color} size={ICON_SIZE} />
          ),
        }}
      />
      <Tab.Screen
        name={Global.SCREEN_CHAT}
        component={Messages}
        listeners={{
          tabPress: e => {
            saveScreen(e.target);
          },
        }}
        options={{
          tabBarBadge: newMessage,
          tabBarLabel: i18n.t('navigation.chat'),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="chat" color={color} size={ICON_SIZE} />
          ),
        }}
      />
      <Tab.Screen
        name={Global.SCREEN_SEARCH}
        component={Search}
        listeners={{
          tabPress: e => {
            saveScreen(e.target);
          },
        }}
        options={{
          tabBarLabel: i18n.t('navigation.search'),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="magnify" color={color} size={ICON_SIZE} />
          ),
        }}
      />
      <Tab.Screen
        name={Global.SCREEN_LIKES}
        component={Likes}
        listeners={{
          tabPress: e => {
            saveScreen(e.target);
          },
        }}
        options={{
          tabBarBadge: newAlert,
          tabBarLabel: i18n.t('navigation.likes'),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="heart" color={color} size={ICON_SIZE} />
          ),
        }}
      />
      <Tab.Screen
        name={Global.SCREEN_DONATE}
        component={Donate}
        listeners={{
          tabPress: e => {
            saveScreen(e.target);
          },
        }}
        options={{
          tabBarLabel: i18n.t('navigation.donate'),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="cash-multiple" color={color} size={ICON_SIZE} />
          ),
        }}
      />
    </Tab.Navigator>
  )
};

export default Main;