import React from "react";
import { Search, Likes, Messages, YourProfile, Donate } from "../screens";
import * as Global from "../Global";
import * as URL from "../URL";
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import * as I18N from "../i18n";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const i18n = I18N.getI18n()
const ICON_SIZE = 26;

const Tab = createMaterialBottomTabNavigator();

const SECOND_MS = 1000;
const POLL_ALERT = 5 * SECOND_MS;
const POLL_MESSAGE = 5 * SECOND_MS;

const Main = ({ route, navigation }) => {

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


  return (
    <Tab.Navigator initialRouteName="Search">
      <Tab.Screen
        name="YourProfile"
        component={YourProfile}
        options={{
          tabBarLabel: i18n.t('navigation.profile'),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account" color={color} size={ICON_SIZE} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={Messages}
        options={{
          tabBarBadge: newMessage,
          tabBarLabel: i18n.t('navigation.chat'),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="chat" color={color} size={ICON_SIZE} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={Search}
        options={{
          tabBarLabel: i18n.t('navigation.search'),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="magnify" color={color} size={ICON_SIZE} />
          ),
        }}
      />
      <Tab.Screen
        name="Likes"
        component={Likes}
        options={{
          tabBarBadge: newAlert,
          tabBarLabel: i18n.t('navigation.likes'),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="heart" color={color} size={ICON_SIZE} />
          ),
        }}
      />
      <Tab.Screen
        name="Donate"
        component={Donate}
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