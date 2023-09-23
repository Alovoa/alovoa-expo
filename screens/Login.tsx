import React from "react";
import { useTheme, Text, Button, Dialog, Portal, Provider, TextInput, IconButton } from "react-native-paper";
import { View, Platform, StyleSheet, Image, Dimensions, Alert, ScrollView, useWindowDimensions } from "react-native";
import { Buffer } from "buffer";
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as Global from "../Global";
import * as URL from "../URL";
import * as I18N from "../i18n";
import { Captcha } from "../types";
import VerticalView from "../components/VerticalView";

const i18n = I18N.getI18n()
const APP_URL = Linking.createURL("");
const IMAGE_HEADER = "data:image/webp;base64,";

WebBrowser.maybeCompleteAuthSession();


const Login = () => {

  const { colors } = useTheme();

  const [email, setEmail] = React.useState("");
  const [emailValid, setEmailValid] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [captchaId, setCaptchaId] = React.useState(0);
  const [captchaImage, setCaptchaImage] = React.useState("");
  const [captchaText, setCaptchaText] = React.useState("");

  //vars for dialog
  const [visible, setVisible] = React.useState(false);
  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);
  const { height, width } = useWindowDimensions();

  React.useEffect(() => {
    Global.GetStorage(Global.STORAGE_PAGE).then((value) => {
      if (value && value != Global.INDEX_REGISTER) {
        Global.loadPage(value);
      }
    });
  }, []);

  const _handleRedirect = async (event: { url: string; }) => {

    if (Platform.OS === 'ios') {
      WebBrowser.dismissBrowser();
    }

    let data = Linking.parse(event.url);
    if (data.queryParams != null) {
      let firstName: string = String(data.queryParams["firstName"]);
      let page: string = String(data.queryParams["page"]);
      let sessionId: string = String(data.queryParams["jsessionid"]);
      let rememberMe = String(data.queryParams["remember-me"]);
      await Global.Fetch(Global.format(URL.AUTH_COOKIE, rememberMe, sessionId));
      await Global.SetStorage(Global.STORAGE_FIRSTNAME, firstName);
      await Global.SetStorage(Global.STORAGE_PAGE, page);
      await Global.SetStorage("loginDate", new Date().toISOString());
      Global.loadPage(page);
    }
  };

  const loginGoogle = async () => {
    let e = Linking.addEventListener('url', _handleRedirect);
    let res = await WebBrowser.openAuthSessionAsync(URL.AUTH_GOOGLE + "/" + Buffer.from(APP_URL).toString('base64'));
    e.remove();

    //_handleRedirect does not work on iOS and web, get url directly from WebBrowser.openAuthSessionAsync result instead
    if ((Platform.OS === 'ios' || Platform.OS === 'web') && res.type == "success" && res.url) {
      _handleRedirect({ url: res.url });
    }
  };

  const loginFacebook = async () => {
    let e = Linking.addEventListener('url', _handleRedirect);
    let res = await WebBrowser.openAuthSessionAsync(URL.AUTH_FACEBOOK + "/" + Buffer.from(APP_URL).toString('base64'));
    e.remove();

    //_handleRedirect does not work on iOS and web, get url directly from WebBrowser.openAuthSessionAsync result instead
    if ((Platform.OS === 'ios' || Platform.OS === 'web') && res.type == "success" && res.url) {
      _handleRedirect({ url: res.url });
    }
  };

  const loginEmail = async () => {
    if (captchaId && captchaText) {
      hideDialog();
      let url = URL.AUTH_LOGIN + "?username=" + encodeURIComponent(email) +
        "&password=" + encodeURIComponent(password) +
        "&remember-me=on" +
        "&redirect-url=" + Buffer.from(APP_URL).toString('base64') +
        "&captchaId=" + captchaId +
        "&captchaText=" + captchaText;
      try {
        let res = await Global.Fetch(url, 'post', {}, "application/x-www-form-urlencoded");
        let redirectHeader = res.headers['redirect-url'];
        if (res.request?.responseURL && res.request?.responseURL != URL.AUTH_LOGIN_ERROR && redirectHeader) {
          _handleRedirect({ url: redirectHeader });
        } else {
          Global.ShowToast(i18n.t('error.generic'));
        }
      } catch (e) {
        Global.ShowToast(i18n.t('error.generic'));
      }
    }
  };

  async function emailSignInPress() {
    if (emailValid && password) {
      setCaptchaText("");
      let res = await Global.Fetch(URL.CATPCHA_GENERATE);
      let captcha: Captcha = res.data;
      setCaptchaId(captcha.id);
      setCaptchaImage(IMAGE_HEADER + captcha.image);
      showDialog();
    }
  }

  return (
    <VerticalView>
      <View >
        <View style={{ minHeight: height }}>
          <Image resizeMode='contain' style={{ height: 200, width: '100%', marginTop: 8 }} source={require('../assets/splash.png')} />

          <Text style={{ textAlign: 'center', marginBottom: 48, marginTop: 24, fontSize: 32, fontWeight: '500' }}>Alovoa</Text>

          <TextInput
            style={{ backgroundColor: colors.background }}
            label={i18n.t('email')}
            value={email}
            onChangeText={text => {
              setEmail(text);
              setEmailValid(Global.isEmailValid(text));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={{ backgroundColor: colors.background }}
            label={i18n.t('password')}
            value={password}
            onChangeText={text => setPassword(text)}
            autoCapitalize="none"
            secureTextEntry={true}
          />

          <Button icon="email" mode="contained" style={{ marginTop: 18 }} onPress={() => { emailSignInPress() }}
          ><Text style={styles.buttonText}>{i18n.t('auth.email')}</Text></Button>

          <View style={{ paddingBottom: 38 }}></View>

          <Button icon="google" mode="contained" style={[styles.buttonGoogle]}
            onPress={() => {
              loginGoogle();
            }}
          ><Text style={styles.buttonText}>{i18n.t('auth.google')}</Text></Button>
          <Button icon="facebook" mode="contained" style={[styles.buttonFacebook, { marginTop: 8 }]}
            onPress={() => {
              loginFacebook();
            }}
          ><Text style={styles.buttonText}>{i18n.t('auth.facebook')}</Text></Button>
        </View>

        <View style={{ marginTop: 64 }}>
          <Text style={styles.link} onPress={() => {
            Global.navigate("Register", false, { registerEmail: true });
          }}>{i18n.t('register-email')}</Text>
          <Text style={styles.link} onPress={() => {
            Global.navigate("PasswordReset", false, {});
          }}>{i18n.t('password-forget')}</Text>
        </View>

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
        <View style={{ paddingBottom: 38 }}></View>
      </View>

      <Dialog visible={visible} onDismiss={hideDialog}>
        <Dialog.Title>{i18n.t('captcha.title')}</Dialog.Title>
        <Dialog.Content>
          <Image resizeMode='contain' style={{ height: 100 }} source={{ uri: captchaImage }} />
          <TextInput
            mode="outlined"
            label={i18n.t('captcha.placeholder')}
            value={captchaText}
            onChangeText={text => setCaptchaText(text)}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <IconButton
            icon="reload"
            iconColor={colors.primary}
            size={20}
            onPress={() => { emailSignInPress() }}
          />
          <IconButton
            icon="login-variant"
            iconColor={colors.primary}
            size={20}
            onPress={() => { loginEmail() }}
          />
        </Dialog.Actions>
      </Dialog>
    </VerticalView>
  )
};

export default Login;

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
