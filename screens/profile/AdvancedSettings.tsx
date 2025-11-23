import React from "react";
import {
  View,
  useWindowDimensions
} from "react-native";
import styles from "../../assets/styles";
import { RootStackParamList, UserDto } from "../../types";
import * as I18N from "../../i18n";
import * as Global from "../../Global";
import * as URL from "../../URL";
import VerticalView from "../../components/VerticalView";
import { IconButton, TextInput, useTheme } from "react-native-paper";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

const i18n = I18N.getI18n();

type Props = BottomTabScreenProps<RootStackParamList, 'Profile.AdvancedSettings'>

const AdvancedSettings = ({ route }: Props) => {

  const user: UserDto = route.params.user;
  const { colors } = useTheme();
  const { height } = useWindowDimensions();
  const defaultTimeoutString = String(Global.DEFAULT_GPS_TIMEOUT);
  const defaultHideThresholdString = String(Global.DEFAULT_HIDE_THRESHOLD);

  React.useEffect(() => {
    load();
  }, []);

  const [latitude, setLatitude] = React.useState("0.00");
  const [longitude, setLongitude] = React.useState("0.00");
  const [gpsTimeout, setGpsTimeout] = React.useState(defaultTimeoutString);
  const [hideThreshold, setHideThreshold] = React.useState(defaultHideThresholdString);

  async function load() { 
    setLatitude(String(user.locationLatitude));
    setLongitude(String(user.locationLongitude));
    let timeoutStorage = await Global.GetStorage(Global.STORAGE_ADV_SEARCH_GPSTIMEOPUT);
    setGpsTimeout(timeoutStorage ? timeoutStorage : defaultTimeoutString);

    let hideThresholdStorage = await Global.GetStorage(Global.STORAGE_ADV_SEARCH_HIDE_THRESHOLD);
    setHideThreshold(hideThresholdStorage ? hideThresholdStorage : defaultHideThresholdString);
  }

  async function uploadLocation() {
    if(!isNaN(Number(latitude)) && !isNaN(Number(longitude))) {
      Global.Fetch(Global.format(URL.USER_UPDATE_LOCATION, latitude, longitude), 'post');
    }
  }

  async function saveGpsTimeout(value?: number) {
    if(value) {
      Global.SetStorage(Global.STORAGE_ADV_SEARCH_GPSTIMEOPUT, String(value));
    } else if(!isNaN(Number(gpsTimeout))) {
      Global.SetStorage(Global.STORAGE_ADV_SEARCH_GPSTIMEOPUT, gpsTimeout);
    }
  }

  async function saveHideThreshold(value?: number) {
    if(value) {
      Global.SetStorage(Global.STORAGE_ADV_SEARCH_HIDE_THRESHOLD, String(value));
    } else if(!isNaN(Number(hideThreshold))) {
      Global.SetStorage(Global.STORAGE_ADV_SEARCH_HIDE_THRESHOLD, hideThreshold);
    }
  }

  return (
    <View style={{ height: height, width: '100%' }}>
      <VerticalView onRefresh={load} style={{ padding: 0 , gap: 12}}>
        <View style={[styles.containerProfileItem, { gap: 4 }]}>
            <TextInput
              style={{ backgroundColor: colors.background }}
              label={i18n.t('profile.search.settings.location.latitude')}
              value={latitude}
              onChangeText={setLatitude}
              onSubmitEditing={uploadLocation}
              keyboardType="decimal-pad"
            />
            <TextInput
              style={{ backgroundColor: colors.background }}
              label={i18n.t('profile.search.settings.location.longitude')}
              value={longitude}
              onChangeText={setLongitude}
              onSubmitEditing={uploadLocation}
              keyboardType="decimal-pad"
            />
            <View style={{flexGrow: 1, alignItems: 'flex-end'}}>
              <IconButton
                icon="upload"
                size={20}
                mode="contained"
                onPress={uploadLocation}
              />
            </View>
        </View>
        <View style={[styles.containerProfileItem, {gap: 4 }]}>
            <TextInput
              style={{ backgroundColor: colors.background }}
              label={i18n.t('profile.search.settings.min-gps-timeout')}
              value={gpsTimeout}
              onChangeText={setGpsTimeout}
              onSubmitEditing={() => saveGpsTimeout()}
              keyboardType="decimal-pad"
            />         
            <View style={{flexGrow: 1, alignItems: 'flex-end', justifyContent: 'space-between', flexDirection: 'row' }}>
              <IconButton
                icon="undo-variant"
                size={20}
                mode="contained"
                onPress={() => {
                  setGpsTimeout(defaultTimeoutString);
                  saveGpsTimeout(Global.DEFAULT_GPS_TIMEOUT)
                }}
              />
              <IconButton
                icon="check"
                size={20}
                mode="contained"
                onPress={() => saveGpsTimeout()}
              />
            </View>
        </View>
        <View style={[styles.containerProfileItem, { gap: 4 }]}>
            <TextInput
              style={{ backgroundColor: colors.background }}
              label={i18n.t('profile.search.report-card-threshold')}
              value={hideThreshold}
              onChangeText={setHideThreshold}
              onSubmitEditing={() => saveHideThreshold()}
              keyboardType="decimal-pad"
            />
            <View style={{flexGrow: 1, alignItems: 'flex-end', justifyContent: 'space-between', flexDirection: 'row' }}>
              <IconButton
                icon="undo-variant"
                size={20}
                mode="contained"
                onPress={() => {
                  setHideThreshold(defaultHideThresholdString);
                  saveHideThreshold(Global.DEFAULT_HIDE_THRESHOLD)
                }}
              />
              <IconButton
                icon="check"
                size={20}
                mode="contained"
                onPress={() => saveHideThreshold()}
              />
            </View>
        </View>
      </VerticalView>
    </View>
  );
};

export default AdvancedSettings;
