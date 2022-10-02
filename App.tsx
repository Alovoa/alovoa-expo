import React from "react";
import { Login, Register, Onboarding, Main } from "./screens";
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';
import { NavigationContainer } from "@react-navigation/native";
import * as Linking from 'expo-linking';
import * as Global from "./Global";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as I18N from "./i18n";

const i18n = I18N.getI18n()
const APP_URL = Linking.createURL("");

SplashScreen.preventAutoHideAsync();
setTimeout(SplashScreen.hideAsync, 1000);
WebBrowser.maybeCompleteAuthSession();

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

//TEST
const RCTNetworking = require('react-native/Libraries/Network/RCTNetworking'); 
RCTNetworking.clearCookies(() => {});

export default function App() {
  return (
    <NavigationContainer ref={Global.navigationRef}>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          options={{ headerShown: false, animationEnabled: false }}
          component={Login}
        ></Stack.Screen>
        <Stack.Screen
          name="Register"
          options={{ headerShown: false, animationEnabled: false }}
          component={Register}
        ></Stack.Screen>
        <Stack.Screen
          name="Onboarding"
          options={{ headerShown: false, animationEnabled: false }}
          component={Onboarding}
        ></Stack.Screen>
        <Stack.Screen
          name="Main"
          options={{ headerShown: false, animationEnabled: false }}
          component={Main}
        ></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
