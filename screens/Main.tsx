import React from "react";
import { Search, Likes, Messages, YourProfile, Donate } from "../screens";
import * as Global from "../Global";
import * as URL from "../URL";
import * as I18N from "../i18n";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NAVIGATION_BAR_HEIGHT } from "../assets/styles";
import { useWindowDimensions } from "react-native";
import { RootStackParamList, YourProfileResource, UserDto } from "../myTypes";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useTheme } from "react-native-paper";

const Tab = createBottomTabNavigator();
const i18n = I18N.getI18n()
const ICON_SIZE = 26;
const SECOND_MS = 1000;
const POLL_ALERT = 15 * SECOND_MS;
const POLL_MESSAGE = 15 * SECOND_MS;
const MOBILE_WIDTH = 768; //from react navigation

const YourProfileScreen: React.FC<any> = (props) => <YourProfile {...props} />;
const MessagesScreen: React.FC<any> = (props) => <Messages {...props} />;
const SearchScreen: React.FC<any> = (props) => <Search {...props} />;
const LikesScreen: React.FC<any> = (props) => <Likes {...props} />;
const DonateScreen: React.FC<any> = (props) => <Donate {...props} />;

type Props = BottomTabScreenProps<RootStackParamList, 'Main'>
const Main = ({ route, navigation }: Props) => {

  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets()
  const { colors } = useTheme();

  let messageUpdateInterval: NodeJS.Timeout | undefined;
  let alertUpdateInterval: NodeJS.Timeout | undefined;
  let langIso: string | undefined;

  const [newAlert, setNewAlert] = React.useState(false);
  const [newMessage, setHasNewMessage] = React.useState(false);
  const [incompleteProfile, setIncompleteProfile] = React.useState(false);

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

  async function checkProfileIncomplete() {
    let response = await Global.Fetch(URL.API_RESOURCE_YOUR_PROFILE);
    let data: YourProfileResource = response.data;
    let user: UserDto = data.user;

    if (user.interests.length === 0) {
      setIncompleteProfile(true);
    } else if (user.images.length == 0) {
      setIncompleteProfile(true);
    } else if (user.prompts.length == 0) {
      setIncompleteProfile(true);
    }
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
    checkProfileIncomplete();

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
    <Tab.Navigator initialRouteName={Global.SCREEN_SEARCH}
      screenOptions={{
        tabBarStyle: {
          height: NAVIGATION_BAR_HEIGHT,
          marginBottom: insets.bottom,
          paddingTop: width >= MOBILE_WIDTH ? 0 : 12, //react navigation workaround, no way to center icons while having a custom height
        },
        tabBarBadgeStyle: {
          backgroundColor: 'red',
          minWidth: 8,
          height: 8,
        },
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
      }}>
      <Tab.Screen
        name={Global.SCREEN_YOURPROFILE}
        component={YourProfileScreen}
        listeners={{
          tabPress: e => {
            saveScreen(e.target);
          },
        }}
        options={{
          tabBarBadge: incompleteProfile ? "" : undefined,
          tabBarLabel: i18n.t('navigation.profile'),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account" color={color} size={ICON_SIZE} />
          ),
        }}
      />
      <Tab.Screen
        name={Global.SCREEN_CHAT}
        component={MessagesScreen}
        listeners={{
          tabPress: e => {
            saveScreen(e.target);
          },
        }}
        options={{
          tabBarBadge: newMessage ? "" : undefined,
          tabBarLabel: i18n.t('navigation.chat'),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="chat" color={color} size={ICON_SIZE} />
          ),
        }}
      />
      <Tab.Screen
        name={Global.SCREEN_SEARCH}
        component={SearchScreen}
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
        component={LikesScreen}
        listeners={{
          tabPress: e => {
            saveScreen(e.target);
          },
        }}
        options={{
          tabBarBadge: newAlert ? "" : undefined,
          tabBarLabel: i18n.t('navigation.likes'),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="heart" color={color} size={ICON_SIZE} />
          ),
        }}
      />
      <Tab.Screen
        name={Global.SCREEN_DONATE}
        component={DonateScreen}
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