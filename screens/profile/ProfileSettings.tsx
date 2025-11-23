import React from "react";
import {
  View,
  useWindowDimensions
} from "react-native";
import { Text, TextInput, Button, HelperText, ActivityIndicator, Badge } from "react-native-paper";
import styles, { STATUS_BAR_HEIGHT } from "../../assets/styles";
import { YourProfileResource, UserMiscInfoEnum, UserInterest, UserDto, UserMiscInfo, UserIntention, IntentionE, MiscInfoNameMap, IntentionNameMap, RootStackParamList, UserPrompt } from "../../types";
import * as I18N from "../../i18n";
import * as Global from "../../Global";
import * as URL from "../../URL";
import { debounce } from "lodash";
import SelectModal from "../../components/SelectModal";
import InterestModal from "../../components/InterestModal";
import VerticalView from "../../components/VerticalView";
import { useHeaderHeight } from '@react-navigation/elements';
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

const i18n = I18N.getI18n();
const DESCRIPTION_HELPERTEXT_LIMIT = 200;

type Props = BottomTabScreenProps<RootStackParamList, 'Profile.ProfileSettings'>

const ProfileSettings = ({ route, navigation }: Props) => {

  var data: YourProfileResource = route.params.data;

  const { height, width } = useWindowDimensions();
  const headerHeight = useHeaderHeight();

  const [user, setUser] = React.useState<UserDto>(data.user);
  const [description, setDescription] = React.useState("");
  const [interests, setInterests] = React.useState(Array<UserInterest>);
  const [miscInfoTobacco, setMiscInfoTobacco] = React.useState(Array<number>);
  const [miscInfoCannabis, setMiscInfoCannabis] = React.useState(Array<number>);
  const [miscInfoAlcohol, setMiscInfoAlcohol] = React.useState(Array<number>);
  const [miscInfoHardDrugs, setMiscInfoHardDrugs] = React.useState(Array<number>);
  const [miscInfoKids, setMiscInfoKids] = React.useState(Array<number>);
  const [miscInfoFamily, setMiscInfoFamily] = React.useState(Array<number>);
  const [miscInfoRelationship, setMiscInfoRelationship] = React.useState(Array<number>);
  const [miscInfoRelationshipType, setMiscInfoRelationshipType] = React.useState(Array<number>);
  const [miscInfoGenderIdentity, setMiscInfoGenderIdentity] = React.useState(Array<number>);
  const [miscInfoPolitics, setMiscInfoPolitics] = React.useState(Array<number>);
  const [miscInfoReligion, setMiscInfoReligion] = React.useState(Array<number>);
  const [prompts, setPrompts] = React.useState(Array<UserPrompt>);

  const [loading, setLoading] = React.useState(false);
  const [settingsIgnoreIntention, setSettingsIgnoreIntention] = React.useState(false);
  const [intention, setIntention] = React.useState(IntentionE.MEET);
  const [showIntention, setShowIntention] = React.useState(false);

  const descriptionRef = React.useRef(description);
  const debounceDescriptionHandler = React.useCallback(debounce(updateDescription, 1500), []);

  React.useEffect(() => {
    descriptionRef.current = description;
    debounceDescriptionHandler();
  }, [description]);

  const miscInfoTobaccoList = [UserMiscInfoEnum.DRUGS_TOBACCO, UserMiscInfoEnum.DRUGS_TOBACCO_NO, UserMiscInfoEnum.DRUGS_TOBACCO_SOMETIMES];
  const miscInfoAlcoholList = [UserMiscInfoEnum.DRUGS_ALCOHOL, UserMiscInfoEnum.DRUGS_ALCOHOL_NO, UserMiscInfoEnum.DRUGS_ALCOHOL_SOMETIMES];
  const miscInfoCannabisList = [UserMiscInfoEnum.DRUGS_CANNABIS, UserMiscInfoEnum.DRUGS_CANNABIS_NO, UserMiscInfoEnum.DRUGS_CANNABIS_SOMETIMES];
  const miscInfoHardDrugsList = [UserMiscInfoEnum.DRUGS_OTHER, UserMiscInfoEnum.DRUGS_OTHER_NO, UserMiscInfoEnum.DRUGS_OTHER_SOMETIMES];
  const miscInfoRelationshipList = [UserMiscInfoEnum.RELATIONSHIP_OPEN, UserMiscInfoEnum.RELATIONSHIP_OTHER, UserMiscInfoEnum.RELATIONSHIP_SINGLE, UserMiscInfoEnum.RELATIONSHIP_TAKEN];
  const miscInfoRelationshipTypeList = [UserMiscInfoEnum.RELATIONSHIP_TYPE_MONOGAMOUS, UserMiscInfoEnum.RELATIONSHIP_TYPE_POLYAMOROUS];
  const miscInfoKidsList = [UserMiscInfoEnum.KIDS_NO, UserMiscInfoEnum.KIDS_YES];
  const miscInfoFamilyList = [UserMiscInfoEnum.FAMILY_NOT_SURE, UserMiscInfoEnum.FAMILY_NOT_WANT, UserMiscInfoEnum.FAMILY_WANT];
  const miscInfoGenderIdentityList = [UserMiscInfoEnum.GENDER_IDENTITY_CIS, UserMiscInfoEnum.GENDER_IDENTITY_TRANS];
  const miscInfoPoliticsList = [UserMiscInfoEnum.POLITICS_LEFT, UserMiscInfoEnum.POLITICS_MODERATE, UserMiscInfoEnum.POLITICS_RIGHT];
  const miscInfoReligionList = [UserMiscInfoEnum.RELIGION_NO, UserMiscInfoEnum.RELIGION_YES];

  async function loadUser(user: UserDto) {
    setDescription(user.description);
    setInterests(user.interests);
    setMiscInfoTobacco(user.miscInfos.filter(item => miscInfoTobaccoList.includes(item.value)).map(item => item.value));
    setMiscInfoCannabis(user.miscInfos.filter(item => miscInfoCannabisList.includes(item.value)).map(item => item.value));
    setMiscInfoAlcohol(user.miscInfos.filter(item => miscInfoAlcoholList.includes(item.value)).map(item => item.value));
    setMiscInfoHardDrugs(user.miscInfos.filter(item => miscInfoHardDrugsList.includes(item.value)).map(item => item.value));
    setMiscInfoKids(user.miscInfos.filter(item => miscInfoKidsList.includes(item.value)).map(item => item.value));
    setMiscInfoFamily(user.miscInfos.filter(item => miscInfoFamilyList.includes(item.value)).map(item => item.value));
    setMiscInfoRelationship(user.miscInfos.filter(item => miscInfoRelationshipList.includes(item.value)).map(item => item.value));
    setMiscInfoRelationshipType(user.miscInfos.filter(item => miscInfoRelationshipTypeList.includes(item.value)).map(item => item.value));
    setMiscInfoGenderIdentity(user.miscInfos.filter(item => miscInfoGenderIdentityList.includes(item.value)).map(item => item.value));
    setMiscInfoPolitics(user.miscInfos.filter(item => miscInfoPoliticsList.includes(item.value)).map(item => item.value));
    setMiscInfoReligion(user.miscInfos.filter(item => miscInfoReligionList.includes(item.value)).map(item => item.value));
    setIntention(user.intention.id)
    setShowIntention(data.showIntention);
    setPrompts(user.prompts);
    setSettingsIgnoreIntention(data["settings.ignoreIntention"]);
    setLoading(false);
  }

  React.useEffect(() => {
    if (user) {
      loadUser(user);
    }
  }, []);

  React.useEffect(() => {
    loadUser(user);
  }, [user]);

  async function updateIntention(num: number) {
    await Global.Fetch(Global.format(URL.USER_UPDATE_INTENTION, String(num)), 'post');
    Global.ShowToast(i18n.t('profile.intention-toast'));
    setIntention(num);
    setShowIntention(false);

    let intention: UserIntention = { id: num, text: "" };
    data.user.intention = intention;
  }

  async function updateDescription() {
    if (descriptionRef.current) {
      Global.Fetch(URL.USER_UPDATE_DESCRIPTION, 'post', descriptionRef.current, 'text/plain');
      user.description = descriptionRef.current;
    }
  }

  async function updateMiscInfo(num: UserMiscInfoEnum, activated: boolean, multi: boolean) {
    const response = await Global.Fetch(Global.format(URL.USER_UPDATE_MISC_INFO, String(num), activated ? "1" : "0"), 'post');
    const miscInfoArray: UserMiscInfo[] = response.data
    user.miscInfos = miscInfoArray;
  }

  async function navigatePrompts() {
    Global.navigate("Profile.Prompts", false, { prompts: prompts, updatePrompts: setPrompts });
  }

  return (
    <View style={{ height: height - headerHeight }}>
      {loading &&
        <View style={{ height: height, width: width, zIndex: 1, justifyContent: 'center', alignItems: 'center', position: "absolute" }} >
          <ActivityIndicator animating={loading} size="large" />
        </View>
      }

      <VerticalView style={{ padding: 0, gap: 12, paddingBottom: 48, paddingTop: STATUS_BAR_HEIGHT + 24 }}>

        <View style={[styles.containerProfileItem, { marginTop: 20, gap: 12 }]}>
          <View style={{marginBottom: 8}}>
            <TextInput style={[styles.textInputAlign, { height: 128 }]}
              label={i18n.t('profile.onboarding.description')}
              multiline={true}
              mode="outlined"
              onChangeText={(text) => {
                setDescription(text)
              }}
              placeholder={i18n.t('profile.onboarding.description-placeholder')}
              maxLength={Global.MAX_DESCRIPTION_LENGTH}
              value={description}
              autoCorrect={false}
            />
            {description.length >= DESCRIPTION_HELPERTEXT_LIMIT &&
              <View>
                <HelperText type="info" style={{ textAlign: 'right' }} visible>
                  {description.length} / {Global.MAX_DESCRIPTION_LENGTH}
                </HelperText>
              </View>
            }
          </View>

          <InterestModal user={user} data={interests} />

          {settingsIgnoreIntention &&
            <View>
              <SelectModal disabled={!showIntention} multi={false} minItems={1} title={i18n.t('profile.intention.title')}
                data={[
                  [IntentionE.MEET, IntentionNameMap.get(IntentionE.MEET)],
                  [IntentionE.DATE, IntentionNameMap.get(IntentionE.DATE)],
                  [IntentionE.SEX, IntentionNameMap.get(IntentionE.SEX)],
                ]}
                selected={[intention]} onValueChanged={function (id: number, checked: boolean): void {
                  updateIntention(id);
                }}></SelectModal>
            </View>
          }

          <View>
            <Text style={{ paddingBottom: 4 }}>{i18n.t('profile.prompts.title')}</Text>
            <Badge size={12} visible={prompts.length === 0} style={styles.badge} />
            <Button icon="chevron-right" mode="elevated" contentStyle={{ flexDirection: 'row-reverse', justifyContent: 'space-between' }}
              style={{ alignSelf: 'stretch' }} onPress={navigatePrompts}>{i18n.t('profile.prompts.subtitle')}</Button>
          </View>

          <View style={{flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
            <View style={{minWidth: 100}}>
              <SelectModal disabled={false} multi={false} minItems={1} title={i18n.t('profile.misc-info.relationship.title')}
                data={[
                  [UserMiscInfoEnum.RELATIONSHIP_SINGLE, MiscInfoNameMap.get(UserMiscInfoEnum.RELATIONSHIP_SINGLE)],
                  [UserMiscInfoEnum.RELATIONSHIP_TAKEN, MiscInfoNameMap.get(UserMiscInfoEnum.RELATIONSHIP_TAKEN)],
                  [UserMiscInfoEnum.RELATIONSHIP_OPEN, MiscInfoNameMap.get(UserMiscInfoEnum.RELATIONSHIP_OPEN)],
                  [UserMiscInfoEnum.RELATIONSHIP_OTHER, MiscInfoNameMap.get(UserMiscInfoEnum.RELATIONSHIP_OTHER)],
                ]}
                selected={miscInfoRelationship} onValueChanged={function (id: number, checked: boolean): void {
                  updateMiscInfo(id, checked, false);
                }}></SelectModal>
            </View>

            <View style={{minWidth: 100}}>
              <SelectModal disabled={false} multi={false} minItems={1} title={i18n.t('profile.misc-info.kids.title')}
                data={[
                  [UserMiscInfoEnum.KIDS_NO, MiscInfoNameMap.get(UserMiscInfoEnum.KIDS_NO)],
                  [UserMiscInfoEnum.KIDS_YES, MiscInfoNameMap.get(UserMiscInfoEnum.KIDS_YES)],
                ]}
                selected={miscInfoKids} onValueChanged={function (id: number, checked: boolean): void {
                  updateMiscInfo(id, checked, false);
                }}></SelectModal>
            </View>

            <View style={{minWidth: 100}}>
              <SelectModal disabled={false} multi={false} minItems={1} title={i18n.t('profile.misc-info.family.title')}
                data={[
                  [UserMiscInfoEnum.FAMILY_WANT, MiscInfoNameMap.get(UserMiscInfoEnum.FAMILY_WANT)],
                  [UserMiscInfoEnum.FAMILY_NOT_WANT, MiscInfoNameMap.get(UserMiscInfoEnum.FAMILY_NOT_WANT)],
                  [UserMiscInfoEnum.FAMILY_NOT_SURE, MiscInfoNameMap.get(UserMiscInfoEnum.FAMILY_NOT_SURE)],
                ]}
                selected={miscInfoFamily} onValueChanged={function (id: number, checked: boolean): void {
                  updateMiscInfo(id, checked, false);
                }}></SelectModal>
            </View>

            <View style={{minWidth: 100}}>
              <SelectModal disabled={false} multi={false} minItems={0} title={i18n.t('profile.misc-info.relationship-type.title')}
                data={[
                  [UserMiscInfoEnum.RELATIONSHIP_TYPE_MONOGAMOUS, MiscInfoNameMap.get(UserMiscInfoEnum.RELATIONSHIP_TYPE_MONOGAMOUS)],
                  [UserMiscInfoEnum.RELATIONSHIP_TYPE_POLYAMOROUS, MiscInfoNameMap.get(UserMiscInfoEnum.RELATIONSHIP_TYPE_POLYAMOROUS)],
                ]}
                selected={miscInfoRelationshipType} onValueChanged={function (id: number, checked: boolean): void {
                  updateMiscInfo(id, checked, true);
                }}></SelectModal>
            </View>

            <View style={{minWidth: 100}}>
              <SelectModal disabled={false} multi={false} minItems={0} title={i18n.t('profile.misc-info.politics.title')}
                data={[
                  [UserMiscInfoEnum.POLITICS_LEFT, MiscInfoNameMap.get(UserMiscInfoEnum.POLITICS_LEFT)],
                  [UserMiscInfoEnum.POLITICS_MODERATE, MiscInfoNameMap.get(UserMiscInfoEnum.POLITICS_MODERATE)],
                  [UserMiscInfoEnum.POLITICS_RIGHT, MiscInfoNameMap.get(UserMiscInfoEnum.POLITICS_RIGHT)],
                ]}
                selected={miscInfoPolitics} onValueChanged={function (id: number, checked: boolean): void {
                  updateMiscInfo(id, checked, true);
                }}></SelectModal>
            </View>

            <View style={{minWidth: 100}}>
              <SelectModal disabled={false} multi={false} minItems={0} title={i18n.t('profile.misc-info.religion.title')}
                data={[
                  [UserMiscInfoEnum.RELIGION_YES, MiscInfoNameMap.get(UserMiscInfoEnum.RELIGION_YES)],
                  [UserMiscInfoEnum.RELIGION_NO, MiscInfoNameMap.get(UserMiscInfoEnum.RELIGION_NO)],
                ]}
                selected={miscInfoReligion} onValueChanged={function (id: number, checked: boolean): void {
                  updateMiscInfo(id, checked, true);
                }}></SelectModal>
            </View>

            <View style={{minWidth: 100}}>
              <SelectModal disabled={false} multi={false} minItems={0} title={i18n.t('profile.misc-info.drugs.alcohol')}
                data={[
                  [UserMiscInfoEnum.DRUGS_ALCOHOL, MiscInfoNameMap.get(UserMiscInfoEnum.DRUGS_ALCOHOL)],
                  [UserMiscInfoEnum.DRUGS_ALCOHOL_SOMETIMES, MiscInfoNameMap.get(UserMiscInfoEnum.DRUGS_ALCOHOL_SOMETIMES)],
                  [UserMiscInfoEnum.DRUGS_ALCOHOL_NO, MiscInfoNameMap.get(UserMiscInfoEnum.DRUGS_ALCOHOL_NO)],
                ]}
                selected={miscInfoAlcohol} onValueChanged={function (id: number, checked: boolean): void {
                  updateMiscInfo(id, checked, true);
                }}></SelectModal>
            </View>

            <View style={{minWidth: 100}}>
              <SelectModal disabled={false} multi={false} minItems={0} title={i18n.t('profile.misc-info.drugs.tobacco')}
                data={[
                  [UserMiscInfoEnum.DRUGS_TOBACCO, MiscInfoNameMap.get(UserMiscInfoEnum.DRUGS_TOBACCO)],
                  [UserMiscInfoEnum.DRUGS_TOBACCO_SOMETIMES, MiscInfoNameMap.get(UserMiscInfoEnum.DRUGS_TOBACCO_SOMETIMES)],
                  [UserMiscInfoEnum.DRUGS_TOBACCO_NO, MiscInfoNameMap.get(UserMiscInfoEnum.DRUGS_TOBACCO_NO)],
                ]}
                selected={miscInfoTobacco} onValueChanged={function (id: number, checked: boolean): void {
                  updateMiscInfo(id, checked, true);
                }}></SelectModal>
            </View>

            <View style={{minWidth: 100}}>
              <SelectModal disabled={false} multi={false} minItems={0} title={i18n.t('profile.misc-info.drugs.cannabis')}
                data={[
                  [UserMiscInfoEnum.DRUGS_CANNABIS, MiscInfoNameMap.get(UserMiscInfoEnum.DRUGS_CANNABIS)],
                  [UserMiscInfoEnum.DRUGS_CANNABIS_SOMETIMES, MiscInfoNameMap.get(UserMiscInfoEnum.DRUGS_CANNABIS_SOMETIMES)],
                  [UserMiscInfoEnum.DRUGS_CANNABIS_NO, MiscInfoNameMap.get(UserMiscInfoEnum.DRUGS_CANNABIS_NO)],
                ]}
                selected={miscInfoCannabis} onValueChanged={function (id: number, checked: boolean): void {
                  updateMiscInfo(id, checked, true);
                }}></SelectModal>
            </View>

            <View style={{minWidth: 100}}>
              <SelectModal disabled={false} multi={false} minItems={0} title={i18n.t('profile.misc-info.drugs.other')}
                data={[
                  [UserMiscInfoEnum.DRUGS_OTHER, MiscInfoNameMap.get(UserMiscInfoEnum.DRUGS_OTHER)],
                  [UserMiscInfoEnum.DRUGS_OTHER_SOMETIMES, MiscInfoNameMap.get(UserMiscInfoEnum.DRUGS_OTHER_SOMETIMES)],
                  [UserMiscInfoEnum.DRUGS_OTHER_NO, MiscInfoNameMap.get(UserMiscInfoEnum.DRUGS_OTHER_NO)],
                ]}
                selected={miscInfoHardDrugs} onValueChanged={function (id: number, checked: boolean): void {
                  updateMiscInfo(id, checked, true);
                }}></SelectModal>
            </View>

            <View style={{minWidth: 100}}>
              <SelectModal disabled={false} multi={false} minItems={0} title={i18n.t('profile.misc-info.gender-identity.title')}
                data={[
                  [UserMiscInfoEnum.GENDER_IDENTITY_CIS, MiscInfoNameMap.get(UserMiscInfoEnum.GENDER_IDENTITY_CIS)],
                  [UserMiscInfoEnum.GENDER_IDENTITY_TRANS, MiscInfoNameMap.get(UserMiscInfoEnum.GENDER_IDENTITY_TRANS)],
                ]}
                selected={miscInfoGenderIdentity} onValueChanged={function (id: number, checked: boolean): void {
                  updateMiscInfo(id, checked, true);
                }}></SelectModal>
            </View>
            
          </View>
        </View>
      </VerticalView>
    </View>
  );
};

export default ProfileSettings;
