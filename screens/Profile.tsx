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
  RefreshControl,
  Keyboard
} from "react-native";
import styles, { WHITE, PRIMARY_COLOR, PRIMARY_COLOR_LIGHT, GRAY } from "../assets/styles";
import { UserInterestAutocomplete, YourProfileResource, UserMiscInfoEnum, UserInterest, UnitsEnum } from "../types";
import * as I18N from "../i18n";
import * as Global from "../Global";
import * as URL from "../URL";
import RadioButtonGroup, { RadioButtonItem } from "expo-radio-button";
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import { FontAwesome } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as WebBrowser from 'expo-web-browser';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { debounce } from "lodash";


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

const Profile = ({ route, navigation }) => {

  const MIN_AGE = 16
  const MAX_AGE = 100

  const { idEnc } = route.params;

  const [refreshing, setRefreshing] = React.useState(false);
  const [profilePic, setProfilePic] = React.useState("");
  const [name, setName] = React.useState("");
  const [age, setAge] = React.useState(0);
  const [minAge, setMinAge] = React.useState(MIN_AGE);
  const [maxAge, setMaxAge] = React.useState(MAX_AGE);
  const [description, setDescription] = React.useState("");
  const [intention, setIntention] = React.useState(Intention.MEET);
  const [interests, setInterests] = React.useState(Array<UserInterest>);
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
  const [gender, setGender] = React.useState<Gender>()
  const [preferredGenders, setPreferredGenders] = React.useState(Array<Gender>);

  function convertGenderText(text: string): Gender {
    switch (text) {
      case GenderText.MALE:
        return Gender.MALE;
      case GenderText.FEMALE:
        return Gender.FEMALE;
    }
    return Gender.OTHER;
  }

  async function load() {
    let response = await Global.Fetch(Global.format(URL.API_RESOURCE_PROFILE, idEnc));
    let data: YourProfileResource = response.data;
    setProfilePic(data.user.profilePicture);
    setName(data.user.firstName);
    setAge(data.user.age);
    setMinAge(data.user.preferedMinAge);
    setMaxAge(data.user.preferedMaxAge);
    setDescription(data.user.description);
    setGender(convertGenderText(data.user.gender.text));
    let prefGenders : Array<Gender> = [];
    for(let i = 0; i < data.user.preferedGenders.length; i++) {
      prefGenders.push(convertGenderText(data.user.preferedGenders[i].text));
    }
    setPreferredGenders(prefGenders);
    
    setInterests(data.user.interests);

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
  React.useEffect(() => {
    load();
  }, []);

  return (
    <ScrollView style={styles.containerProfile} keyboardShouldPersistTaps='handled'
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}>
      
        <ImageBackground source={{ uri: profilePic }} style={styles.photo}>
        </ImageBackground>

      <View style={[styles.containerProfileItem, { marginTop: 24 }]}>
        <Text style={styles.name}>{name + ", " + age}</Text>
        <TextInput
          multiline={true}
          numberOfLines={4}
          maxLength={200}
          value={description}
          style={{ height: 160, padding: 8 }}
          editable = {false}
        />
        <View><Text>{i18n.t('profile.intention.title')}</Text>
          <RadioButtonGroup
            containerStyle={{ marginBottom: 10 }}
            selected={intention}
            radioBackground="#ec407a">
            <RadioButtonItem label={i18n.t('profile.intention.meet')} value={Intention.MEET} style={{ marginTop: 4, marginBottom: 4 }} />
            <RadioButtonItem label={i18n.t('profile.intention.date')} value={Intention.DATE} style={{ marginTop: 4, marginBottom: 4 }} />
            <RadioButtonItem label={i18n.t('profile.intention.sex')} value={Intention.SEX} style={{ marginTop: 4, marginBottom: 4 }} />
          </RadioButtonGroup>
        </View>

        <View style={{ marginTop: 12 }}>
          <Text>{i18n.t('profile.gender')}</Text>
          <View style={{ flexDirection: "row" }}>
            {/*TODO*/}
          </View>
        </View>
        <View style={{ marginTop: 12 }}>
          <Text>{i18n.t('profile.onboarding.interests')}</Text>
          
          <FlatList
            numColumns={2}
            data={interests}
            extraData={interests}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Pressable style={[{ marginRight: 8, marginBottom: 8 }, styles.profileButtonLight]}>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ textAlign: 'center', marginRight: 4 }}>{item.text}</Text>
                  <FontAwesome name="times-circle" size={18} />
                </View>
              </Pressable>
            )}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default Profile;
