import React from "react";
import {
  View,
  useWindowDimensions
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { YourProfileResource, UserDto, GenderEnum, UserIntention, Gender, IntentionE } from "../../types";
import * as I18N from "../../i18n";
import * as Global from "../../Global";
import * as URL from "../../URL";
import SelectModal from "../../components/SelectModal";
import AgeRangeSliderModal from "../../components/AgeRangeSliderModal";
import VerticalView from "../../components/VerticalView";
import { useHeaderHeight } from '@react-navigation/elements';

const i18n = I18N.getI18n()
const MIN_AGE = 18;
const MAX_AGE = 100;

const SearchSettings = ({ route, navigation }) => {

  var data: YourProfileResource = route.params.data;

  const { height, width } = useWindowDimensions();
  const headerHeight = useHeaderHeight();

  const [isLegal, setIsLegal] = React.useState(false);
  const [intention, setIntention] = React.useState(IntentionE.MEET);
  const [showIntention, setShowIntention] = React.useState(false);
  const [minAge, setMinAge] = React.useState(MIN_AGE)
  const [maxAge, setMaxAge] = React.useState(MAX_AGE)
  const [preferredGenders, setPreferredGenders] = React.useState(Array<number>);
  const [settingsIgnoreIntention, setSettingsIgnoreIntention] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [changed, setChanged] = React.useState(false);

  async function load() {
    setLoading(true);
    let response = await Global.Fetch(URL.API_RESOURCE_YOUR_PROFILE);
    let data: YourProfileResource = response.data;
    loadUser(data);
  }

  async function loadUser(data: YourProfileResource) {
    setLoading(true);
    setShowIntention(data.showIntention);
    setIsLegal(data.user.age >= MIN_AGE);
    setMinAge(data.user.preferedMinAge);
    setMaxAge(data.user.preferedMaxAge);
    setIntention(data.user.intention.id);
    setPreferredGenders(data.user.preferedGenders.map(item => item.id));
    setSettingsIgnoreIntention(data["settings.ignoreIntention"]);
    setLoading(false);
  }

  React.useEffect(() => {
    if (data) {
      loadUser(data);
    }
  }, []);

  React.useEffect(() => {
    if (changed) {
      Global.SetStorage(Global.STORAGE_RELOAD_SEARCH, "true");
    }
  }, [changed]);

  async function updateIntention(num: number) {
    await Global.Fetch(Global.format(URL.USER_UPDATE_INTENTION, String(num)), 'post');
    Global.ShowToast(i18n.t('profile.intention-toast'));
    setIntention(num);
    setShowIntention(false);

    let intention: UserIntention = { id: num, text: "" };
    data.user.intention = intention;
    setChanged(true);
  }

  async function updateGenders(genderId: number, state: boolean) {
    await Global.Fetch(Global.format(URL.USER_UPDATE_PREFERED_GENDER, genderId, state ? "1" : "0"), 'post');
    if (state) {
      let gender: Gender = {
        id: genderId,
        text: ""
      };
      data.user.preferedGenders.push(gender);
    } else {
      data.user.preferedGenders.forEach((item, index) => {
        if (item.id == genderId) data.user.preferedGenders.splice(index, 1);
      });
    }
    setChanged(true);
  }

  async function updateMinAge(num: number) {
    await Global.Fetch(Global.format(URL.USER_UPDATE_MIN_AGE, String(num)), 'post');
    setMinAge(num);
    data.user.preferedMinAge = num;
    setChanged(true);
  }

  async function updateMaxAge(num: number) {
    await Global.Fetch(Global.format(URL.USER_UPDATE_MAX_AGE, String(num)), 'post');
    setMaxAge(num);
    data.user.preferedMaxAge = num;
    setChanged(true);
  }

  return (
    <View style={{ height: height - headerHeight }}>
      {loading &&
        <View style={{ height: height, width: width, zIndex: 1, justifyContent: 'center', alignItems: 'center', position: "absolute" }}>
          <ActivityIndicator animating={loading} size="large" />
        </View>
      }

      <VerticalView onRefresh={load}>
        <View style={{ gap: 12 }}>
          {!settingsIgnoreIntention &&
            <View>
              <SelectModal disabled={!showIntention} multi={false} minItems={1} title={i18n.t('profile.intention.title')}
                data={[{ id: IntentionE.MEET, title: i18n.t('profile.intention.meet') },
                { id: IntentionE.DATE, title: i18n.t('profile.intention.date') },
                { id: IntentionE.SEX, title: i18n.t('profile.intention.sex') }]}
                selected={[intention]} onValueChanged={function (id: number, checked: boolean): void {
                  updateIntention(id);
                }}></SelectModal>
            </View>
          }

          <View>
            <SelectModal disabled={false} multi={true} minItems={1} title={i18n.t('profile.gender')} data={[{ id: GenderEnum.MALE, title: i18n.t('gender.male') },
            { id: GenderEnum.FEMALE, title: i18n.t('gender.female') }, { id: GenderEnum.OTHER, title: i18n.t('gender.other') }]}
              selected={preferredGenders} onValueChanged={function (id: number, checked: boolean): void {
                updateGenders(id, checked);
              }}></SelectModal>
          </View>

          {isLegal &&
            <View>
              <AgeRangeSliderModal title={i18n.t('profile.preferred-age-range')} titleLower={i18n.t('profile.age.min')} titleUpper={i18n.t('profile.age.max')}
                valueLower={minAge} valueUpper={maxAge} onValueLowerChanged={updateMinAge} onValueUpperChanged={updateMaxAge}></AgeRangeSliderModal>
            </View>
          }

        </View>
      </VerticalView>
    </View>
  );
};

export default SearchSettings;
