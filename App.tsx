import React from "react";
import { Login, Register, Onboarding, Main, Profile } from "./screens";
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';
import { NavigationContainer } from "@react-navigation/native";
import * as Linking from 'expo-linking';
import * as Global from "./Global";
import { createStackNavigator } from "@react-navigation/stack";
import * as I18N from "./i18n";
import { LogBox, useColorScheme } from 'react-native';
import { RootSiblingParent } from 'react-native-root-siblings';
import { MD3LightTheme, MD3DarkTheme, Provider as PaperProvider } from 'react-native-paper';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';


LogBox.ignoreAllLogs();

const i18n = I18N.getI18n()
const APP_URL = Linking.createURL("");

SplashScreen.preventAutoHideAsync();
setTimeout(SplashScreen.hideAsync, 1000);
WebBrowser.maybeCompleteAuthSession();

const Stack = createStackNavigator();

//TEST
//const RCTNetworking = require('react-native/Libraries/Network/RCTNetworking');
//RCTNetworking.clearCookies(() => { });



export default function App() {

  Global.GetStorage(Global.STORAGE_PAGE).then((value) => {
    if (value && value != Global.INDEX_REGISTER) {
      Global.loadPage(value);
    }
  });

  const isDarkTheme = useColorScheme() == 'dark';

  const theme = {
    ...isDarkTheme ? MD3DarkTheme : MD3LightTheme,
    dark: isDarkTheme,
    roundness: 2,
    version: 3,
    colors: {
      ...isDarkTheme ? MD3DarkTheme.colors : MD3LightTheme.colors,
      primary: '#EC407A',
      secondary: '#28C4ED',
      tertiary: '#F2D3DD',
      backgroundColor: isDarkTheme ? '#121212' : "#FFFFFF"
    },
  };
  
  const themeNavigation = {
    ...isDarkTheme ? DarkTheme : DefaultTheme,
    colors: {
      ...isDarkTheme ? DarkTheme.colors : DefaultTheme.colors,
    },
  };

  return (
    <PaperProvider theme={theme}>
       <StatusBar style= {isDarkTheme ? "light" : "dark"} />
      <RootSiblingParent>
        <NavigationContainer theme={themeNavigation} ref={Global.navigationRef}>
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
            <Stack.Screen
              name="Profile"
              options={{ headerShown: true, animationEnabled: false }}
              component={Profile}
            ></Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </RootSiblingParent>
    </PaperProvider>
  );
}
