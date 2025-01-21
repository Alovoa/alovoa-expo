import React from "react";
import {
  View,
  useWindowDimensions
} from "react-native";
import styles from "../../assets/styles";
import { RootStackParamList, SettingsEmailEnum, SettingsEmailNameMap, UnitsEnum, UnitsNameMap, YourProfileResource } from "../../types";
import * as I18N from "../../i18n";
import * as Global from "../../Global";
import * as URL from "../../URL";
import SelectModal from "../../components/SelectModal";
import VerticalView from "../../components/VerticalView";
import ColorModal from "../../components/ColorModal";
import { MaterialBottomTabScreenProps } from "react-native-paper";


const i18n = I18N.getI18n();

type Props = MaterialBottomTabScreenProps<RootStackParamList, 'Profile.Settings'>
const Settings = ({ route }: Props) => {

  var data: YourProfileResource = route.params.data;

  const { height, width } = useWindowDimensions();
  const [units, setUnits] = React.useState(UnitsEnum.SI);
  const [emailSettings, setEmailSettings] = React.useState<Map<number, boolean>>(new Map());

  React.useEffect(() => {
    load();
  }, []);

  async function load() {
    let unitEnum: UnitsEnum = Number(await Global.GetStorage(Global.STORAGE_SETTINGS_UNIT));
    if (unitEnum) {
      setUnits(unitEnum);
    }
    let emailSettings = new Map<number, boolean>();
    data.user.userSettings.emailLike ? emailSettings.set(SettingsEmailEnum.LIKE, true) : emailSettings.set(SettingsEmailEnum.LIKE, false);
    data.user.userSettings.emailChat ? emailSettings.set(SettingsEmailEnum.CHAT, true) : emailSettings.set(SettingsEmailEnum.CHAT, false);
    setEmailSettings(emailSettings);
  }

  async function updateUnits(num: number) {
    setUnits(num);
    await Global.Fetch(Global.format(URL.USER_UPDATE_UNITS, String(num)), 'post');
    await Global.SetStorage(Global.STORAGE_SETTINGS_UNIT, String(num));
  }

  async function updateEmailSettings(id: number, checked: boolean) {
    emailSettings.set(id, checked);
    setEmailSettings(emailSettings);
    let value = checked ? URL.PATH_BOOLEAN_TRUE : URL.PATH_BOOLEAN_FALSE;
    if (id == SettingsEmailEnum.LIKE) {
      Global.Fetch(Global.format(URL.USER_SETTING_EMAIL_LIKE, value), 'post');
      data.user.userSettings.emailLike = checked;
    } else if (id == SettingsEmailEnum.CHAT) {
      Global.Fetch(Global.format(URL.USER_SETTING_EMAIL_CHAT, value), 'post');
      data.user.userSettings.emailChat = checked;
    }
  }

  return (
    <View style={{ height: height, width: '100%' }}>
      <VerticalView onRefresh={load} style={{ padding: 0 }}>
        <View style={[styles.containerProfileItem, { marginTop: 32 }]}>
          <View style={{ marginTop: 12 }}>
            <ColorModal
              title={i18n.t('profile.settings.colors.title')}>
            </ColorModal>
          </View>
          <View style={{ marginTop: 12 }}>
            <SelectModal disabled={false} multi={false} minItems={1} title={i18n.t('profile.units.title')}
              data={[
                [UnitsEnum.SI, UnitsNameMap.get(UnitsEnum.SI)],
                [UnitsEnum.IMPERIAL, UnitsNameMap.get(UnitsEnum.IMPERIAL)],
              ]}
              selected={[units]} onValueChanged={function (id: number, checked: boolean): void {
                if (checked) {
                  updateUnits(id);
                }
              }}></SelectModal>
          </View>
          <View style={{ marginTop: 12 }}>
            <SelectModal disabled={false} multi={true} minItems={0} title={i18n.t('profile.settings.notification')}
              data={[
                [SettingsEmailEnum.LIKE, SettingsEmailNameMap.get(SettingsEmailEnum.LIKE)],
                [SettingsEmailEnum.CHAT, SettingsEmailNameMap.get(SettingsEmailEnum.CHAT)],
              ]}
              selected={[...emailSettings.entries()].filter((item) => item[1]).map((item) => item[0])}
              onValueChanged={updateEmailSettings}>
            </SelectModal>
          </View>
        </View>
      </VerticalView>
    </View>
  );
};

export default Settings;
