import React from "react";
import { Search, Likes, Messages, YourProfile, Donate } from "../screens";
import * as Linking from 'expo-linking';
import * as Global from "../Global";
import * as URL from "../URL";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as I18N from "../i18n";
import TabBarIcon from "../components/TabBarIcon";

const i18n = I18N.getI18n()
const APP_URL = Linking.createURL("");

const Tab = createBottomTabNavigator();

const Main = () => {
  return (
    <Tab.Navigator initialRouteName="Search"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false
      }}
    >
      <Tab.Screen
        name="YourProfile"
        component={YourProfile}
        options={{
          unmountOnBlur: true,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              iconName="person"
              text={i18n.t('navigation.profile')}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={Messages}
        options={{
          unmountOnBlur: true,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              iconName="chatbubble"
              text={i18n.t('navigation.chat')}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={Search}
        options={{
          unmountOnBlur: true,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              iconName="search"
              text={i18n.t('navigation.search')}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Likes"
        component={Likes}
        options={{
          unmountOnBlur: true,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              iconName="heart"
              text={i18n.t('navigation.likes')}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Donate"
        component={Donate}
        options={{
          unmountOnBlur: true,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              iconName="cash-outline"
              text={i18n.t('navigation.donate')}
            />
          ),
        }}
      />
    </Tab.Navigator>
  )
};

export default Main;