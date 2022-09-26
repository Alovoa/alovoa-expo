import React from "react";
import { Onboarding, Register, Search, Likes, Messages, Profile, Donate } from "./screens";
import { View, Platform, Pressable, ScrollView, Text, StyleSheet } from "react-native";
import { Buffer } from "buffer";
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';
import { NavigationContainer } from "@react-navigation/native";
import * as Linking from 'expo-linking';
import * as Global from "./Global";
import * as URL from "./URL";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as I18N from "./i18n/i18n";
import { FontAwesome } from '@expo/vector-icons';
import TabBarIcon from "./components/TabBarIcon";
import { PRIMARY_COLOR, DARK_GRAY, BLACK, WHITE } from "./assets/styles";

const i18n = I18N.getI18n()
const APP_URL = Linking.createURL("");

SplashScreen.preventAutoHideAsync();
setTimeout(SplashScreen.hideAsync, 1000);
WebBrowser.maybeCompleteAuthSession();

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

//TEST
//const RCTNetworking = require('react-native/Libraries/Network/RCTNetworking'); 
//RCTNetworking.clearCookies(() => {});

export default function App() {

  //Global.Fetch(URL.USER_STATUS_ALERT);

  const _handleRedirect = async (event: { url: string; }) => {

    if (Platform.OS === 'ios') {
      WebBrowser.dismissBrowser();
    }

    let data = Linking.parse(event.url);
    if (data.queryParams != null) {
      let firstName: string = String(data.queryParams["firstName"]);
      let page = Number(data.queryParams["page"]);
      let rememberMe = String(data.queryParams["remember-me"]);
      await Global.Fetch(URL.format(URL.AUTH_COOKIE, rememberMe));

      //TODO next page
    }
  };

  const loginGoogle = async () => {
    let e = Linking.addEventListener('url', _handleRedirect);
    await WebBrowser.openAuthSessionAsync(URL.AUTH_GOOGLE + "/" + Buffer.from(APP_URL).toString('base64'), '');
    e.remove();
  };

  const loginFacebook = async () => {
    let e = Linking.addEventListener('url', _handleRedirect);
    await WebBrowser.openAuthSessionAsync(URL.AUTH_FACEBOOK + "/" + Buffer.from(APP_URL).toString('base64'), '');
    e.remove();
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          options={{ headerShown: false, animationEnabled: false }}
        >{() => (
          <View style={{ flex: 1 }}>
            <ScrollView>
              <Pressable style={[styles.button, styles.buttonGoogle]}
                onPress={() => {
                  loginGoogle();
                }}
              ><FontAwesome name="google" size={24} color="white" /><Text style={styles.buttonText}>{i18n.t('auth.google')}</Text></Pressable>
              <Pressable style={[styles.button, styles.buttonFacebook]}
                onPress={() => {
                  loginFacebook();
                }}
              ><FontAwesome name="facebook-official" size={24} color="white" /><Text style={styles.buttonText}>{i18n.t('auth.facebook')}</Text></Pressable>
            </ScrollView>
            <View>
              <Text style={styles.link} onPress={() => {
                WebBrowser.openBrowserAsync(URL.PRIVACY);
              }}>{i18n.t('privacy-policy')}</Text>
              <Text style={styles.link} onPress={() => {
                WebBrowser.openBrowserAsync(URL.TOS);
              }}>{i18n.t('tos')}</Text>
              <Text style={styles.link} onPress={() => {
                WebBrowser.openBrowserAsync(URL.IMPRINT);
              }}>{i18n.t('imprint')}</Text>
            </View>
          </View>
        )}</Stack.Screen>
        <Stack.Screen
          name="Tab"
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
      </Stack.Navigator>


    </NavigationContainer>
  );

}

const styles = StyleSheet.create({
  link: {
    color: "#ec407a"
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: 'blue',
  },
  buttonGoogle: {
    backgroundColor: '#4285f4',
  },
  buttonFacebook: {
    backgroundColor: '#4267b2',
  },
  buttonText: {
    color: 'white'
  }
});