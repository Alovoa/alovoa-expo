import React from "react";
import { useTheme, Text, Button, Dialog, Portal, Provider, TextInput, IconButton } from "react-native-paper";
import { View, Platform, StyleSheet, Image, Dimensions, useWindowDimensions } from "react-native";
import * as WebBrowser from 'expo-web-browser';
import * as Global from "../Global";
import * as URL from "../URL";
import * as I18N from "../i18n";
import SvgPasswordReset from "../assets/images/password-reset.svg";
import { Captcha, PasswordResetDto } from "../types";

const i18n = I18N.getI18n()
const IMAGE_HEADER = "data:image/webp;base64,";

WebBrowser.maybeCompleteAuthSession();

const PasswordReset = ({ route, navigation }) => {

  const { colors } = useTheme();

  const svgHeight = 150;
  const svgWidth = 200;
  const { height, width } = useWindowDimensions();

  const [email, setEmail] = React.useState("");
  const [emailValid, setEmailValid] = React.useState(false);
  const [captchaId, setCaptchaId] = React.useState(0);
  const [captchaImage, setCaptchaImage] = React.useState("");
  const [captchaText, setCaptchaText] = React.useState("");

  //vars for dialog
  const [visible, setVisible] = React.useState(false);
  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    child: { width, justifyContent: 'center' },
    text: { fontSize: width * 0.5, textAlign: 'center' },
    view: {
      width: width,
      height: height,
      justifyContent: 'center',
      alignItems: 'center'
    },
    button: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 4,
      elevation: 3,
      backgroundColor: '#ec407a',
      margin: 4,
      flexDirection: 'row',
    },
    svg: {
      marginTop: 24,
      marginBottom: 12
    },
    profilePicButton: {
      width: 200,
      height: 200
    },
    title: {
      textAlign: 'center',
      marginTop: 12,
      marginBottom: 12,
      fontSize: 18,
    },
    radioButton: {
      marginBottom: 12,
      marginTop: 12,
    },
    switchText: {
      marginBottom: 12,
      marginTop: 12,
    },
    warning: {
      textAlign: 'center',
      marginTop: 24,
      opacity: 0.5,
      fontSize: 10
    },
    buttonText: {
      color: 'white'
    },
  });  

  React.useEffect(() => {
    navigation.setOptions({
      title: ''
    });
  }, []);

  async function showCaptchaDialog() {
    if (emailValid) {
      setCaptchaText("");
      let res = await Global.Fetch(URL.CATPCHA_GENERATE);
      let captcha: Captcha = res.data;
      setCaptchaId(captcha.id);
      setCaptchaImage(IMAGE_HEADER + captcha.image);
      showDialog();
    }
  }

  async function resetPassword() {
    if (emailValid && captchaId && captchaText) {
      setCaptchaText("");
      let data: PasswordResetDto = { captchaId: captchaId, captchaText: captchaText, email: email }
      try {
        await Global.Fetch(URL.PASSWORD_RESET, 'post', data);
        Global.ShowToast(i18n.t('password-reset-success'));
        Global.navigate("Login");
      } catch (e) {
        hideDialog();
        Global.ShowToast(i18n.t('error.generic'));
      }
    }
  }

  return (
    <View style={[{ flex: 1, padding: 12, backgroundColor: colors.background }]}>
      <View style={{ height: height }}>

        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <SvgPasswordReset style={styles.svg} height={svgHeight} width={svgWidth} />
        </View>

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

        <Button icon="email" mode="contained" style={{ marginTop: 18 }} onPress={() => { showCaptchaDialog() }}
        ><Text style={styles.buttonText}>{i18n.t('password-reset')}</Text></Button>
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
            onPress={() => { showCaptchaDialog() }}
          />
          <IconButton
            icon="login-variant"
            iconColor={colors.primary}
            size={20}
            onPress={() => { resetPassword() }}
          />
        </Dialog.Actions>
      </Dialog>
    </View>
  )
};

export default PasswordReset;