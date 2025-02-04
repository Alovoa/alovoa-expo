import React from "react";
import Main from "./screens/Main";
import { Login, Register, Onboarding, Profile, MessageDetail, PasswordReset } from "./screens";
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';
import { NavigationContainer } from "@react-navigation/native";
import * as Global from "./Global";
import { createStackNavigator } from "@react-navigation/stack";
import { LogBox, useColorScheme } from 'react-native';
import { MD3LightTheme, MD3DarkTheme, Provider as PaperProvider, configureFonts } from 'react-native-paper';
import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Pictures, ProfileSettings, SearchSettings, Settings, Prompts, AdvancedSettings } from "./screens/profile/index";
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Device from 'expo-device';
import { ThemeProp } from "react-native-paper/lib/typescript/types";
import Toast, { BaseToast } from 'react-native-toast-message';
import * as I18N from "./i18n";
import {
  useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_500Medium_Italic,
  Montserrat_600SemiBold, Montserrat_700Bold, Montserrat_700Bold_Italic
} from '@expo-google-fonts/montserrat';
import { TransitionSpec } from "@react-navigation/stack/src/types";
import { enGB, en, es, de, registerTranslation } from 'react-native-paper-dates'
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootStackParamList } from "./types";

LogBox.ignoreAllLogs();
SplashScreen.preventAutoHideAsync();
setTimeout(SplashScreen.hideAsync, 1000)
WebBrowser.maybeCompleteAuthSession();
const Stack = createStackNavigator<RootStackParamList>();
registerTranslation('en-GB', enGB);
registerTranslation('en', en);
registerTranslation('es', es);
registerTranslation('de', de);

export default function App() {

  const i18n = I18N.getI18n();

  const [colorPrimary, setColorPrimary] = React.useState(Global.DEFAULT_COLOR_PRIMARY);
  const [colorSecondary, setColorSecondary] = React.useState(Global.DEFAULT_COLOR_SECONDARY);

  React.useEffect(() => {
    load();
  }, []);

  async function load() {
    let primary: string | null = await Global.GetStorage(Global.STORAGE_SETTINGS_COLOR_PRIMARY);
    let secondary: string | null = await Global.GetStorage(Global.STORAGE_SETTINGS_COLOR_SECONDARY);
    if (primary) {
      setColorPrimary(primary);
    }
    if (secondary) {
      setColorSecondary(secondary);
    }
  }

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
      primary: colorPrimary,
      secondary: colorSecondary,
      tertiary: '#F2D3DD', /*not used*/
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
        text1NumberOfLines={4}
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={{ ...theme, fonts }}>
        <StatusBar style={isDarkTheme ? "light" : "dark"} />
        <NavigationContainer theme={themeNavigation} ref={Global.navigationRef}>
          <Stack.Navigator>
            <Stack.Screen
              name="Login"
              options={{
                headerShown: false, animation: 'default', transitionSpec: {
                  open: config,
                  close: config,
                },
              }}
              component={Login}
            ></Stack.Screen>
            <Stack.Screen
              name="Register"
              options={{
                title: i18n.t('register.title'),
                headerShown: true, animation: 'default', transitionSpec: {
                  open: config,
                  close: config,
                },
              }}
              component={Register}
            ></Stack.Screen>
            <Stack.Screen
              name="Onboarding"
              options={{
                headerShown: false, animation: 'default', transitionSpec: {
                  open: config,
                  close: config,
                },
              }}
              component={Onboarding}
            ></Stack.Screen>
            <Stack.Screen
              name="Main"
              options={{
                headerShown: false, animation: 'default', transitionSpec: {
                  open: config,
                  close: config,
                },
              }}
              component={Main}
            ></Stack.Screen>
            <Stack.Screen
              name="Profile"
              options={{
                headerShown: false, animation: 'default', transitionSpec: {
                  open: config,
                  close: config,
                },
              }}
              component={Profile}
            ></Stack.Screen>
            <Stack.Screen
              name="MessageDetail"
              options={{
                headerShown: true, animation: 'default', transitionSpec: {
                  open: config,
                  close: config,
                },
              }}
              component={MessageDetail}
            ></Stack.Screen>
            <Stack.Screen
              name={Global.SCREEN_PROFILE_PICTURES}
              options={{
                title: i18n.t('profile.screen.pictures'),
                headerShown: true, animation: 'default', transitionSpec: {
                  open: config,
                  close: config,
                },
              }}
              component={Pictures}
            ></Stack.Screen>
            <Stack.Screen
              name={Global.SCREEN_PROFILE_PROFILESETTINGS}
              options={{
                title: i18n.t('profile.screen.profile'),
                headerShown: true, animation: 'default', transitionSpec: {
                  open: config,
                  close: config,
                },
              }}
              component={ProfileSettings}
            ></Stack.Screen>
            <Stack.Screen
              name={Global.SCREEN_PROFILE_SEARCHSETTINGS}
              options={{
                title: i18n.t('profile.screen.search'),
                headerShown: true, animation: 'default', transitionSpec: {
                  open: config,
                  close: config,
                },
              }}
              component={SearchSettings}
            ></Stack.Screen>
            <Stack.Screen
              name={Global.SCREEN_PROFILE_SETTINGS}
              options={{
                title: i18n.t('profile.screen.settings'),
                headerShown: true, animation: 'default', transitionSpec: {
                  open: config,
                  close: config,
                },
              }}
              component={Settings}
            ></Stack.Screen>
            <Stack.Screen
              name={Global.SCREEN_PROFILE_ADVANCED_SETTINGS}
              options={{
                title: i18n.t('profile.screen.advanced-settings'),
                headerShown: true, animation: 'default', transitionSpec: {
                  open: config,
                  close: config,
                },
              }}
              component={AdvancedSettings}
            ></Stack.Screen>
            <Stack.Screen
              name="PasswordReset"
              options={{
                headerShown: true, animation: 'default', transitionSpec: {
                  open: config,
                  close: config,
                },
              }}
              component={PasswordReset}
            ></Stack.Screen>
            <Stack.Screen
              name="Profile.Prompts"
              options={{
                title: i18n.t('profile.screen.prompts'),
                headerShown: true, animation: 'default', transitionSpec: {
                  open: config,
                  close: config,
                },
              }}
              component={Prompts}
            ></Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
        <Toast config={toastConfig} />
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
