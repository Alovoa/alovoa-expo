import React from "react";
import {
  ScrollView,
  View,
  ImageBackground,
  TouchableOpacity,
  Platform,
  Alert,
  RefreshControl,
  Keyboard
} from "react-native";
import { useTheme, Text, Button, TextInput, Switch, RadioButton, IconButton } from "react-native-paper";
import styles, { GRAY } from "../assets/styles";
import { UserInterestAutocomplete, YourProfileResource, UserMiscInfoEnum, UserInterest, UnitsEnum, UserDto } from "../types";
import * as I18N from "../i18n";
import * as Global from "../Global";
import * as URL from "../URL";
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import { FontAwesome } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as WebBrowser from 'expo-web-browser';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { debounce } from "lodash";
import { StorageAccessFramework } from 'expo-file-system';

const userdataFileName = "userdata-alovoa.json"
const MIME_JSON = "application/json";

const i18n = I18N.getI18n()
const MAX_INTERESTS = 5;
const MIN_AGE = 16;
const MAX_AGE = 100;

enum Gender {
  MALE = 1,
  FEMALE = 2,
  OTHER = 3
}

enum GenderText {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other"
}

enum Intention {
  MEET = 1,
  DATE = 2,
  SEX = 3
}

enum IntentionText {
  MEET = "meet",
  DATE = "date",
  SEX = "sex"
}

