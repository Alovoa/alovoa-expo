import React from "react";
import {
  View,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions
} from "react-native";
import { TextInput, Button, HelperText, ActivityIndicator } from "react-native-paper";
import styles, { WIDESCREEN_HORIZONTAL_MAX } from "../../assets/styles";
import { YourProfileResource, UserMiscInfoEnum, UserInterest, UserDto } from "../../types";
import * as I18N from "../../i18n";
import * as Global from "../../Global";
import * as URL from "../../URL";
import { debounce } from "lodash";
import SelectModal from "../../components/SelectModal";
import InterestModal from "../../components/InterestModal";
import VerticalView from "../../components/VerticalView";

const i18n = I18N.getI18n()

const ProfileSettings = ({ route, navigation }) => {

  var user: UserDto = route.params.user;

  const { height, width } = useWindowDimensions();

  const [profilePic, setProfilePic] = React.useState<string>();
  const [idEnc, setIdEnc] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [interests, setInterests] = React.useState(Array<UserInterest>);
  const [miscInfoKids, setMiscInfoKids] = React.useState(Array<number>);
  const [miscInfoDrugs, setMiscInfoDrugs] = React.useState(Array<number>);
  const [miscInfoRelationship, setMiscInfoRelationship] = React.useState(Array<number>);
  const [loading, setLoading] = React.useState(false);
  const maxDescriptionLength = 200;

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

  async function load() {
    setLoading(true);
    let response = await Global.Fetch(URL.API_RESOURCE_YOUR_PROFILE);
    let data: YourProfileResource = response.data;
    loadUser(data.user);
  }

  async function loadUser(user: UserDto) {
    setIdEnc(user.idEncoded);
    setProfilePic(user.profilePicture);
    setDescription(user.description);
    setInterests(user.interests);

    setMiscInfoDrugs(user.miscInfos.filter(item => item.value <= UserMiscInfoEnum.DRUGS_OTHER && item.value >= UserMiscInfoEnum.DRUGS_TOBACCO)
      .map(item => item.value));
    setMiscInfoKids(user.miscInfos.filter(item => item.value <= UserMiscInfoEnum.KIDS_YES && item.value >= UserMiscInfoEnum.KIDS_NO)
      .map(item => item.value));
    setMiscInfoRelationship(user.miscInfos.filter(item => item.value <= UserMiscInfoEnum.RELATIONSHIP_OTHER && item.value >= UserMiscInfoEnum.RELATIONSHIP_SINGLE)
      .map(item => item.value));
    setLoading(false);
  }

  React.useEffect(() => {
    console.log(user)
    if (user) {
      loadUser(user);
    }
  }, []);

  async function updateDescription() {
    if (descriptionRef.current) {
      Global.Fetch(URL.USER_UPDATE_DESCRIPTION, 'post', descriptionRef.current, 'text/plain');
    }
  }

  async function updateMiscInfo(num: UserMiscInfoEnum, activated: boolean) {
    await Global.Fetch(Global.format(URL.USER_UPDATE_MISC_INFO, String(num), activated ? "1" : "0"), 'post');
  }

  return (
    <View style={{ height: height }}>
      {loading &&
        <View style={{ height: height, width: width, zIndex: 1, justifyContent: 'center', alignItems: 'center', position: "absolute" }} >
          <ActivityIndicator animating={loading} size="large" />
        </View>
      }

      <VerticalView onRefresh={load} style={{ padding: 0 }}>
        <TouchableOpacity
          onPress={() => Global.navigate("Profile.Pictures", false, { user: user })}>
          <ImageBackground source={{ uri: profilePic }} style={style.image}>
          </ImageBackground>
        </TouchableOpacity>

        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: -54 }}>
          <Button mode="contained-tonal" style={{ width: 240 }} onPress={() => Global.navigate("Profile.Pictures", false, { user: user })}>{i18n.t('profile.photos.manage')}</Button>
        </View>

        <View style={[styles.containerProfileItem, { marginTop: 32 }]}>
          <View>
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
        </View>
      </VerticalView>
    </View>
  );
};

export default ProfileSettings;
