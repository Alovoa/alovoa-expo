import React from "react";
import { Onboarding, Main } from "../screens";
import { View, Platform, Pressable, ScrollView, Text, StyleSheet, Switch, Image, TextInput } from "react-native";
import { Buffer } from "buffer";
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as Global from "../Global";
import * as URL from "../URL";
import * as I18N from "../i18n";
import { FontAwesome } from '@expo/vector-icons';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Picker } from '@react-native-picker/picker';
import { RegisterBody } from "../types";

const i18n = I18N.getI18n()
const APP_URL = Linking.createURL("");

const MIN_AGE = 16
const MAX_AGE = 99
const DEFAULT_AGE = 18

function subtractYears(years: number): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date;
}

const Register = () => {

  const [isDatePickerVisible, setDatePickerVisibility] = React.useState(false);
  const [firstName, setFirstName] = React.useState("");
  const [dob, setDob] = React.useState(subtractYears(DEFAULT_AGE));
  const [gender, setGender] = React.useState(1);
  const [isTosEnabled, setIsTosEnabled] = React.useState(false);
  const [isPrivacyEnabled, setIsPrivacyEnabled] = React.useState(false);

  const minDate = subtractYears(MAX_AGE);
  const maxDate = subtractYears(MIN_AGE);

  React.useEffect(() => {
    Global.GetStorage("firstName").then((firstNameStorage) => {
      setFirstName(firstNameStorage ? String(firstNameStorage) : "");
    });
  }, [firstName]);

  const showDatePicker = () => {
    console.log("showDatePicker")
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
    let data = {} as RegisterBody;
    data.dateOfBirth = dob;
    data.firstName = firstName;
    data.gender = gender;
    data.privacy = isPrivacyEnabled;
    data.termsConditions = isTosEnabled;

    try {
      await Global.Fetch(URL.REGISTER_OAUTH, 'post', data);
      await Global.SetStorage("page", Global.INDEX_ONBOARDING);
      Global.loadPage(Global.INDEX_ONBOARDING);
    } catch(e) {}
  }

  return (

    <View style={{ flex: 1, padding: 12 }}>
      <ScrollView>

        <Text style={{ textAlign: 'center', marginBottom: 4, fontSize: 32, fontWeight: '500' }}>{i18n.t('register.title')}</Text>
        <Text style={{ textAlign: 'center', marginBottom: 36, fontSize: 12 }}>{i18n.t('register.subtitle')}</Text>

        <View style={[styles.container]}>
          <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
            <Text>{i18n.t('first-name')}</Text>
            <Text style={{ color: "red" }}>{" *"}</Text>
          </View>
          <TextInput
            defaultValue={firstName}
            autoCapitalize={"none"}
            maxLength={10}
            autoCorrect={false}
            style={{ fontSize: 18 }}
          />
        </View>

        <View style={[styles.container]}>
          <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
            <Text>{i18n.t('dob')}</Text>
            <Text style={{ color: "red" }}>{" *"}</Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Pressable onPress={showDatePicker} style={[styles.button]}>
              <FontAwesome name="calendar" size={18} color="white" style={styles.icon} />
              <Text
                style={{ fontSize: 18, color: "white" }}>{dob.toISOString().split('T')[0]}</Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.container]}>
          <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
            <Text>{i18n.t('gender.title')}</Text>
            <Text style={{ color: "red" }}>{" *"}</Text>
          </View>
          <Picker
            style={{ fontSize: 18 }}
            selectedValue={gender}
            onValueChange={(itemValue, itemIndex) => setGender(itemValue)}>
            <Picker.Item label={i18n.t('gender.male')} value="1" style={{ fontSize: 18 }} />
            <Picker.Item label={i18n.t('gender.female')} value="2" style={{ fontSize: 18 }} />
            <Picker.Item label={i18n.t('gender.other')} value="3" style={{ fontSize: 18 }} />
          </Picker>
        </View>

        <View style={[styles.container]}>
          <Text>{i18n.t('register.referral-code') + " (" + i18n.t('optional') + ")"}</Text>
          <TextInput
            autoCapitalize={"none"}
            autoCorrect={false}
            placeholder={"c2f2-29be-4933-b9b9-3efa"}
            style={{ fontSize: 18 }}
          />
        </View>

        <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
          <Switch onValueChange={toggleTosSwitch}
            trackColor={{ true: '#F089AB', false: '#9e9e9e' }}
            thumbColor={isTosEnabled ? '#EC407A' : '#eeeeee'}
            ios_backgroundColor="#3e3e3e"
            value={isTosEnabled} />
          <Text style={{ flex: 1, flexWrap: 'wrap', flexGrow: 3 }}>{i18n.t('register.tos-agree')}</Text><Text style={styles.link} onPress={() => {
            WebBrowser.openBrowserAsync(URL.TOS);
          }}>{" " + i18n.t('link')}</Text>
        </View>

        <View style={[{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }]}>
          <Switch onValueChange={togglePrivacySwitch}
            trackColor={{ true: '#F089AB', false: '#9e9e9e' }}
            thumbColor={isPrivacyEnabled ? '#EC407A' : '#eeeeee'}
            value={isPrivacyEnabled} />
          <Text style={{ flex: 1, flexWrap: 'wrap', flexGrow: 3 }}>{i18n.t('register.privacy-agree')}</Text>
          <Text style={styles.link} onPress={() => {
            WebBrowser.openBrowserAsync(URL.PRIVACY);
          }}>{" " + i18n.t('link')}</Text>
        </View>

        <Text style={{ color: "red", marginBottom: 24 }}>{i18n.t('register.asterisk-warning')}</Text>

        <Pressable style={[styles.button]} onPress={submit}><FontAwesome name="check" color="white" style={styles.icon} />
          <Text style={{ color: "white" }}>{i18n.t('register.title')}</Text>
        </Pressable>

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