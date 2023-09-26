import React from "react";
import {
  View,
  ImageBackground,
  TouchableOpacity,
  Platform,
  StyleSheet,
  useWindowDimensions
} from "react-native";
import { Text, TextInput, Button, Surface, Card, HelperText, ActivityIndicator } from "react-native-paper";
import styles, { WIDESCREEN_HORIZONTAL_MAX } from "../assets/styles";
import { YourProfileResource, UserMiscInfoEnum, UserInterest, UnitsEnum, UserDto, GenderEnum, } from "../types";
import * as I18N from "../i18n";
import * as Global from "../Global";
import * as URL from "../URL";
import * as WebBrowser from 'expo-web-browser';
import { debounce } from "lodash";
import * as FileSystem from 'expo-file-system';
import { StorageAccessFramework } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import SelectModal from "../components/SelectModal";
import AgeRangeSliderModal from "../components/AgeRangeSliderModal";
import InterestModal from "../components/InterestModal";
import VerticalView from "../components/VerticalView";

const userdataFileName = "userdata-alovoa.json"
const MIME_JSON = "application/json";

const i18n = I18N.getI18n()
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

  const { height, width } = useWindowDimensions();

  const [requestingDeletion, setRequestingDeletion] = React.useState(false);
  const [user, setUser] = React.useState<UserDto>();
  const [profilePic, setProfilePic] = React.useState<string>();
  const [name, setName] = React.useState("");
  const [age, setAge] = React.useState(0);
  const [idEnc, setIdEnc] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [intention, setIntention] = React.useState(Intention.MEET);
  const [showIntention, setShowIntention] = React.useState(false);
  const [interests, setInterests] = React.useState(Array<UserInterest>);
  const [minAge, setMinAge] = React.useState(MIN_AGE)
  const [maxAge, setMaxAge] = React.useState(MAX_AGE)
  const [units, setUnits] = React.useState(UnitsEnum.SI)
  const [isLegal, setIsLegal] = React.useState(false);
  const [preferredGenders, setPreferredGenders] = React.useState(Array<number>);
  const [miscInfoKids, setMiscInfoKids] = React.useState(Array<number>);
  const [miscInfoDrugs, setMiscInfoDrugs] = React.useState(Array<number>);
  const [miscInfoRelationship, setMiscInfoRelationship] = React.useState(Array<number>);
  const [loading, setLoading] = React.useState(false);
  const maxDescriptionLength = 200;
  const topBarHeight = 62;

  const descriptionRef = React.useRef(description);
  const debounceDescriptionHandler = React.useCallback(debounce(updateDescription, 1500), []);

  const style = StyleSheet.create({
    image: {
      width: '100%',
      height: 'auto',
      maxWidth: WIDESCREEN_HORIZONTAL_MAX,
      aspectRatio: 1,
    },
  });

  React.useEffect(() => {
    descriptionRef.current = description;
    debounceDescriptionHandler();
  }, [description]);

  React.useEffect(() => {
    if (route.params?.changed) {
      load();
      route.params.changed = false;
    }
  }, [route.params?.changed]);

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
    setMiscInfoDrugs(data.user.miscInfos.filter(item => item.value <= UserMiscInfoEnum.DRUGS_OTHER && item.value >= UserMiscInfoEnum.DRUGS_TOBACCO)
      .map(item => item.value));
    setMiscInfoKids(data.user.miscInfos.filter(item => item.value <= UserMiscInfoEnum.KIDS_YES && item.value >= UserMiscInfoEnum.KIDS_NO)
      .map(item => item.value));
    setMiscInfoRelationship(data.user.miscInfos.filter(item => item.value <= UserMiscInfoEnum.RELATIONSHIP_OTHER && item.value >= UserMiscInfoEnum.RELATIONSHIP_SINGLE)
      .map(item => item.value));
    setUnits(data.user.units);
  }
  React.useEffect(() => {
    load();
  }, []);

  async function logout() {
    Global.SetStorage(Global.STORAGE_PAGE, Global.INDEX_LOGIN);
    Global.navigate("Login");
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
    <View style={{ height: height }}>
      {loading &&
        <View style={{ height: height, width: width, justifyContent: 'center', alignItems: 'center', position: "absolute" }} >
          <ActivityIndicator animating={loading} size="large" />
        </View>
      }

      <VerticalView onRefresh={load} style={{ padding: 0 }}>
        <TouchableOpacity
          onPress={() => Global.navigate("Profile.Fotos", false, { user: user })}>
          <ImageBackground source={{ uri: profilePic }} style={style.image}>
          </ImageBackground>
        </TouchableOpacity>

        <View style={{ alignItems: 'center', justifyContent: 'center', zIndex: 10, marginTop: -54 }}>
          <Button mode="contained-tonal" style={{ width: 240 }} onPress={() => Global.navigate("Profile.Fotos", false, { user: user })}>{i18n.t('profile.photos.manage')}</Button>
        </View>

        <View style={[styles.containerProfileItem, { marginTop: 32 }]}>
          <Text style={[styles.name]}>{name + ", " + age}</Text>
          <View style={{ marginTop: 24 }}>
            <TextInput style={{ height: 128 }}
              label={i18n.t('profile.onboarding.description')}
              multiline={true}
              mode="outlined"
              onChangeText={(text) => {
                setDescription(text)
              }}
              placeholder={i18n.t('profile.onboarding.description-placeholder')}
              maxLength={maxDescriptionLength}
              value={description}
              autoCorrect={false}
            />
            <View>
              <HelperText type="info" style={{ textAlign: 'right' }} visible>
                {description.length} / {maxDescriptionLength}
              </HelperText>
            </View>
          </View>

          <View style={{ margin: 24 }}>
            <Card mode="contained" style={{ padding: 12 }}>
              <Text style={{ textAlign: 'center' }}>{i18n.t('profile.donated') + ": " + String(user?.totalDonations) + ' €'}</Text>
            </Card>
          </View>

          <View style={{ marginTop: 12 }}>
            <SelectModal disabled={!showIntention} multi={false} minItems={1} title={i18n.t('profile.intention.title')}
              data={[{ id: Intention.MEET, title: i18n.t('profile.intention.meet') },
              { id: Intention.DATE, title: i18n.t('profile.intention.date') },
              { id: Intention.SEX, title: i18n.t('profile.intention.sex') }]}
              selected={[intention]} onValueChanged={function (id: number, checked: boolean): void {
                updateIntention(id);
              }}></SelectModal>
          </View>

          <View style={{ marginTop: 12 }}>
            <SelectModal disabled={false} multi={true} minItems={1} title={i18n.t('profile.gender')} data={[{ id: GenderEnum.MALE, title: i18n.t('gender.male') },
            { id: GenderEnum.FEMALE, title: i18n.t('gender.female') }, { id: GenderEnum.OTHER, title: i18n.t('gender.other') }]}
              selected={preferredGenders} onValueChanged={function (id: number, checked: boolean): void {
                updateGenders(id, checked);
              }}></SelectModal>
          </View>

          {isLegal &&
            <View style={{ marginTop: 12 }}>
              <AgeRangeSliderModal title={i18n.t('profile.preferred-age-range')} titleLower={i18n.t('profile.age.min')} titleUpper={i18n.t('profile.age.max')}
                valueLower={minAge} valueUpper={maxAge} onValueLowerChanged={updateMinAge} onValueUpperChanged={updateMaxAge}></AgeRangeSliderModal>
            </View>
          }

          <View style={{ marginTop: 12 }}>
            <InterestModal data={interests} />
          </View>

          <View style={{ marginTop: 12 }}>
            <SelectModal disabled={false} multi={false} minItems={1} title={i18n.t('profile.misc-info.relationship.title')}
              data={[{ id: UserMiscInfoEnum.RELATIONSHIP_SINGLE, title: i18n.t('profile.misc-info.relationship.single') },
              { id: UserMiscInfoEnum.RELATIONSHIP_TAKEN, title: i18n.t('profile.misc-info.relationship.taken') },
              { id: UserMiscInfoEnum.RELATIONSHIP_OPEN, title: i18n.t('profile.misc-info.relationship.open') },
              { id: UserMiscInfoEnum.RELATIONSHIP_OTHER, title: i18n.t('profile.misc-info.relationship.other') }]}
              selected={miscInfoRelationship} onValueChanged={function (id: number, checked: boolean): void {
                updateMiscInfo(id, checked);
              }}></SelectModal>
          </View>

          <View style={{ marginTop: 12 }}>
            <SelectModal disabled={false} multi={false} minItems={1} title={i18n.t('profile.misc-info.kids.title')}
              data={[{ id: UserMiscInfoEnum.KIDS_NO, title: i18n.t('profile.misc-info.kids.no') },
              { id: UserMiscInfoEnum.KIDS_YES, title: i18n.t('profile.misc-info.kids.yes') }]}
              selected={miscInfoKids} onValueChanged={function (id: number, checked: boolean): void {
                updateMiscInfo(id, checked);
              }}></SelectModal>
          </View>

          <View style={{ marginTop: 12 }}>
            <SelectModal disabled={false} multi={true} minItems={0} title={i18n.t('profile.misc-info.drugs.title')}
              data={[{ id: UserMiscInfoEnum.DRUGS_ALCOHOL, title: i18n.t('profile.misc-info.drugs.alcohol') },
              { id: UserMiscInfoEnum.DRUGS_TOBACCO, title: i18n.t('profile.misc-info.drugs.tobacco') },
              { id: UserMiscInfoEnum.DRUGS_CANNABIS, title: i18n.t('profile.misc-info.drugs.cannabis') },
              { id: UserMiscInfoEnum.DRUGS_OTHER, title: i18n.t('profile.misc-info.drugs.other') }]}
              selected={miscInfoDrugs} onValueChanged={function (id: number, checked: boolean): void {
                updateMiscInfo(id, checked);
              }}></SelectModal>
          </View>

          <View style={{ marginTop: 12 }}>
            <SelectModal disabled={false} multi={false} minItems={1} title={i18n.t('profile.units.title')}
              data={[{ id: UnitsEnum.SI, title: i18n.t('profile.units.si') },
              { id: UnitsEnum.IMPERIAL, title: i18n.t('profile.units.imperial') }]}
              selected={[units]} onValueChanged={function (id: number, checked: boolean): void {
                if (checked) {
                  updateUnits(id);
                }
              }}></SelectModal>
          </View>

          <View style={{ marginTop: 128, paddingBottom: topBarHeight + 24 }}>
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
      </VerticalView>
    </View>
  );
};

export default YourProfile;
