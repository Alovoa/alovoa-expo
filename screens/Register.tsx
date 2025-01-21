import React from "react";
import { useTheme, Text, Button, TextInput, RadioButton, HelperText, ActivityIndicator, MaterialBottomTabScreenProps } from "react-native-paper";
import { View, StyleSheet, useWindowDimensions, ScrollView } from "react-native";
import * as WebBrowser from 'expo-web-browser';
import * as Global from "../Global";
import * as URL from "../URL";
import * as I18N from "../i18n";
import * as Localization from 'expo-localization';
import { RegisterBody, RootStackParamList } from "../types";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DatePickerInput } from "react-native-paper-dates";
import { ValidRangeType } from "react-native-paper-dates/lib/typescript/Date/Calendar";
import Alert from "../components/Alert";
import VerticalView from "../components/VerticalView";
import { useHeaderHeight } from '@react-navigation/elements';

const i18n = I18N.getI18n()

const MIN_AGE = 16
const MAX_AGE = 100

function subtractYears(years: number): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date;
}

type Props = MaterialBottomTabScreenProps<RootStackParamList, 'Register'>
const Register = ({ route, navigation }: Props) => {

  const { height, width } = useWindowDimensions();
  const headerHeight = useHeaderHeight();

  const registerEmail = route.params?.registerEmail;
  const validDobRange: ValidRangeType = {
    startDate: subtractYears(MAX_AGE),
    endDate: subtractYears(MIN_AGE)
  }
  const { colors } = useTheme();
  const scrollRef = React.useRef<ScrollView | null>(null);
  const [alertVisible, setAlertVisible] = React.useState(false);
  const [email, setEmail] = React.useState<string>();
  const [emailValid, setEmailValid] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [passwordSecure, setPasswordSecure] = React.useState(false);
  const [firstName, setFirstName] = React.useState("");
  const [dob, setDob] = React.useState<Date>();
  const [gender, setGender] = React.useState("1");
  const [referrerCode, setReferrerCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const alertButtons = [
    {
      text: i18n.t('ok'),
      onPress: () => { setAlertVisible(false); Global.navigate("Login"); },
    }
  ]

  const style = StyleSheet.create({
    link: {
      color: colors.primary,
      flex: 1,
    },
    container: {
      marginBottom: 4
    }
  });

  async function load() {
    let name = await Global.GetStorage(Global.STORAGE_FIRSTNAME);
    setFirstName(name ? String(name) : "");
  }

  React.useEffect(() => {
    load();
  }, []);

  async function submit() {
    if (firstName && dob && (!registerEmail || registerEmail && emailValid && passwordSecure)) {
      let data = {} as RegisterBody;
      data.dateOfBirth = dob;
      data.firstName = firstName;
      data.gender = Number(gender);
      data.privacy = true;
      data.termsConditions = true;
      data.referrerCode = referrerCode
      if (registerEmail) {
        data.email = email;
        data.password = password;
        try {
          setLoading(true);
          await Global.Fetch(URL.REGISTER, 'post', data);
          setLoading(false);
          setAlertVisible(true);
        } catch (e) {
          setLoading(false);
          Global.ShowToast(i18n.t('error.generic'));
        }
      } else {
        try {
          setLoading(true);
          await Global.Fetch(URL.REGISTER_OAUTH, 'post', data);
          setLoading(false);
          await Global.SetStorage(Global.STORAGE_PAGE, Global.INDEX_ONBOARDING);
          Global.loadPage(Global.INDEX_ONBOARDING);
        } catch (e) {
          setLoading(false);
          Global.ShowToast(i18n.t('error.generic'));
        }
      }
    } else {
      scrollRef?.current?.scrollTo({ x: 0, y: 0, animated: true });
    }
  }

  function updatePassword(text: string) {
    setPassword(text);
    setPasswordSecure(Global.isPasswordSecure(text));
  }

  function getDateInputLocale(): string {
    const [locale] = Localization.getLocales()
    return locale.languageTag.startsWith("de") ? "de" : "en-GB";
  }

  return (
    <View style={{ height: height - headerHeight }}>

      {loading &&
        <View style={{ height: height, width: width, zIndex: 1, justifyContent: 'center', alignItems: 'center', position: "absolute" }} >
          <ActivityIndicator animating={loading} size="large" />
        </View>
      }

      <VerticalView ref={scrollRef}>
        <Text style={{ textAlign: 'center', marginBottom: 36, fontSize: 32 }}>{i18n.t('register.subtitle')}</Text>

        {registerEmail && <View style={[style.container]}>
          <TextInput
            mode="outlined"
            label={i18n.t('email') + " *"}
            value={email}
            onChangeText={text => {
              setEmail(text);
              setEmailValid(Global.isEmailValid(text));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {!emailValid && email &&
            <HelperText type="error" >
              {i18n.t('email-invalid')}
            </HelperText>}
        </View>
        }

        {registerEmail && <View style={[style.container]}>
          <TextInput
            mode="outlined"
            label={i18n.t('password')}
            value={password}
            autoCapitalize={"none"}
            onChangeText={text => updatePassword(text)}
            autoCorrect={false}
            secureTextEntry={true}
          />
          {!passwordSecure && password &&
            <HelperText type="error">
              {i18n.t('register-password-warning')}
            </HelperText>
          }
        </View>}

        <View style={[style.container]}>
          <TextInput
            mode="outlined"
            label={i18n.t('first-name') + " *"}
            value={firstName}
            onChangeText={text => setFirstName(text)}
            maxLength={10}
            autoCorrect={false}
          />
        </View>

        <SafeAreaProvider>
          <View style={[style.container]}>
            <DatePickerInput
              mode="outlined"
              style={{ backgroundColor: colors.background }}
              locale={getDateInputLocale()}
              label={i18n.t('dob') + " *"}
              value={dob}
              onChange={(d) => { if (d) { setDob(d) } }}
              inputMode="start"
              validRange={validDobRange}
            />
            {(Global.calcAge(dob) >= MIN_AGE && Global.calcAge(dob) <= MAX_AGE) &&
              <HelperText type="info">{Global.format(i18n.t('register.age-subtitle'), Global.calcAge(dob).toString())}</HelperText>
            }
          </View>
        </SafeAreaProvider>

        <View style={[style.container]}>
          <TextInput
            mode="outlined"
            value={referrerCode}
            label={i18n.t('register.referral-code') + " (" + i18n.t('optional') + ")"}
            onChangeText={text => setReferrerCode(text)}
            style={{ backgroundColor: colors.background }}
            autoCapitalize={"none"}
            autoCorrect={false}
          />
        </View>

        <View style={{ marginBottom: 12 }}></View>

        <View style={[style.container]}>
          <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
            <Text>{i18n.t('register.gender')}</Text>
            <Text>{" *"}</Text>
          </View>
          <RadioButton.Group onValueChange={(itemValue) => { setGender(itemValue) }} value={gender}>
            <RadioButton.Item
              label={i18n.t('gender.male')}
              value="1"
              style={{ flexDirection: 'row-reverse' }}
            />
            <RadioButton.Item
              label={i18n.t('gender.female')}
              value="2"
              style={{ flexDirection: 'row-reverse' }}
            />
            <RadioButton.Item
              label={i18n.t('gender.other')}
              value="3"
              style={{ flexDirection: 'row-reverse' }}
            />
          </RadioButton.Group>
        </View>
        <View style={{ marginBottom: 24 }}></View>

        <View style={[{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }]}>
          <Text style={[{ flex: 1, flexWrap: 'wrap', flexGrow: 3 }]} onPress={() => {
            WebBrowser.openBrowserAsync(URL.TOS);
          }}>{i18n.t('register.agree')}</Text>
        </View>

        <View>
          <Text style={style.link} onPress={() => {
            WebBrowser.openBrowserAsync(URL.TOS);
          }}>{i18n.t('tos')}</Text>
          <Text style={style.link} onPress={() => {
            WebBrowser.openBrowserAsync(URL.PRIVACY);
          }}>{i18n.t('privacy-policy')}</Text>
        </View>

        <View style={{ marginBottom: 24 }}></View>

        <View style={[style.container]}>
          <Text style={{ fontSize: 12, color: "orange" }}>{i18n.t('register.asterisk-warning')}</Text>
        </View>
        <Button mode="contained" onPress={submit} style={{ marginBottom: 48 }}>
          <Text style={{ color: "white" }}>{i18n.t('register.title')}</Text>
        </Button>
      </VerticalView>
      <Alert visible={alertVisible} setVisible={setAlertVisible} message={i18n.t('register-email-success')} buttons={alertButtons} />
    </View>
  )
};

export default Register;