const YourProfile = ({ route, navigation }) => {

  const { colors } = useTheme();
  const [refreshing, setRefreshing] = React.useState(false);
  const [data, setData] = React.useState<YourProfileResource>();
  const [user, setUser] = React.useState<UserDto>();
  const [profilePic, setProfilePic] = React.useState("");
  const [name, setName] = React.useState("");
  const [age, setAge] = React.useState(0);
  const [idEnc, setIdEnc] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [intention, setIntention] = React.useState(Intention.MEET);
  const [showIntention, setShowIntention] = React.useState(false);
  const [interest, setInterest] = React.useState("");
  const [interests, setInterests] = React.useState(Array<UserInterest>);
  const [loading, setLoading] = React.useState(false)
  const [suggestionsList, setSuggestionsList] = React.useState(Array<any>)
  const [minAge, setMinAge] = React.useState(MIN_AGE)
  const [maxAge, setMaxAge] = React.useState(MAX_AGE)
  const [minAgeText, setMinAgeText] = React.useState(MIN_AGE)
  const [maxAgeText, setMaxAgeText] = React.useState(MAX_AGE)
  const dropdownController = React.useRef()
  const [units, setUnits] = React.useState(UnitsEnum.SI)

  const [isLegal, setIsLegal] = React.useState(false);
  const [miscInfoDrugsTobacco, setMiscInfoDrugsTobacco] = React.useState(false)
  const [miscInfoDrugsAlcohol, setMiscInfoDrugsAlcohol] = React.useState(false)
  const [miscInfoDrugsCannabis, setMiscInfoDrugsCannabis] = React.useState(false)
  const [miscInfoDrugsOther, setMiscInfoDrugsOther] = React.useState(false)
  const [miscInfoKidsNo, setMiscInfoKidsNo] = React.useState(false)
  const [miscInfoKidsYes, setMiscInfoKidsYes] = React.useState(false)
  const [miscInfoRelationShipSingle, setMiscInfoRelationShipSingle] = React.useState(false)
  const [miscInfoRelationShipTaken, setMiscInfoRelationShipTaken] = React.useState(false)
  const [miscInfoRelationShipOpen, setMiscInfoRelationShipOpen] = React.useState(false)
  const [miscInfoRelationShipOther, setMiscInfoRelationShipOther] = React.useState(false)

  const [isGenderMaleEnabled, setIsGenderMaleEnabled] = React.useState(false);
  const [isGenderFemaleEnabled, setIsGenderFemaleEnabled] = React.useState(false);
  const [isGenderOtherEnabled, setIsGenderOtherEnabled] = React.useState(false);

  const descriptionRef = React.useRef(description);

  const debounceDescriptionHandler = React.useCallback(debounce(updateDescription, 1500), []);

  React.useEffect(() => {
    if (route.params?.changed) {
      load();
    }
  }, [route.params?.changed]);

  
  React.useEffect(() => {
    descriptionRef.current = description;
    debounceDescriptionHandler();
  }, [description]);

  React.useEffect(() => {
    addInterest();
  }, [interest]);

  const toggleGenderMaleSwitch = () => {
    setIsGenderMaleEnabled(previousState => !previousState)
    updateGenders(Gender.MALE, isGenderMaleEnabled);
  };
  const toggleGenderFemaleSwitch = () => {
    setIsGenderFemaleEnabled(previousState => !previousState);
    updateGenders(Gender.FEMALE, isGenderFemaleEnabled);
  };
  const toggleGenderOtherSwitch = () => {
    setIsGenderOtherEnabled(previousState => !previousState);
    updateGenders(Gender.OTHER, isGenderOtherEnabled);
  };
  const onClearPress = React.useCallback(() => {
    Keyboard.dismiss();
    setSuggestionsList([])
  }, [])

  function cleanInterest(txt: string) {
    let txtCopy = txt
    txtCopy = txtCopy.replace(/ /g, "-");
    let text = txtCopy.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
    return text;
  }

  const getSuggestions = React.useCallback(async (q: string) => {
    const filterToken = cleanInterest(q);
    dropdownController.current.setInputText(filterToken);
    if (typeof q !== 'string' || q.length < 2) {
      setSuggestionsList([])
      return
    }
    setLoading(true)
    const response = await Global.Fetch(Global.format(URL.USER_INTEREST_AUTOCOMPLETE, encodeURI(filterToken)));
    const items: Array<UserInterestAutocomplete> = response.data
    const suggestions = items
      .map((item: any) => ({
        id: item.name,
        title: item.name + " (" + item.countString + ")",
      }))

    setSuggestionsList(suggestions)
    setLoading(false)

  }, []);

  async function load() {
    let response = await Global.Fetch(URL.API_RESOURCE_YOUR_PROFILE);
    let data: YourProfileResource = response.data;
    setUser(data.user)
    setIdEnc(data.user.idEncoded);
    setProfilePic(data.user.profilePicture);
    setName(data.user.firstName);
    setAge(data.user.age);
    setDescription(data.user.description);
    setShowIntention(data.showIntention);
    setIsLegal(data.isLegal);
    setInterests(data.user.interests);
    setMinAge(data.user.preferedMinAge);
    setMaxAge(data.user.preferedMaxAge);
    setUnits(data.user.units);

    let intentionText = data.user.intention.text;
    switch (intentionText) {
      case IntentionText.MEET:
        setIntention(Intention.MEET);
        break;
      case IntentionText.DATE:
        setIntention(Intention.DATE);
        break;
      case IntentionText.SEX:
        setIntention(Intention.SEX);
        break;
    }

    let gendersData = data.user.preferedGenders.map(item => item.text);
    setIsGenderMaleEnabled(gendersData.includes(GenderText.MALE));
    setIsGenderFemaleEnabled(gendersData.includes(GenderText.FEMALE));
    setIsGenderOtherEnabled(gendersData.includes(GenderText.OTHER));

    let miscInfoData = data.user.miscInfos.map(item => item.value);
    setMiscInfoDrugsTobacco(miscInfoData.includes(UserMiscInfoEnum.DRUGS_TOBACCO));
    setMiscInfoDrugsAlcohol(miscInfoData.includes(UserMiscInfoEnum.DRUGS_ALCOHOL));
    setMiscInfoDrugsCannabis(miscInfoData.includes(UserMiscInfoEnum.DRUGS_CANNABIS));
    setMiscInfoDrugsOther(miscInfoData.includes(UserMiscInfoEnum.DRUGS_OTHER));
    setMiscInfoKidsNo(miscInfoData.includes(UserMiscInfoEnum.KIDS_NO));
    setMiscInfoKidsYes(miscInfoData.includes(UserMiscInfoEnum.KIDS_YES));
    setMiscInfoRelationShipSingle(miscInfoData.includes(UserMiscInfoEnum.RELATIONSHIP_SINGLE));
    setMiscInfoRelationShipTaken(miscInfoData.includes(UserMiscInfoEnum.RELATIONSHIP_TAKEN));
    setMiscInfoRelationShipOpen(miscInfoData.includes(UserMiscInfoEnum.RELATIONSHIP_OPEN));
    setMiscInfoRelationShipOther(miscInfoData.includes(UserMiscInfoEnum.RELATIONSHIP_OTHER));

    setUnits(data.user.units);
  }
  React.useEffect(() => {
    load();
  }, []);

  function toggleUserMisc(info: UserMiscInfoEnum, activated: boolean) {

    switch (info) {
      case UserMiscInfoEnum.KIDS_NO:
        setMiscInfoKidsNo(activated);
        break;
      case UserMiscInfoEnum.KIDS_YES:
        setMiscInfoKidsYes(activated);
        break;
      case UserMiscInfoEnum.RELATIONSHIP_SINGLE:
        setMiscInfoRelationShipSingle(activated);
        break;
      case UserMiscInfoEnum.RELATIONSHIP_TAKEN:
        setMiscInfoRelationShipTaken(activated);
        break;
      case UserMiscInfoEnum.RELATIONSHIP_OPEN:
        setMiscInfoRelationShipOpen(activated);
        break;
      case UserMiscInfoEnum.RELATIONSHIP_OTHER:
        setMiscInfoRelationShipOther(activated);
        break;
      case UserMiscInfoEnum.DRUGS_ALCOHOL:
        setMiscInfoDrugsAlcohol(activated);
        break;
      case UserMiscInfoEnum.DRUGS_TOBACCO:
        setMiscInfoDrugsTobacco(activated);
        break;
      case UserMiscInfoEnum.DRUGS_CANNABIS:
        setMiscInfoDrugsCannabis(activated);
        break;
      case UserMiscInfoEnum.DRUGS_OTHER:
        setMiscInfoDrugsOther(activated);
        break;
    }

    if (activated) {
      switch (info) {
        case UserMiscInfoEnum.KIDS_NO:
          setMiscInfoKidsYes(false);
          break;
        case UserMiscInfoEnum.KIDS_YES:
          setMiscInfoKidsNo(false);
          break;
        case UserMiscInfoEnum.RELATIONSHIP_SINGLE:
          setMiscInfoRelationShipTaken(false);
          setMiscInfoRelationShipOpen(false);
          setMiscInfoRelationShipOther(false);
          break;
        case UserMiscInfoEnum.RELATIONSHIP_TAKEN:
          setMiscInfoRelationShipSingle(false);
          setMiscInfoRelationShipOpen(false);
          setMiscInfoRelationShipOther(false);
          break;
        case UserMiscInfoEnum.RELATIONSHIP_OPEN:
          setMiscInfoRelationShipSingle(false);
          setMiscInfoRelationShipTaken(false);
          setMiscInfoRelationShipOther(false);
          break;
        case UserMiscInfoEnum.RELATIONSHIP_OTHER:
          setMiscInfoRelationShipSingle(false);
          setMiscInfoRelationShipTaken(false);
          setMiscInfoRelationShipOpen(false);
          break;
      }
    }

    updateMiscInfo(info, activated);

  }

  async function logout() {
    Global.SetStorage(Global.STORAGE_PAGE, "1");
    Global.navigate("Login");
  }

  async function addInterest() {
    if (interest) {
      await Global.Fetch(Global.format(URL.USER_ADD_INTEREST, interest), 'post');
      let newInterest: UserInterest = { text: interest };
      interests.push(newInterest);
      setInterests(interests);
      onClearPress();
      dropdownController.current.setInputText("");
      Keyboard.dismiss();
    }
  }

  async function removeInterest(interest: UserInterest) {
    Alert.alert(i18n.t('profile.interest-alert.title'), Global.format(i18n.t('profile.interest-alert.subtitle'), interest.text), [
      {
        text: i18n.t('cancel'),
        onPress: () => { },
        style: 'cancel',
      },
      {
        text: i18n.t('ok'),
        onPress: async () => {
          await Global.Fetch(Global.format(URL.USER_REMOVE_INTEREST, interest.text), 'post');
          let interestsCopy = interests.slice();
          interestsCopy.forEach((item, index) => {
            if (item === interest) interestsCopy.splice(index, 1);
          });
          setInterests(interestsCopy);
        }
      }
    ]);
  }

  async function updateDescription() {
    if (descriptionRef.current) {
      Global.Fetch(URL.USER_UPDATE_DESCRIPTION, 'post', descriptionRef.current, 'text/plain');
    }
  }

  async function updateIntention(num: number) {
    await Global.Fetch(Global.format(URL.USER_UPDATE_INTENTION, String(num)), 'post');
    Global.ShowToast(i18n.t('profile.intention-toast'));
    setIntention(num);
    setShowIntention(false);
  }

  async function updateGenders(gender: Gender, state: boolean) {
    await Global.Fetch(Global.format(URL.USER_UPDATE_PREFERED_GENDER, String(gender), state ? "1" : "0"), 'post');
  }

  async function updateMinAge(num: number) {
    await Global.Fetch(Global.format(URL.USER_UPDATE_MIN_AGE, String(num)), 'post');
    setMinAge(num);
  }

  async function updateMaxAge(num: number) {
    await Global.Fetch(Global.format(URL.USER_UPDATE_MAX_AGE, String(num)), 'post');
    setMaxAge(num);
  }

  async function updateUnits(num: number) {
    setUnits(num);
    await Global.Fetch(Global.format(URL.USER_UPDATE_UNITS, String(num)), 'post');
  }

  async function updateMiscInfo(num: UserMiscInfoEnum, activated: boolean) {
    await Global.Fetch(Global.format(URL.USER_UPDATE_MISC_INFO, String(num), activated ? "1" : "0"), 'post');
  }

  async function downloadUserData() {

    const response = await Global.Fetch(Global.format(URL.USER_USERDATA, idEnc));
    const userData = JSON.stringify(response.data);

    if (Platform.OS == 'android') {
      const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (permissions.granted) {
        const uri = permissions.directoryUri;
        let newFile = await StorageAccessFramework.createFileAsync(uri, userdataFileName, MIME_JSON);
        await StorageAccessFramework.writeAsStringAsync(newFile, userData);
        Global.ShowToast(i18n.t('profile.download-userdata-success'));
      }
    }

    //TODO iOS
  }

  async function deleteAccount() {
    await Global.Fetch(URL.USER_DELETE_ACCOUNT, 'post');
    Global.ShowToast(i18n.t('profile.delete-account-success'));
  }

  return (
    <ScrollView style={[styles.containerProfile]} keyboardShouldPersistTaps='handled'
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}>
      <TouchableOpacity
        onPress={() => Global.navigate("Profile.Fotos", { user: user })}>
        <ImageBackground source={{ uri: profilePic }} style={styles.photo}>
        </ImageBackground>
      </TouchableOpacity>

      <View style={{alignItems: 'center', justifyContent: 'center', zIndex: 10, marginTop: -54}}>
        <Button mode="contained-tonal" style={{ width: 240 }} onPress={() => Global.navigate("Profile.Fotos", { user: user })}>{i18n.t('profile.photos.manage')}</Button>
      </View>

      <View style={[styles.containerProfileItem, { marginTop: 32 }]}>
        <Text style={[styles.name, {}]}>{name + ", " + age}</Text>
        <View style={{ height: 140, width: 300, marginTop: 24 }}>
          <TextInput
            multiline
            mode="outlined"
            onChangeText={(text) => {
              setDescription(text)
            }}
            placeholder={i18n.t('profile.onboarding.description-placeholder')}
            maxLength={200}
            value={description}
            autoCorrect={false}
          />
        </View>
        <View style={{ marginTop: 12 }}>
          <Text>{i18n.t('profile.intention.title')}</Text>
          <RadioButton.Group
            value={intention.toString()}
            onValueChange={(value: string) => updateIntention(Number(value))}>
            <RadioButton.Item labelVariant="bodyMedium" label={i18n.t('profile.intention.meet')} value={String(Intention.MEET)} style={{ flexDirection: 'row-reverse' }} disabled={!showIntention && intention != Intention.MEET} />
            <RadioButton.Item labelVariant="bodyMedium" label={i18n.t('profile.intention.date')} value={String(Intention.DATE)} style={{ flexDirection: 'row-reverse' }} disabled={!showIntention && intention != Intention.DATE} />
            <RadioButton.Item labelVariant="bodyMedium" label={i18n.t('profile.intention.sex')} value={String(Intention.SEX)} style={{ flexDirection: 'row-reverse' }} disabled={!showIntention && intention != Intention.SEX || !isLegal} />
          </RadioButton.Group>
        </View>

        <View style={{ marginTop: 12 }}>
          <Text>{i18n.t('profile.gender')}</Text>
          <View style={{ flexDirection: "row" }}>
            <View style={{ flexDirection: "row", alignItems: 'center', marginRight: 12 }}>
              <Switch onValueChange={toggleGenderMaleSwitch}
                trackColor={{ true: '#F089AB', false: '#9e9e9e' }}
                thumbColor={isGenderMaleEnabled ? '#EC407A' : '#eeeeee'}
                value={isGenderMaleEnabled} />
              <Text style={styles.switchText}>{i18n.t('gender.male')}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: 'center', marginRight: 12 }}>
              <Switch onValueChange={toggleGenderFemaleSwitch}
                trackColor={{ true: '#F089AB', false: '#9e9e9e' }}
                thumbColor={isGenderFemaleEnabled ? '#EC407A' : '#eeeeee'}
                value={isGenderFemaleEnabled} />
              <Text style={styles.switchText}>{i18n.t('gender.female')}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: 'center' }}>
              <Switch onValueChange={toggleGenderOtherSwitch}
                trackColor={{ true: '#F089AB', false: '#9e9e9e' }}
                thumbColor={isGenderOtherEnabled ? '#EC407A' : '#eeeeee'}
                value={isGenderOtherEnabled} />
              <Text style={styles.switchText}>{i18n.t('gender.other')}</Text>
            </View>
          </View>
        </View>
        <View style={{ marginTop: 12 }}>
          <Text>{i18n.t('profile.age.min')}</Text>
          <Text>{minAgeText}</Text>
          <Slider
            value={minAge}
            minimumValue={MIN_AGE}
            maximumValue={maxAge}
            minimumTrackTintColor={colors.secondary}
            maximumTrackTintColor={GRAY}
            thumbTintColor={colors.primary}
            step={1}
            onValueChange={value => {
              setMinAgeText(value);
            }}
            onSlidingComplete={value => {
              updateMinAge(value);
            }}
          />
          <Text>{i18n.t('profile.age.max')}</Text>
          <Text>{maxAgeText}</Text>
          <Slider
            value={maxAge}
            minimumValue={minAge}
            maximumValue={MAX_AGE}
            minimumTrackTintColor={colors.secondary}
            maximumTrackTintColor={GRAY}
            thumbTintColor={colors.primary}
            step={1}
            onValueChange={value => {
              setMaxAgeText(value);
            }}
            onSlidingComplete={value => {
              updateMaxAge(value);
            }}
          />
        </View>
        <View style={{ marginTop: 24 }}>
          <Text>{i18n.t('profile.onboarding.interests')}</Text>

          {interests.length < MAX_INTERESTS &&
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
              <AutocompleteDropdown
                EmptyResultComponent={<></>}
                controller={controller => {
                  dropdownController.current = controller
                }}
                direction={Platform.select({ ios: 'down' })}
                dataSet={suggestionsList}
                onChangeText={text => getSuggestions(text)}
                onSelectItem={item => {
                  item && setInterest(item.id)
                }}
                debounce={500}
                suggestionsListMaxHeight={200}
                onClear={onClearPress}
                loading={loading}
                useFilter={false}
                textInputProps={{
                  backgroundColor: '#FDE7F4',
                  placeholder: 'starwars',
                  autoCorrect: false,
                  autoCapitalize: 'none',
                  style: {
                    borderRadius: 25,
                    paddingLeft: 18,
                  },
                }}
                rightButtonsContainerStyle={{
                  right: 8,
                  height: 30,
                  backgroundColor: '#FDE7F4',
                  alignSelf: 'center',
                }}
                inputContainerStyle={{
                  backgroundColor: '#FDE7F4',
                  borderRadius: 25,
                }}
                suggestionsListContainerStyle={{
                }}
                containerStyle={{ flexGrow: 1, flexShrink: 1 }}
                renderItem={(item, text) => <Text style={{ padding: 15, backgroundColor: colors.background }}>{item.title}</Text>}
                ChevronIconComponent={<FontAwesome name="chevron-down" size={20} />}
                ClearIconComponent={<FontAwesome name="times-circle" size={18} />}
                inputHeight={50}
                showChevron={false}
                closeOnBlur={false}
              />
              <IconButton icon='plus' mode='contained' style={{ width: 38, height: 38 }} size={20} onPress={() => addInterest()} />
            </View>}
          {
            interests.map((item, index) => (
              <Button key={index} onPress={() => { removeInterest(item) }} icon="close-circle" mode="elevated" style={{ marginRight: 8, marginBottom: 8 }}>
                <Text>{item.text}</Text>
              </Button>
            ))
          }
        </View>


        <View style={{ marginTop: 24 }}>
          <Text>{i18n.t('profile.misc-info.relationship.title')}</Text>
          <View style={{ flexDirection: "row", flexWrap: 'wrap' }}>
            <View style={{ flexDirection: "row", alignItems: 'center', marginRight: 12 }}>
              <Switch onValueChange={() => { toggleUserMisc(UserMiscInfoEnum.RELATIONSHIP_SINGLE, !miscInfoRelationShipSingle) }}
                trackColor={{ true: '#F089AB', false: '#9e9e9e' }}
                thumbColor={miscInfoRelationShipSingle ? '#EC407A' : '#eeeeee'}
                value={miscInfoRelationShipSingle} />
              <Text style={styles.switchText}>{i18n.t('profile.misc-info.relationship.single')}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: 'center', marginRight: 12 }}>
              <Switch onValueChange={() => { toggleUserMisc(UserMiscInfoEnum.RELATIONSHIP_TAKEN, !miscInfoRelationShipTaken) }}
                trackColor={{ true: '#F089AB', false: '#9e9e9e' }}
                thumbColor={miscInfoRelationShipTaken ? '#EC407A' : '#eeeeee'}
                value={miscInfoRelationShipTaken} />
              <Text style={styles.switchText}>{i18n.t('profile.misc-info.relationship.taken')}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: 'center', marginRight: 12 }}>
              <Switch onValueChange={() => { toggleUserMisc(UserMiscInfoEnum.RELATIONSHIP_OPEN, !miscInfoRelationShipOpen) }}
                trackColor={{ true: '#F089AB', false: '#9e9e9e' }}
                thumbColor={miscInfoRelationShipOpen ? '#EC407A' : '#eeeeee'}
                value={miscInfoRelationShipOpen} />
              <Text style={styles.switchText}>{i18n.t('profile.misc-info.relationship.open')}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: 'center' }}>
              <Switch onValueChange={() => { toggleUserMisc(UserMiscInfoEnum.RELATIONSHIP_OTHER, !miscInfoRelationShipOther) }}
                trackColor={{ true: '#F089AB', false: '#9e9e9e' }}
                thumbColor={miscInfoRelationShipOther ? '#EC407A' : '#eeeeee'}
                value={miscInfoRelationShipOther} />
              <Text style={styles.switchText}>{i18n.t('profile.misc-info.relationship.other')}</Text>
            </View>
          </View>

          <Text>{i18n.t('profile.misc-info.kids.title')}</Text>
          <View style={{ flexDirection: "row", flexWrap: 'wrap' }}>
            <View style={{ flexDirection: "row", alignItems: 'center', marginRight: 12 }}>
              <Switch onValueChange={() => { toggleUserMisc(UserMiscInfoEnum.KIDS_NO, !miscInfoKidsNo) }}
                trackColor={{ true: '#F089AB', false: '#9e9e9e' }}
                thumbColor={miscInfoKidsNo ? '#EC407A' : '#eeeeee'}
                value={miscInfoKidsNo} />
              <Text style={styles.switchText}>{i18n.t('profile.misc-info.kids.no')}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: 'center', marginRight: 12 }}>
              <Switch onValueChange={() => { toggleUserMisc(UserMiscInfoEnum.KIDS_YES, !miscInfoKidsYes) }}
                trackColor={{ true: '#F089AB', false: '#9e9e9e' }}
                thumbColor={miscInfoKidsYes ? '#EC407A' : '#eeeeee'}
                value={miscInfoKidsYes} />
              <Text style={styles.switchText}>{i18n.t('profile.misc-info.kids.yes')}</Text>
            </View>
          </View>

          <Text>{i18n.t('profile.misc-info.drugs.title')}</Text>
          <View style={{ flexDirection: "row", flexWrap: 'wrap' }}>
            <View style={{ flexDirection: "row", alignItems: 'center', marginRight: 12 }}>
              <Switch onValueChange={() => { toggleUserMisc(UserMiscInfoEnum.DRUGS_ALCOHOL, !miscInfoDrugsAlcohol) }}
                trackColor={{ true: '#F089AB', false: '#9e9e9e' }}
                thumbColor={miscInfoDrugsAlcohol ? '#EC407A' : '#eeeeee'}
                value={miscInfoDrugsAlcohol} />
              <Text style={styles.switchText}>{i18n.t('profile.misc-info.drugs.alcohol')}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: 'center', marginRight: 12 }}>
              <Switch onValueChange={() => { toggleUserMisc(UserMiscInfoEnum.DRUGS_TOBACCO, !miscInfoDrugsTobacco) }}
                trackColor={{ true: '#F089AB', false: '#9e9e9e' }}
                thumbColor={miscInfoDrugsTobacco ? '#EC407A' : '#eeeeee'}
                value={miscInfoDrugsTobacco} />
              <Text style={styles.switchText}>{i18n.t('profile.misc-info.drugs.tobacco')}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: 'center' }}>
              <Switch onValueChange={() => { toggleUserMisc(UserMiscInfoEnum.DRUGS_CANNABIS, !miscInfoDrugsCannabis) }}
                trackColor={{ true: '#F089AB', false: '#9e9e9e' }}
                thumbColor={miscInfoDrugsCannabis ? '#EC407A' : '#eeeeee'}
                value={miscInfoDrugsCannabis} />
              <Text style={styles.switchText}>{i18n.t('profile.misc-info.drugs.cannabis')}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: 'center' }}>
              <Switch onValueChange={() => { toggleUserMisc(UserMiscInfoEnum.DRUGS_OTHER, !miscInfoDrugsOther) }}
                trackColor={{ true: '#F089AB', false: '#9e9e9e' }}
                thumbColor={miscInfoDrugsOther ? '#EC407A' : '#eeeeee'}
                value={miscInfoDrugsOther} />
              <Text style={styles.switchText}>{i18n.t('profile.misc-info.drugs.other')}</Text>
            </View>
          </View>
        </View>

        <View style={{ marginTop: 24 }}>
          <Text>{i18n.t('profile.units.title')}</Text>
          <RadioButton.Group
            value={units.toString()}
            onValueChange={(value: string) => updateUnits(Number(value))}>
            <RadioButton.Item labelVariant="bodyMedium" label={i18n.t('profile.units.si')} value={String(UnitsEnum.SI)} style={{ flexDirection: 'row-reverse' }} />
            <RadioButton.Item labelVariant="bodyMedium" label={i18n.t('profile.units.imperial')} value={String(UnitsEnum.IMPERIAL)} style={{ flexDirection: 'row-reverse' }} />
          </RadioButton.Group>
        </View>

        <View style={{ marginTop: 128 }}>
          <Button mode='contained' onPress={() => logout()}>
            <Text>{i18n.t('profile.logout')}</Text>
          </Button>
          <View style={{ marginTop: 24 }}>
            <Text style={[styles.link, { padding: 8 }]} onPress={() => {
              WebBrowser.openBrowserAsync(URL.PRIVACY);
            }}>{i18n.t('privacy-policy')}</Text>
            <Text style={[styles.link, { padding: 8 }]} onPress={() => {
              WebBrowser.openBrowserAsync(URL.TOS);
            }}>{i18n.t('tos')}</Text>
            <Text style={[styles.link, { padding: 8 }]} onPress={() => {
              WebBrowser.openBrowserAsync(URL.IMPRINT);
            }}>{i18n.t('imprint')}</Text>
            <Text style={[styles.link, { padding: 8 }]} onPress={() => {
              downloadUserData();
            }}>{i18n.t('profile.download-userdata')}</Text>
            <Text style={[styles.link, { padding: 8 }]} onPress={() => {
              deleteAccount();
            }}>{i18n.t('profile.delete-account')}</Text>
          </View>

        </View>
      </View>
    </ScrollView>
  );
};

export default YourProfile;
