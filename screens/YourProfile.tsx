import React from "react";
import {
  ScrollView,
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  Switch,
  Platform,
  Pressable,
  FlatList,
  Alert,
} from "react-native";
import { Icon, ProfileItem } from "../components";
import styles, { WHITE, PRIMARY_COLOR, PRIMARY_COLOR_LIGHT, GRAY } from "../assets/styles";
import { UserInterestAutocomplete, YourProfileResource, UserMiscInfoEnum } from "../types";
import * as I18N from "../i18n";
import * as Global from "../Global";
import * as URL from "../URL";
import RadioButtonGroup, { RadioButtonItem } from "expo-radio-button";
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import { FontAwesome } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { debounce } from 'lodash';
import * as WebBrowser from 'expo-web-browser';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

const IMAGE_HEADER = "data:image/png;base64,";

const i18n = I18N.getI18n()
const MAX_INTERESTS = 5;
const MIN_AGE = 16
const MAX_AGE = 100

enum Gender {
  MALE = 1,
  FEMALE = 2,
  OTHER = 3
}

enum Intention {
  MEET = 1,
  DATE = 2,
  SEX = 3
}

enum Unit {
  SI = 0,
  IMPERIAL = 1
}

const YourProfile = () => {

  const [profilePic, setProfilePic] = React.useState("");
  const [name, setName] = React.useState("");
  const [age, setAge] = React.useState(0);
  const [description, setDescription] = React.useState("");
  const [intention, setIntention] = React.useState("1");
  const [showIntention, setShowIntention] = React.useState(false);
  const [interest, setInterest] = React.useState("");
  const [interests, setInterests] = React.useState(Array<string>);
  const [loading, setLoading] = React.useState(false)
  const [suggestionsList, setSuggestionsList] = React.useState(Array<any>)
  const [minAge, setMinAge] = React.useState(MIN_AGE)
  const [maxAge, setMaxAge] = React.useState(MAX_AGE)
  const [minAgeText, setMinAgeText] = React.useState(MIN_AGE)
  const [maxAgeText, setMaxAgeText] = React.useState(MAX_AGE)
  const dropdownController = React.useRef({})
  const [units, setUnits] = React.useState(Unit.SI)

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

  const IMG_SIZE_MAX = 600;

  async function pickImage() {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true,
    });
    if (!result.cancelled) {
      const resizedImageData = await ImageManipulator.manipulateAsync(
        result.uri,
        [{ resize: { width: IMG_SIZE_MAX, height: IMG_SIZE_MAX } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.WEBP, base64: true, }
      );
      return resizedImageData;
    } else {
      return null;
    }
  };

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
  const onClearPress = React.useCallback(() => { setSuggestionsList([]) }, [])

  function cleanInterest(txt: string) {
    let txtCopy = txt
    txtCopy = txtCopy.replace(/ /g, "-");
    let text = txtCopy.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
    return text;
  }

  const getSuggestions = React.useCallback(async (q: string) => {
    const filterToken = cleanInterest(q)
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

  React.useEffect(() => {
    Global.Fetch(URL.API_RESOURCE_YOUR_PROFILE).then(
      (response) => {
        let data: YourProfileResource = response.data;
        setProfilePic(data.user.profilePicture);
        setName(data.user.firstName);
        setAge(data.user.age);
        setDescription(data.user.description);
        setShowIntention(data.showIntention);

        let interestsData = data.user.interests.map(item => item.text);
        setInterests(interestsData);
        setMinAge(data.user.preferedMinAge);
        setMaxAge(data.user.preferedMaxAge);
        setUnits(data.user.units);

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
      }
    );

  }, []);

  async function logout() {
    //TODO
  }

  async function addInterest() {
    //TODo
  }

  async function removeInterest(i: string) {
    Alert.alert(i18n.t('profile.interest-alert.title'), Global.format(i18n.t('profile.interest-alert.subtitle'), i), [
      {
        text: i18n.t('cancel'),
        onPress: () => { },
        style: 'cancel',
      },
      {
        text: i18n.t('ok'),
        onPress: () => {
          //TODO
        }
      }
    ]);
  }

  async function updateProfilePicture() {
    let imageData : ImageManipulator.ImageResult | null = await pickImage();
    if (imageData != null) {
      let b64 = IMAGE_HEADER + imageData.base64;
      //TODO
    }
    
  }

  async function updateDescription() {
    //TODO 
  }

  async function updateGenders(gender: Gender, state: boolean) {
    //TODO
  }

  async function updateMinAge(num: number) {
    setMinAge(num);
    //TODO
  }

  async function updateMaxAge(num: number) {
    setMaxAge(num);
    //TODO
  }

  async function updateUnits(num: number) {
    setUnits(num);
    //TODO
  }

  async function updateMiscInfo(num: UserMiscInfoEnum) {
    //TODO
  }

  return (
    <ImageBackground
      source={require("../assets/images/bg.png")}
      style={styles.bg}
    >
      <ScrollView style={styles.containerProfile}>
        <ImageBackground source={{ uri: profilePic }} style={styles.photo}>
          <View style={styles.top}>
            <TouchableOpacity>
              <Icon
                name="chevron-back"
                size={20}
                color={WHITE}
                style={styles.topIconLeft}
              />
            </TouchableOpacity>

            <TouchableOpacity>
              <Icon
                name="ellipsis-vertical"
                size={20}
                color={WHITE}
                style={styles.topIconRight}
              />
            </TouchableOpacity>
          </View>
        </ImageBackground>
        <View style={[styles.containerProfileItem, { marginTop: 24 }]}>
          <Text style={styles.name}>{name + ", " + age}</Text>
          <TextInput
            multiline={true}
            numberOfLines={4}
            onChangeText={(text) => setDescription(text)}
            placeholder={i18n.t('profile.onboarding.description-placeholder')}
            maxLength={200}
            defaultValue={description}
            style={{ height: 160, padding: 8 }}
            autoCorrect={false}
          />
          {showIntention && <View><Text>{i18n.t('profile.intention.title')}</Text>
            <RadioButtonGroup
              containerStyle={{ marginBottom: 10 }}
              selected={intention}
              onSelected={(value: string) => setIntention(value)}
              radioBackground="#ec407a">
              <RadioButtonItem label={i18n.t('profile.intention.meet')} value={Intention.MEET} style={{ marginTop: 4, marginBottom: 4 }} />
              <RadioButtonItem label={i18n.t('profile.intention.date')} value={Intention.DATE} style={{ marginTop: 4, marginBottom: 4 }} />
              <RadioButtonItem label={i18n.t('profile.intention.sex')} value={Intention.SEX} style={{ marginTop: 4, marginBottom: 4 }} />
            </RadioButtonGroup>
          </View>
          }

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
              minimumTrackTintColor={PRIMARY_COLOR_LIGHT}
              maximumTrackTintColor={GRAY}
              thumbTintColor={PRIMARY_COLOR}
              /*
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
              */
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
              minimumTrackTintColor={PRIMARY_COLOR_LIGHT}
              maximumTrackTintColor={GRAY}
              thumbTintColor={PRIMARY_COLOR}
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
                  renderItem={(item, text) => <Text style={{ padding: 15 }}>{item.title}</Text>}
                  ChevronIconComponent={<FontAwesome name="chevron-down" size={20} />}
                  ClearIconComponent={<FontAwesome name="times-circle" size={18} />}
                  inputHeight={50}
                  showChevron={false}
                  closeOnBlur={false}
                />
                <Pressable style={[styles.profileButton, styles.center, { marginLeft: 8, width: 52 }]} onPress={() => addInterest()}>
                  <View style={styles.center}>
                    <FontAwesome name="plus" color={WHITE} size={18} />
                  </View>
                </Pressable>
              </View>}
            <FlatList
              numColumns={2}
              data={interests}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <Pressable onPress={() => {
                  removeInterest(item);
                }} style={[{ marginRight: 8, marginBottom: 8 }, styles.profileButtonLight]}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={{ textAlign: 'center', marginRight: 4 }}>{item}</Text>
                    <FontAwesome name="times-circle" size={18} />
                  </View>
                </Pressable>
              )}
            />
          </View>


          <View style={{ marginTop: 24 }}>
            <Text>{i18n.t('profile.gender')}</Text>
            <View style={{ flexDirection: "row", flexWrap: 'wrap' }}>
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
              <View style={{ flexDirection: "row", alignItems: 'center', marginRight: 12 }}>
                <Switch onValueChange={toggleGenderOtherSwitch}
                  trackColor={{ true: '#F089AB', false: '#9e9e9e' }}
                  thumbColor={isGenderOtherEnabled ? '#EC407A' : '#eeeeee'}
                  value={isGenderOtherEnabled} />
                <Text style={styles.switchText}>{i18n.t('gender.other')}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: 'center' }}>
                <Switch onValueChange={toggleGenderOtherSwitch}
                  trackColor={{ true: '#F089AB', false: '#9e9e9e' }}
                  thumbColor={isGenderOtherEnabled ? '#EC407A' : '#eeeeee'}
                  value={isGenderOtherEnabled} />
                <Text style={styles.switchText}>{i18n.t('gender.other')}</Text>
              </View>
            </View>

            <Text>{i18n.t('profile.gender')}</Text>
            <View style={{ flexDirection: "row", flexWrap: 'wrap' }}>
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
            </View>

            <Text>{i18n.t('profile.gender')}</Text>
            <View style={{ flexDirection: "row", flexWrap: 'wrap' }}>
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
              <View style={{ flexDirection: "row", alignItems: 'center' }}>
                <Switch onValueChange={toggleGenderOtherSwitch}
                  trackColor={{ true: '#F089AB', false: '#9e9e9e' }}
                  thumbColor={isGenderOtherEnabled ? '#EC407A' : '#eeeeee'}
                  value={isGenderOtherEnabled} />
                <Text style={styles.switchText}>{i18n.t('gender.other')}</Text>
              </View>
            </View>
          </View>

          <View style={{ marginTop: 24 }}>
            <Text>{i18n.t('profile.units.title')}</Text>
            <RadioButtonGroup
              containerStyle={{ marginBottom: 10 }}
              selected={units}
              onSelected={(value: number) => updateUnits(value)}
              radioBackground="#ec407a">
              <RadioButtonItem label={i18n.t('profile.units.si')} value={Unit.SI} style={{ marginTop: 4, marginBottom: 4 }} />
              <RadioButtonItem label={i18n.t('profile.units.imperial')} value={Unit.IMPERIAL} style={{ marginTop: 4, marginBottom: 4 }} />
            </RadioButtonGroup>
          </View>

          <View style={{ marginTop: 128 }}>
            <Pressable style={[styles.profileButton, styles.center]} onPress={() => logout()}>
              <Text style={{ color: WHITE }}>Logout</Text>
            </Pressable>
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

          </View>
        </View>



      </ScrollView>
    </ImageBackground >
  );
};

export default YourProfile;
