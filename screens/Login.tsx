import React from "react";
import { Onboarding, Register, Main} from "../screens";
import { View, Platform, Pressable, ScrollView, Text, StyleSheet, Image } from "react-native";
import { Buffer } from "buffer";
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as Global from "../Global";
import * as URL from "../URL";
import * as I18N from "../i18n";
import { FontAwesome } from '@expo/vector-icons';

const i18n = I18N.getI18n()
const APP_URL = Linking.createURL("");

WebBrowser.maybeCompleteAuthSession();

const _handleRedirect = async (event: { url: string; }) => {

  

  if (Platform.OS === 'ios') {
    WebBrowser.dismissBrowser();
  }

  let data = Linking.parse(event.url);
  if (data.queryParams != null) {
    let firstName: string = String(data.queryParams["firstName"]);
    let page : string = String(data.queryParams["page"]);
    let sessionId : string = String(data.queryParams["jsessionid"]);
    let rememberMe = String(data.queryParams["remember-me"]);
    await Global.Fetch(URL.format(URL.AUTH_COOKIE, rememberMe, sessionId));
    await Global.SetStorage("firstName", firstName);
    await Global.SetStorage("page", page);
    console.log("page " + page);

    Global.loadPage(page);
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


const Login = () => (
  <View style={{ flex: 1, padding: 12 }}>
    <ScrollView>
      <Image resizeMode='contain' style={{ resizeMode: "contain", height: 200, width: '100%' }} source={require('../assets/splash.png')} />

      <Text style={{ textAlign: 'center', marginBottom: 48, fontSize: 32, fontWeight: '500' }}>Alovoa</Text>

      <Pressable style={[styles.button, styles.buttonGoogle]}
        onPress={() => {
          loginGoogle();
        }}
      ><FontAwesome name="google" size={24} color="white" style={styles.icon} /><Text style={styles.buttonText}>{i18n.t('auth.google')}</Text></Pressable>
      <Pressable style={[styles.button, styles.buttonFacebook]}
        onPress={() => {
          loginFacebook();
        }}
      ><FontAwesome name="facebook-official" size={24} color="white" style={styles.icon} /><Text style={styles.buttonText}>{i18n.t('auth.facebook')}</Text></Pressable>
      <View style={{ marginTop: 24 }}>
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
    </ScrollView>
  </View>
);

export default Login;

const styles = StyleSheet.create({
  link: {
    color: "#ec407a",
    flex: 1,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: 'blue',
    margin: 4,
    flexDirection: 'row'
  },
  buttonGoogle: {
    backgroundColor: '#4285f4',
  },
  buttonFacebook: {
    backgroundColor: '#4267b2',
  },
  buttonText: {
    color: 'white'
  },
  icon: {
    marginRight: 8
  }
});