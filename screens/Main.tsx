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
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              iconName="person"
              text="Profile"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={Messages}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              iconName="chatbubble"
              text="Chat"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={Search}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              iconName="search"
              text="Search"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Likes"
        component={Likes}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              iconName="heart"
              text="Likes"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Donate"
        component={Donate}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              iconName="cash-outline"
              text="Donate"
            />
          ),
        }}
      />
    </Tab.Navigator>
  )
};

export default Main;