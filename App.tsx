import React from "react";
import { Main, Onboarding, Register } from "./screens";
import { View, Platform, Button } from "react-native";
import { Buffer } from "buffer";
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';
import { NavigationContainer } from "@react-navigation/native";
import * as Linking from 'expo-linking';
import * as Global from "./Global";
import * as URL from "./URL";
import { createStackNavigator } from "@react-navigation/stack";
import * as I18N from "./i18n/i18n";

const i18n = I18N.getI18n()
const TWO_WEEKS_MS = 1209600000;
const APP_URL = Linking.createURL("");

SplashScreen.preventAutoHideAsync();
setTimeout(SplashScreen.hideAsync, 1000);
WebBrowser.maybeCompleteAuthSession();

const Stack = createStackNavigator();

//TODO remove auth cookie just before it expires

//TEST
const RCTNetworking = require('react-native/Libraries/Network/RCTNetworking'); 
RCTNetworking.clearCookies(() => {});


export default function App() {

  //Global.Fetch(URL.USER_STATUS_ALERT);

  const _handleRedirect = async (event: { url: string; }) => {

    if (Platform.OS === 'ios') {
      WebBrowser.dismissBrowser();
    }

    let data = Linking.parse(event.url);
    if (data.queryParams != null) {
      //let firstName: string = String(data.queryParams["firstName"]);
      let page = Number(data.queryParams["page"]);
      let rememberMe = String(data.queryParams["remember-me"]);
      //await Global.SetStorage("remember-me", rememberMe);
      //await Global.SetStorage("page", String(page));

      //TODO move to next screen

      console.log("test")
      //let res = await Global.Fetch(URL.USER_STATUS_ALERT);
      
      
      await Global.Fetch(URL.API_RESOURCE_DONATE);

      await Global.Fetch( URL.format(URL.AUTH_COOKIE, rememberMe));

      await Global.Fetch(URL.USER_STATUS_ALERT);
      

      await Global.Fetch(URL.API_RESOURCE_DONATE);

      
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
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        <Button
          title={i18n.t('auth.google')}
          onPress={() => {
            loginGoogle();
          }}
        />
        <Button
          title={i18n.t('auth.facebook')}
          onPress={() => {
            loginFacebook();
          }}
        />
      </NavigationContainer>
    </View>
  );
  
}