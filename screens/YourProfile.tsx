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
import { useTheme, Text, Button, TextInput, Switch, RadioButton, IconButton, PaperProvider } from "react-native-paper";
import styles, { GRAY } from "../assets/styles";
import { UserInterestAutocomplete, YourProfileResource, UserMiscInfoEnum, UserInterest, UnitsEnum, UserDto, GenderEnum, Gender, GenderMap } from "../types";
import * as I18N from "../i18n";
import * as Global from "../Global";
import * as URL from "../URL";
import { AutocompleteDropdown, AutocompleteDropdownContextProvider, AutocompleteDropdownRef } from 'react-native-autocomplete-dropdown';
import { FontAwesome } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as WebBrowser from 'expo-web-browser';
import { debounce } from "lodash";
import * as FileSystem from 'expo-file-system';
import { StorageAccessFramework } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import SelectModal from "../components/SelectModal";
import AgeRangeSliderModal from "../components/RangeSliderModal";

const userdataFileName = "userdata-alovoa.json"
const MIME_JSON = "application/json";

const i18n = I18N.getI18n()
const MAX_INTERESTS = 5;
const MIN_AGE = 18;
const MAX_AGE = 100;

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
  const [requestingDeletion, setRequestingDeletion] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [user, setUser] = React.useState<UserDto>();
  const [profilePic, setProfilePic] = React.useState<string>();
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
  const dropdownController = React.useRef<AutocompleteDropdownRef>()
  const [units, setUnits] = React.useState(UnitsEnum.SI)

  const [isLegal, setIsLegal] = React.useState(false);

  const [preferredGenders, setPreferredGenders] = React.useState(Array<number>);
  const [miscInfoKids, setMiscInfoKids] = React.useState(Array<number>);
  const [miscInfoDrugs, setMiscInfoDrugs] = React.useState(Array<number>);
  const [miscInfoRelationship, setMiscInfoRelationship] = React.useState(Array<number>);

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

    setPreferredGenders(data.user.preferedGenders.map(item => item.id));

    setMiscInfoDrugs(data.user.miscInfos.filter(item => item.id <= UserMiscInfoEnum.DRUGS_OTHER && item.id >= UserMiscInfoEnum.DRUGS_TOBACCO)
      .map(item => item.id));
    setMiscInfoKids(data.user.miscInfos.filter(item => item.id <= UserMiscInfoEnum.KIDS_YES && item.id >= UserMiscInfoEnum.KIDS_NO)
      .map(item => item.id));
    setMiscInfoRelationship(data.user.miscInfos.filter(item => item.id <= UserMiscInfoEnum.RELATIONSHIP_OTHER && item.id >= UserMiscInfoEnum.RELATIONSHIP_SINGLE)
      .map(item => item.id));

    setUnits(data.user.units);
  }
  React.useEffect(() => {
    load();
  }, []);

  async function logout() {
    Global.SetStorage(Global.STORAGE_PAGE, "1");
    Global.navigate("Login");
  }

  async function addInterest(interest: string) {
    if (interest) {
      await Global.Fetch(Global.format(URL.USER_ADD_INTEREST, interest), 'post');
      let newInterest: UserInterest = { text: interest };
      interests.push(newInterest);
      setInterests(interests);
      onClearPress();
      dropdownController.current?.setInputText("");
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

  async function updateGenders(genderId: number, state: boolean) {
    await Global.Fetch(Global.format(URL.USER_UPDATE_PREFERED_GENDER, genderId, state ? "1" : "0"), 'post');
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
    } else {
      let fileName = FileSystem.documentDirectory + '/alovoa.json';
      await FileSystem.writeAsStringAsync(fileName, userData, { encoding: FileSystem.EncodingType.UTF8 });
      Global.ShowToast(i18n.t('profile.download-userdata-success'));
      if (await Sharing.isAvailableAsync()) {
        Sharing.shareAsync(fileName);
      }
    }
  }

  async function deleteAccount() {
    if (!requestingDeletion) {
      setRequestingDeletion(true);
      await Global.Fetch(URL.USER_DELETE_ACCOUNT, 'post');
      Global.ShowToast(i18n.t('profile.delete-account-success'));
      setRequestingDeletion(false);
    }
  }

  return (
    <AutocompleteDropdownContextProvider>
      <PaperProvider>
        <ScrollView style={[styles.containerProfile]} keyboardShouldPersistTaps='handled'
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}>
          <TouchableOpacity
            onPress={() => Global.navigate("Profile.Fotos", false, { user: user })}>
            <ImageBackground source={{ uri: profilePic }} style={styles.photo}>
            </ImageBackground>
          </TouchableOpacity>

          <View style={{ alignItems: 'center', justifyContent: 'center', zIndex: 10, marginTop: -54 }}>
            <Button mode="contained-tonal" style={{ width: 240 }} onPress={() => Global.navigate("Profile.Fotos", false, { user: user })}>{i18n.t('profile.photos.manage')}</Button>
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
              <SelectModal multi={true} minItems={1} title={i18n.t('profile.gender')} data={[{ id: GenderEnum.MALE, title: i18n.t('gender.male') },
              { id: GenderEnum.FEMALE, title: i18n.t('gender.female') }, { id: GenderEnum.OTHER, title: i18n.t('gender.other') }]}
                selected={preferredGenders} onValueChanged={function (id: number, checked: boolean): void {
                  updateGenders(id, checked);
                }}></SelectModal>
            </View>

            <View style={{ marginTop: 12 }}>
              <AgeRangeSliderModal title={i18n.t('profile.preferred-age-range')} titleLower={i18n.t('profile.age.min')} titleUpper={i18n.t('profile.age.max')}
                valueLower={minAge} valueUpper={maxAge} onValueLowerChanged={updateMinAge} onValueUpperChanged={updateMaxAge}></AgeRangeSliderModal>
            </View>

            
            <View style={{ marginTop: 24 }}>
              <Text style={{ marginBottom: 8 }}>{i18n.t('profile.onboarding.interests')}</Text>
              {
                interests.map((item, index) => (
                  <Button key={index} onPress={() => { removeInterest(item) }} icon="close-circle" mode="elevated" style={{ marginRight: 8, marginBottom: 8 }}>
                    <Text>{item.text}</Text>
                  </Button>
                ))
              }
              {interests.length < MAX_INTERESTS &&
                <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                  <AutocompleteDropdown
                    EmptyResultComponent={<></>}
                    controller={controller => {
                      dropdownController.current = controller
                    }}
                    direction={Platform.select({ ios: 'down' })}
                    dataSet={suggestionsList}
                    onChangeText={text => {
                      setInterest(text);
                      getSuggestions(text);
                    }
                    }
                    onSelectItem={item => {
                      item && setInterest(item.id);
                      item && addInterest(item.id);
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
                  <IconButton icon='plus' mode='contained' style={{ width: 38, height: 38 }} size={20} onPress={() => addInterest(interest)} />
                </View>}
            </View>


            <View style={{ marginTop: 24 }}>
              <Text>{i18n.t('profile.misc-info.relationship.title')}</Text>
              <View style={{ flexDirection: "row", flexWrap: 'wrap' }}>

              </View>

              <Text>{i18n.t('profile.misc-info.kids.title')}</Text>
              <View style={{ flexDirection: "row", flexWrap: 'wrap' }}>

              </View>

              <Text>{i18n.t('profile.misc-info.drugs.title')}</Text>
              <View style={{ flexDirection: "row", flexWrap: 'wrap' }}>

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
                <Text style={[styles.link, { padding: 8, opacity: requestingDeletion ? 0.3 : 1 }]} onPress={() => {
                  deleteAccount();
                }}>{i18n.t('profile.delete-account')}</Text>
              </View>
            </View>

          </View>
        </ScrollView>
      </PaperProvider>
    </AutocompleteDropdownContextProvider>
  );
};

export default YourProfile;
