import React from "react";
import { Login, Search, Likes, Messages, Profile, Donate } from "../screens";
import * as Linking from 'expo-linking';
import * as Global from "../Global";
import * as URL from "../URL";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as I18N from "../i18n/i18n";
import TabBarIcon from "../components/TabBarIcon";
import { PRIMARY_COLOR, DARK_GRAY, BLACK, WHITE } from "../assets/styles";

const i18n = I18N.getI18n()
const APP_URL = Linking.createURL("");

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const Main = () => (
  <Stack.Screen
          name="Main"
          options={{ headerShown: false, animationEnabled: false }}
        >
          {() => (
            <Tab.Navigator
              tabBarOptions={{
                showLabel: false,
                activeTintColor: PRIMARY_COLOR,
                inactiveTintColor: DARK_GRAY,
                labelStyle: {
                  fontSize: 14,
                  textTransform: "uppercase",
                  paddingTop: 10,
                },
                style: {
                  backgroundColor: WHITE,
                  borderTopWidth: 0,
                  marginBottom: 0,
                  shadowOpacity: 0.05,
                  shadowRadius: 10,
                  shadowColor: BLACK,
                  shadowOffset: { height: 0, width: 0 },
                },
              }}
            >
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
                name="Profile"
                component={Profile}
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
          )}
        </Stack.Screen>
);

export default Main;