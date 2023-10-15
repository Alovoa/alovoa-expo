import React from "react";
import {
  View,
  useWindowDimensions
} from "react-native";
import styles from "../../assets/styles";
import { UnitsEnum } from "../../types";
import * as I18N from "../../i18n";
import * as Global from "../../Global";
import * as URL from "../../URL";
import SelectModal from "../../components/SelectModal";
import VerticalView from "../../components/VerticalView";

const i18n = I18N.getI18n()

const Settings = () => {

  const { height, width } = useWindowDimensions();

  const [units, setUnits] = React.useState(UnitsEnum.SI);

  async function load() {

    let unitEnum: UnitsEnum = Number(await Global.GetStorage(Global.STORAGE_SETTINGS_UNIT));
    if (unitEnum) {
      setUnits(unitEnum);
    }
  }
  React.useEffect(() => {
    load();
  }, []);


  async function updateUnits(num: number) {
    setUnits(num);
    await Global.Fetch(Global.format(URL.USER_UPDATE_UNITS, String(num)), 'post');
    await Global.SetStorage(Global.STORAGE_SETTINGS_UNIT, String(num));
  }

  return (
    <View style={{ height: height, width: '100%' }}>
      <VerticalView onRefresh={load} style={{ padding: 0 }}>
        <View style={[styles.containerProfileItem, { marginTop: 32 }]}>
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
        </View>
      </VerticalView>
    </View>
  );
};

export default Settings;
