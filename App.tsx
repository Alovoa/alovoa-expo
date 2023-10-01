import React from "react";
import { Login, Register, Onboarding, Main, Profile, MessageDetail, PasswordReset } from "./screens";
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';
import { NavigationContainer } from "@react-navigation/native";
import * as Global from "./Global";
import { createStackNavigator } from "@react-navigation/stack";
import { LogBox, useColorScheme } from 'react-native';
import { MD3LightTheme, MD3DarkTheme, Provider as PaperProvider, configureFonts } from 'react-native-paper';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Photos } from "./screens/profile";
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Device from 'expo-device';
import { ThemeProp } from "react-native-paper/lib/typescript/types";
import Toast, { BaseToast } from 'react-native-toast-message';
import {
  useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_500Medium_Italic,
  Montserrat_600SemiBold, Montserrat_700Bold, Montserrat_700Bold_Italic
} from '@expo-google-fonts/montserrat';
import { TransitionSpec } from "@react-navigation/stack/lib/typescript/src/types";

LogBox.ignoreAllLogs();
SplashScreen.preventAutoHideAsync();
setTimeout(SplashScreen.hideAsync, 1000)
WebBrowser.maybeCompleteAuthSession();
const Stack = createStackNavigator();

//TEST
//const RCTNetworking = require('react-native/Libraries/Network/RCTNetworking');
//RCTNetworking.clearCookies(() => { });

export default function App() {

  if (Device.deviceType != Device.DeviceType.PHONE) {
    ScreenOrientation.unlockAsync();
  }

  let [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_500Medium_Italic,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_700Bold_Italic
  });

  const config: TransitionSpec = {
    animation: 'spring',
    config: {
      stiffness: 3000,
      damping: 400,
      mass: 5,
      overshootClamping: true,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
    },
  };

  const baseFont = {
    fontFamily: 'Montserrat_400Regular',
  } as const;

  const baseVariants = configureFonts({ config: baseFont });

  const customVariants = {
    displayMedium: {
      ...baseVariants.displayMedium,
      fontFamily: 'Montserrat_500Medium',
    },
    bold: {
      ...baseVariants.bodyMedium,
      fontFamily: 'Montserrat_700Bold',
    },
    italic: {
      ...baseVariants.bodyMedium,
      fontFamily: 'Montserrat_500Medium_Italic',
    },
    boldItalic: {
      ...baseVariants.bodyMedium,
      fontFamily: 'Montserrat_700Bold_Italic',
    },
    semiBold: {
      ...baseVariants.bodyMedium,
      fontFamily: 'Montserrat_600SemiBold',
    }
  } as const;

  const isDarkTheme = useColorScheme() == 'dark';

  const theme: ThemeProp = {
    ...isDarkTheme ? MD3DarkTheme : MD3LightTheme,
    roundness: 2,
    version: 3,
    colors: {
      ...isDarkTheme ? MD3DarkTheme.colors : MD3LightTheme.colors,
      primary: '#EC407A',
      secondary: '#28C4ED',
      tertiary: '#F2D3DD',
      background: isDarkTheme ? '#000000' : "#FFFFFF"
    },
  };

  const toastConfig = {
    success: (props: any) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: theme.colors?.primary, backgroundColor: theme.colors?.surface }}
        text1Style={{
          fontFamily: 'Montserrat_400Regular',
          color: theme.colors?.onSurface
        }}
      />
    ),
  };

  const themeNavigation = {
    ...isDarkTheme ? DarkTheme : DefaultTheme,
    colors: {
      ...isDarkTheme ? DarkTheme.colors : DefaultTheme.colors,
    },
  };

  const fonts = configureFonts({
    config: {
      ...baseVariants,
      ...customVariants,
    },
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <PaperProvider theme={{ ...theme, fonts }}>
      <StatusBar style={isDarkTheme ? "light" : "dark"} />
      <NavigationContainer theme={themeNavigation} ref={Global.navigationRef}>
        <Stack.Navigator>
          <Stack.Screen
            name="Login"
            options={{
              headerShown: false, animationEnabled: true, transitionSpec: {
                open: config,
                close: config,
              },
            }}
            component={Login}
          ></Stack.Screen>
          <Stack.Screen
            name="Register"
            options={{
              headerShown: true, animationEnabled: true, transitionSpec: {
                open: config,
                close: config,
              },
            }}
            component={Register}
          ></Stack.Screen>
          <Stack.Screen
            name="Onboarding"
            options={{
              headerShown: false, animationEnabled: true, transitionSpec: {
                open: config,
                close: config,
              },
            }}
            component={Onboarding}
          ></Stack.Screen>
          <Stack.Screen
            name="Main"
            options={{
              headerShown: false, animationEnabled: true, transitionSpec: {
                open: config,
                close: config,
              },
            }}
            component={Main}
          ></Stack.Screen>
          <Stack.Screen
            name="Profile"
            options={{
              headerShown: false, animationEnabled: true, transitionSpec: {
                open: config,
                close: config,
              },
            }}
            component={Profile}
          ></Stack.Screen>
          <Stack.Screen
            name="MessageDetail"
            options={{
              headerShown: true, animationEnabled: true, transitionSpec: {
                open: config,
                close: config,
              },
            }}
            component={MessageDetail}
          ></Stack.Screen>
          <Stack.Screen
            name="Profile.Fotos"
            options={{
              headerShown: false, animationEnabled: true, transitionSpec: {
                open: config,
                close: config,
              },
            }}
            component={Photos}
          ></Stack.Screen>
          <Stack.Screen
            name="PasswordReset"
            options={{
              headerShown: true, animationEnabled: true, transitionSpec: {
                open: config,
                close: config,
              },
            }}
            component={PasswordReset}
          ></Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
      <Toast config={toastConfig} />
    </PaperProvider>
  );
}
