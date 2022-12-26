import React from "react";
import { useTheme, Text, Button, TextInput, Switch, RadioButton } from "react-native-paper";
import { View, ScrollView, StyleSheet } from "react-native";
import * as WebBrowser from 'expo-web-browser';
import * as Global from "../Global";
import * as URL from "../URL";
import * as I18N from "../i18n";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { RegisterBody } from "../types";

const i18n = I18N.getI18n()

const MIN_AGE = 16
const MAX_AGE = 100
const DEFAULT_AGE = 18

function subtractYears(years: number): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date;
}

const Register = ({ route, navigation }) => {

  const registerEmail = route.params?.registerEmail;
  const { colors } = useTheme();
  const scrollRef = React.useRef(null);

  const [isDatePickerVisible, setDatePickerVisibility] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [emailValid, setEmailValid] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [passwordSecure, setPasswordSecure] = React.useState(false);
  const [firstName, setFirstName] = React.useState("");
  const [dob, setDob] = React.useState(subtractYears(DEFAULT_AGE));
  const [gender, setGender] = React.useState("1");
  const [isTosEnabled, setIsTosEnabled] = React.useState(false);
  const [isPrivacyEnabled, setIsPrivacyEnabled] = React.useState(false);
  const [referrerCode, setReferrerCode] = React.useState("");

  const minDate = subtractYears(MAX_AGE);
  const maxDate = subtractYears(MIN_AGE);

  async function load() {
    let name = await Global.GetStorage(Global.STORAGE_FIRSTNAME);
    setFirstName(name ? String(name) : "");
  }

  React.useEffect(() => {
    load();
    navigation.setOptions({
      title: ''
    });
  }, []);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDateConfirm = (date: Date) => {
    hideDatePicker();
    setDob(date);
  };

  const toggleTosSwitch = () => setIsTosEnabled(previousState => !previousState);
  const togglePrivacySwitch = () => setIsPrivacyEnabled(previousState => !previousState);

  async function submit() {
    if (isPrivacyEnabled && isTosEnabled && firstName && (!registerEmail || registerEmail && emailValid && passwordSecure)) {
      let data = {} as RegisterBody;
      data.dateOfBirth = dob;
      data.firstName = firstName;
      data.gender = Number(gender);
      data.privacy = isPrivacyEnabled;
      data.termsConditions = isTosEnabled;
      data.referrerCode = referrerCode
      if (registerEmail) {
        data.email = email;
        data.password = password;
        try {
          await Global.Fetch(URL.REGISTER, 'post', data);
          Global.ShowToast(i18n.t('register-email-success'));
          Global.navigate("Login");
        } catch (e) { }
      } else {
        try {
          await Global.Fetch(URL.REGISTER_OAUTH, 'post', data);
          await Global.SetStorage(Global.STORAGE_PAGE, Global.INDEX_ONBOARDING);
          Global.loadPage(Global.INDEX_ONBOARDING);
        } catch (e) { }
      }


    } else {
      scrollRef?.current?.scrollTo({ x: 0, y: 0, animated: true });
    }
  }

  function updatePassword(text: string) {
    setPassword(text);
    setPasswordSecure(Global.isPasswordSecure(text));
  }

 

  return (

    <View style={{ flex: 1, padding: 12, backgroundColor: colors.background }}>
      <ScrollView ref={scrollRef}>

        <Text style={{ textAlign: 'center', marginBottom: 4, fontSize: 32, fontWeight: '500' }}>{i18n.t('register.title')}</Text>
        <Text style={{ textAlign: 'center', marginBottom: 36, fontSize: 12 }}>{i18n.t('register.subtitle')}</Text>

        {registerEmail && <View style={[styles.container]}>
          <TextInput
            style={{ backgroundColor: colors.background }}
            label={i18n.t('email') + " *"}
            value={email}
            onChangeText={text => {
              setEmail(text);
              setEmailValid(Global.isEmailValid(text));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>}

        {registerEmail && <View style={[styles.container]}>
          <TextInput
            style={{ backgroundColor: colors.background }}
            label={i18n.t('password')}
            value={password}
            autoCapitalize={"none"}
            onChangeText={text => updatePassword(text)}
            autoCorrect={false}
            secureTextEntry={true}
          />
          {
            !passwordSecure && <Text style={{ fontSize: 10, color: 'orange', marginTop: 4 }}>{i18n.t('register-password-warning')}</Text>
          }
        </View>}

        <View style={[styles.container]}>
          <TextInput
            style={{ backgroundColor: colors.background }}
            label={i18n.t('first-name') + " *"}
            value={firstName}
            onChangeText={text => setFirstName(text)}
            maxLength={10}
            autoCorrect={false}
          />
        </View>

        <View style={[styles.container]}>
          <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
            <Text>{i18n.t('dob') + " *"}</Text>
          </View>
          <View style={{ paddingTop: 6 }}>
            <Button onPress={showDatePicker} icon="calendar" mode="elevated" style={{ width: 160 }}>
              <Text
                style={{ color: "white" }}>{dob.toISOString().split('T')[0]?.replace(/-/g, '/')}</Text>
            </Button>
          </View>
        </View>

        <View style={[styles.container]}>
          <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
            <Text>{i18n.t('gender.title')}</Text>
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

        <View style={[styles.container]}>
          <TextInput
            value={referrerCode}
            label={i18n.t('register.referral-code') + " (" + i18n.t('optional') + ")"}
            onChangeText={text => setReferrerCode(text)}
            style={{ backgroundColor: colors.background }}
            autoCapitalize={"none"}
            autoCorrect={false}
            placeholder={"c2f2-29be-4933-b9b9-3efa"}
          />
        </View>

        <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
          <Switch onValueChange={toggleTosSwitch}
            value={isTosEnabled} />
          <Text style={{ flex: 1, flexWrap: 'wrap', flexGrow: 3 }}>{i18n.t('register.tos-agree')}</Text><Text style={styles.link} onPress={() => {
            WebBrowser.openBrowserAsync(URL.TOS);
          }}>{" " + i18n.t('link')}</Text>
        </View>

        <View style={[{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }]}>
          <Switch onValueChange={togglePrivacySwitch}
            value={isPrivacyEnabled} />
          <Text style={{ flex: 1, flexWrap: 'wrap', flexGrow: 3 }}>{i18n.t('register.privacy-agree')}</Text>
          <Text style={styles.link} onPress={() => {
            WebBrowser.openBrowserAsync(URL.PRIVACY);
          }}>{" " + i18n.t('link')}</Text>
        </View>

        <View style={styles.container}>
          <Text style={{ fontSize: 10, color: "orange" }}>{i18n.t('register.asterisk-warning')}</Text>
        </View>
        <Button mode="contained" onPress={submit}>
          <Text style={{ color: "white" }}>{i18n.t('register.title')}</Text>
        </Button>

        <Text style={styles.link} onPress={() => {
          WebBrowser.openBrowserAsync(URL.IMPRINT);
        }}>{i18n.t('imprint')}</Text>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={hideDatePicker}
          date={dob}
          maximumDate={maxDate}
          minimumDate={minDate}
        />
      </ScrollView>
    </View>
  )
};

export default Register;

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
    backgroundColor: '#ec407a',
    margin: 4,
    flexDirection: 'row',
  },
  buttonText: {
    color: 'white'
  },
  icon: {
    marginRight: 8
  },
  title: {
  },
  container: {
    marginBottom: 24
  }
});